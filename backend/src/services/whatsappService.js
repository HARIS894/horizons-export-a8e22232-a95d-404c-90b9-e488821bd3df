import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { isSupabaseEnabled, supabaseAdmin } from '../config/supabase.js';
import { whatsappLogModel } from '../models/whatsappLogModel.js';
import { resourceServices } from './resourceServices.js';
import { ApiError } from '../utils/ApiError.js';
import { renderWhatsappTemplate, supportedWhatsappTemplateTypes } from '../templates/whatsappTemplates.js';

const META_TIMEOUT_MS = 15000;
const DEFAULT_AUTO_REPLY = 'Hello! Thank you for contacting InstantCare. How can we help you today?';
const INBOUND_TEMPLATE_TYPE = 'inbound-message';
const INBOUND_REPLY_TEMPLATE_TYPE = 'inbound-reply';
const SUCCESSFUL_REPLY_STATUSES = new Set(['sent', 'delivered', 'read']);
const RETRIABLE_LOG_STATUSES = new Set(['queued', 'failed']);

const nowIso = () => new Date().toISOString();

const isWhatsappConfigured = () => Boolean(env.whatsappAccessToken && env.whatsappPhoneNumberId);

const logWhatsapp = (level, event, details = {}) => {
  logger[level]({ event, channel: 'whatsapp', ...details }, event);
};

const normalizeRecipients = (to) => {
  const list = Array.isArray(to) ? to : [to];
  return list.filter(Boolean);
};

const getRetryTimestamp = (attemptCount) => {
  const minutes = env.whatsappRetryDelayMinutes * Math.max(attemptCount, 1);
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
};

const getMessageText = (message) => (message?.text?.body || '').trim();

const getStoredInboundBody = (message) => getMessageText(message) || `[${message?.type || 'unknown'}]`;

const mergeMetadata = (record, extra) => ({
  ...(record?.metadata || {}),
  ...extra,
});

const getProviderMessageId = (delivery) => delivery?.response?.messages?.[0]?.id || null;

const toErrorMessage = (error) => (error instanceof Error ? error.message : 'Unknown error');

const toErrorDetails = (error) => {
  if (error instanceof ApiError) {
    return error.details || { error: error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: 'Unknown error' };
};

const buildNotificationPayload = ({ recipientUserId, patientId, appointmentId, subject, message, metadata }) => ({
  recipient_user_id: recipientUserId || null,
  patient_id: patientId || null,
  appointment_id: appointmentId || null,
  channel: 'whatsapp',
  status: 'queued',
  subject: subject || 'InstantCare WhatsApp message',
  message,
  scheduled_for: metadata?.scheduledFor || null,
  metadata: metadata || {},
});

const buildWhatsAppLogPayload = ({
  notificationId,
  patientId,
  appointmentId,
  invoiceId,
  recipientUserId,
  templateType,
  to,
  messageBody,
  status = 'queued',
  attemptCount = 0,
  maxAttempts = env.whatsappMaxRetries,
  nextRetryAt = null,
  lastError = null,
  providerMessageId = null,
  direction = 'outbound',
  webhookPayload = {},
  providerResponse = {},
  sentAt = null,
  deliveredAt = null,
  readAt = null,
}) => ({
  notification_id: notificationId || null,
  patient_id: patientId || null,
  appointment_id: appointmentId || null,
  invoice_id: invoiceId || null,
  recipient_user_id: recipientUserId || null,
  whatsapp_type: templateType,
  phone_number_id: env.whatsappPhoneNumberId || null,
  recipient_phone: to,
  template_name: templateType,
  message_body: messageBody,
  status,
  attempt_count: attemptCount,
  max_attempts: maxAttempts,
  next_retry_at: nextRetryAt,
  last_error: lastError,
  provider_message_id: providerMessageId,
  idempotency_key: randomUUID(),
  direction,
  webhook_payload: webhookPayload,
  provider_response: providerResponse,
  sent_at: sentAt,
  delivered_at: deliveredAt,
  read_at: readAt,
});

const parseWebhookPayload = (payload) => {
  const changes = Array.isArray(payload?.entry)
    ? payload.entry.flatMap((entry) => (Array.isArray(entry?.changes) ? entry.changes : []))
    : [];

  const values = changes.map((change) => change?.value).filter(Boolean);
  const statusEnvelopes = values.flatMap((value) => (
    Array.isArray(value?.statuses)
      ? value.statuses.map((status) => ({ status, value }))
      : []
  ));
  const messageEnvelopes = values.flatMap((value) => (
    Array.isArray(value?.messages)
      ? value.messages.map((message) => ({ message, value }))
      : []
  ));

  return { statusEnvelopes, messageEnvelopes };
};

const normalizeMetaError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error?.name === 'AbortError') {
    return new ApiError(504, 'WhatsApp Cloud API request timed out.', { timeoutMs: META_TIMEOUT_MS });
  }

  return new ApiError(502, 'WhatsApp Cloud API request failed.', { error: toErrorMessage(error) });
};

const safeReadJson = async (response) => response.json().catch(() => ({}));

const queryWhatsAppLog = async ({ direction, templateName, providerMessageId, inboundMessageId, statuses }) => {
  if (isSupabaseEnabled) {
    let request = supabaseAdmin.from('whatsapp_logs').select('*');

    if (direction) {
      request = request.eq('direction', direction);
    }

    if (templateName) {
      request = request.eq('template_name', templateName);
    }

    if (providerMessageId) {
      request = request.eq('provider_message_id', providerMessageId);
    }

    if (inboundMessageId) {
      request = request.contains('webhook_payload', { inboundMessageId });
    }

    if (statuses?.length) {
      request = request.in('status', statuses);
    }

    const { data, error } = await request.order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (error) {
      throw new ApiError(500, 'Failed to query WhatsApp logs.', error);
    }

    return data || null;
  }

  const result = await whatsappLogModel.list({
    page: 1,
    limit: 250,
    ...(direction ? { direction } : {}),
    ...(templateName ? { template_name: templateName } : {}),
    ...(providerMessageId ? { provider_message_id: providerMessageId } : {}),
  });

  return result.items.find((item) => {
    if (inboundMessageId && item.webhook_payload?.inboundMessageId !== inboundMessageId) {
      return false;
    }

    if (statuses?.length && !statuses.includes(item.status)) {
      return false;
    }

    return true;
  }) || null;
};

const findInboundLogByMessageId = async (inboundMessageId) => {
  if (!inboundMessageId) {
    return null;
  }

  return queryWhatsAppLog({
    direction: 'inbound',
    providerMessageId: inboundMessageId,
  });
};

const findSuccessfulReplyByInboundMessageId = async (inboundMessageId) => {
  if (!inboundMessageId) {
    return null;
  }

  return queryWhatsAppLog({
    direction: 'outbound',
    templateName: INBOUND_REPLY_TEMPLATE_TYPE,
    inboundMessageId,
    statuses: [...SUCCESSFUL_REPLY_STATUSES],
  });
};

const findOutboundLogByProviderMessageId = async (providerMessageId) => {
  if (!providerMessageId) {
    return null;
  }

  return queryWhatsAppLog({
    direction: 'outbound',
    providerMessageId,
  });
};

const updateStatuses = async ({ notificationId, whatsappLogId, notificationPayload, whatsappLogPayload }) => {
  const updates = [];

  if (notificationId && notificationPayload) {
    updates.push(resourceServices.notifications.update(notificationId, notificationPayload));
  }

  if (whatsappLogId && whatsappLogPayload) {
    updates.push(whatsappLogModel.update(whatsappLogId, whatsappLogPayload));
  }

  if (updates.length) {
    await Promise.all(updates);
  }
};

const mapWebhookStatus = (status) => {
  if (status === 'sent') {
    return 'sent';
  }

  if (status === 'delivered') {
    return 'delivered';
  }

  if (status === 'read') {
    return 'read';
  }

  if (status === 'failed') {
    return 'failed';
  }

  return 'queued';
};

const buildStatusTimestamps = (status) => {
  const timestamp = nowIso();

  if (status === 'sent') {
    return { sent_at: timestamp };
  }

  if (status === 'delivered') {
    return { delivered_at: timestamp };
  }

  if (status === 'read') {
    return { read_at: timestamp };
  }

  return {};
};

const sendViaWhatsappCloud = async ({ to, body, context = {} }) => {
  const logContext = {
    recipientPhone: to,
    phoneNumberId: env.whatsappPhoneNumberId || null,
    ...context,
  };

  if (!isWhatsappConfigured()) {
    logWhatsapp('warn', 'BEFORE META SEND', {
      ...logContext,
      skipped: true,
      reason: 'WhatsApp Cloud API credentials are not configured.',
    });

    return {
      sent: false,
      queued: true,
      provider: 'whatsapp-cloud-api',
      reason: 'WhatsApp Cloud API credentials are not configured.',
    };
  }

  const endpoint = `https://graph.facebook.com/${env.whatsappApiVersion}/${env.whatsappPhoneNumberId}/messages`;
  const requestBody = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      body,
    },
  };

  logWhatsapp('info', 'BEFORE META SEND', {
    ...logContext,
    endpoint,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), META_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.whatsappAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    const responseBody = await safeReadJson(response);

    logWhatsapp('info', 'META RESPONSE', {
      ...logContext,
      ok: response.ok,
      statusCode: response.status,
      responseBody,
    });

    if (!response.ok) {
      throw new ApiError(502, 'WhatsApp Cloud API request failed.', responseBody);
    }

    return {
      sent: true,
      queued: false,
      provider: 'whatsapp-cloud-api',
      response: responseBody,
    };
  } catch (error) {
    const normalizedError = normalizeMetaError(error);

    logWhatsapp('error', 'META RESPONSE', {
      ...logContext,
      error: normalizedError.message,
      details: normalizedError.details,
    });

    throw normalizedError;
  } finally {
    clearTimeout(timeoutId);
  }
};

const createOutboundNotification = async ({ recipientUserId, patientId, appointmentId, subject, message, metadata }) => (
  resourceServices.notifications.create(
    buildNotificationPayload({
      recipientUserId,
      patientId,
      appointmentId,
      subject,
      message,
      metadata,
    }),
  )
);

const createOutboundLogFromDelivery = async ({
  notification,
  patientId,
  appointmentId,
  invoiceId,
  recipientUserId,
  templateType,
  recipientPhone,
  messageBody,
  delivery,
  error,
  webhookPayload,
}) => {
  const providerMessageId = getProviderMessageId(delivery);
  const sentAt = delivery?.sent ? nowIso() : null;
  const attempted = Boolean(delivery?.sent || error);
  const attemptCount = attempted ? 1 : 0;
  const canRetry = error ? attemptCount < env.whatsappMaxRetries : false;

  const logPayload = buildWhatsAppLogPayload({
    notificationId: notification.id,
    patientId,
    appointmentId,
    invoiceId,
    recipientUserId,
    templateType,
    to: recipientPhone,
    messageBody,
    status: error ? 'failed' : delivery.sent ? 'sent' : 'queued',
    attemptCount,
    nextRetryAt: error && canRetry ? getRetryTimestamp(attemptCount) : null,
    lastError: error ? error.message : null,
    providerMessageId,
    direction: 'outbound',
    webhookPayload,
    providerResponse: error ? toErrorDetails(error) : delivery.sent ? delivery.response : {
      provider: delivery.provider,
      reason: delivery.reason,
    },
    sentAt,
  });

  const log = await whatsappLogModel.create(logPayload);

  logWhatsapp('info', 'OUTBOUND SAVED', {
    templateType,
    recipientPhone,
    notificationId: notification.id,
    whatsappLogId: log.id,
    status: log.status,
    providerMessageId,
  });

  return log;
};

const updateNotificationFromDelivery = async ({ notification, delivery, error }) => {
  const providerMessageId = getProviderMessageId(delivery);
  const sentAt = delivery?.sent ? nowIso() : null;

  if (error) {
    return resourceServices.notifications.update(notification.id, {
      status: 'failed',
      metadata: mergeMetadata(notification, {
        provider: 'whatsapp-cloud-api',
        lastError: error.message,
      }),
    });
  }

  if (!delivery.sent) {
    return resourceServices.notifications.update(notification.id, {
      status: 'queued',
      metadata: mergeMetadata(notification, {
        provider: delivery.provider,
        reason: delivery.reason,
      }),
    });
  }

  return resourceServices.notifications.update(notification.id, {
    status: 'sent',
    sent_at: sentAt,
    external_reference: providerMessageId,
    metadata: mergeMetadata(notification, {
      provider: delivery.provider,
    }),
  });
};

const deliverOutboundMessage = async ({
  recipientPhone,
  subject,
  messageBody,
  templateType,
  recipientUserId = null,
  patientId = null,
  appointmentId = null,
  invoiceId = null,
  notificationMetadata = {},
  webhookPayload = {},
}) => {
  const notification = await createOutboundNotification({
    recipientUserId,
    patientId,
    appointmentId,
    subject,
    message: messageBody,
    metadata: notificationMetadata,
  });

  let delivery = null;
  let sendError = null;

  try {
    delivery = await sendViaWhatsappCloud({
      to: recipientPhone,
      body: messageBody,
      context: {
        templateType,
        notificationId: notification.id,
      },
    });
  } catch (error) {
    sendError = error;
  }

  const log = await createOutboundLogFromDelivery({
    notification,
    patientId,
    appointmentId,
    invoiceId,
    recipientUserId,
    templateType,
    recipientPhone,
    messageBody,
    delivery,
    error: sendError,
    webhookPayload,
  });
  const updatedNotification = await updateNotificationFromDelivery({
    notification,
    delivery,
    error: sendError,
  });

  return {
    notification: updatedNotification,
    log,
    delivery,
    error: sendError,
  };
};

const ensureInboundLog = async ({ message, value }) => {
  const inboundMessageId = message?.id || null;
  const existingLog = await findInboundLogByMessageId(inboundMessageId);

  if (existingLog) {
    logWhatsapp('info', 'INBOUND SAVED', {
      inboundMessageId,
      whatsappLogId: existingLog.id,
      duplicate: true,
      messageType: message?.type || 'unknown',
      recipientPhone: message?.from || null,
    });

    return { log: existingLog, duplicate: true };
  }

  const messageBody = getStoredInboundBody(message);
  const log = await whatsappLogModel.create(
    buildWhatsAppLogPayload({
      templateType: INBOUND_TEMPLATE_TYPE,
      to: message?.from || 'unknown',
      messageBody,
      status: 'read',
      attemptCount: 1,
      providerMessageId: inboundMessageId,
      direction: 'inbound',
      webhookPayload: {
        inboundMessageId,
        inboundMessageBody: messageBody,
        inboundMessageType: message?.type || 'unknown',
        rawMessage: message,
      },
      providerResponse: value || {},
      readAt: nowIso(),
    }),
  );

  logWhatsapp('info', 'INBOUND SAVED', {
    inboundMessageId,
    whatsappLogId: log.id,
    duplicate: false,
    messageType: message?.type || 'unknown',
    recipientPhone: message?.from || null,
  });

  return { log, duplicate: false };
};

const buildRetryOutcome = ({ log, delivery, error }) => {
  const attemptCount = Number(log.attempt_count || 0) + (delivery?.sent || error ? 1 : 0);
  const canRetry = attemptCount < Number(log.max_attempts || env.whatsappMaxRetries);
  const providerMessageId = getProviderMessageId(delivery);
  const sentAt = delivery?.sent ? nowIso() : null;

  if (error) {
    return {
      logPayload: {
        status: 'failed',
        attempt_count: attemptCount,
        last_error: error.message,
        next_retry_at: canRetry ? getRetryTimestamp(attemptCount) : null,
        provider_response: toErrorDetails(error),
      },
      notificationPayload: {
        status: 'failed',
      },
    };
  }

  if (!delivery.sent) {
    return {
      logPayload: {
        status: 'queued',
        next_retry_at: getRetryTimestamp(Number(log.attempt_count || 0) + 1),
        provider_response: {
          provider: delivery.provider,
          reason: delivery.reason,
        },
      },
      notificationPayload: {
        status: 'queued',
      },
    };
  }

  return {
    logPayload: {
      status: 'sent',
      attempt_count: attemptCount,
      last_error: null,
      next_retry_at: null,
      sent_at: sentAt,
      provider_message_id: providerMessageId,
      provider_response: delivery.response,
    },
    notificationPayload: {
      status: 'sent',
      sent_at: sentAt,
      external_reference: providerMessageId,
    },
  };
};

const processStatusUpdate = async (statusEnvelope, summary) => {
  const { status } = statusEnvelope;
  const providerMessageId = status?.id || null;

  if (!providerMessageId) {
    summary.statusUpdatesSkipped += 1;
    return;
  }

  const existingLog = await findOutboundLogByProviderMessageId(providerMessageId);

  if (!existingLog) {
    summary.statusUpdatesSkipped += 1;
    logWhatsapp('info', 'DELIVERY STATUS SKIPPED', {
      providerMessageId,
      reason: 'log-not-found',
    });
    return;
  }

  const mappedStatus = mapWebhookStatus(status.status);
  const timestamps = buildStatusTimestamps(mappedStatus);

  await updateStatuses({
    notificationId: existingLog.notification_id,
    whatsappLogId: existingLog.id,
    notificationPayload: {
      status: mappedStatus,
      ...timestamps,
    },
    whatsappLogPayload: {
      status: mappedStatus,
      provider_response: status,
      ...timestamps,
    },
  });

  summary.statusUpdatesApplied += 1;
  logWhatsapp('info', 'DELIVERY STATUS UPDATED', {
    providerMessageId,
    whatsappLogId: existingLog.id,
    status: mappedStatus,
  });
};

const processInboundMessage = async (messageEnvelope, summary) => {
  const { message, value } = messageEnvelope;
  const inboundMessageId = message?.id || null;
  const contactNumber = message?.from || null;
  const messageType = message?.type || 'unknown';
  const messageBody = getMessageText(message);

  logWhatsapp('info', 'MESSAGE RECEIVED', {
    inboundMessageId,
    recipientPhone: contactNumber,
    messageType,
  });

  const inboundLogResult = await ensureInboundLog({ message, value });

  if (!inboundLogResult.duplicate) {
    summary.inboundSaved += 1;
  }

  if (!contactNumber) {
    summary.skipped.missingContact += 1;
    logWhatsapp('warn', 'DONE', {
      inboundMessageId,
      outcome: 'skipped',
      reason: 'missing-contact',
    });
    return;
  }

  if (!inboundMessageId) {
    summary.skipped.missingMessageId += 1;
    logWhatsapp('warn', 'DONE', {
      recipientPhone: contactNumber,
      outcome: 'skipped',
      reason: 'missing-message-id',
    });
    return;
  }

  if (messageType !== 'text' || !messageBody) {
    summary.skipped.unsupportedMessage += 1;
    logWhatsapp('info', 'DONE', {
      inboundMessageId,
      recipientPhone: contactNumber,
      outcome: 'skipped',
      reason: 'unsupported-message',
      messageType,
    });
    return;
  }

  logWhatsapp('info', 'DUPLICATE CHECK', {
    inboundMessageId,
    recipientPhone: contactNumber,
    messageType,
  });

  const existingReply = await findSuccessfulReplyByInboundMessageId(inboundMessageId);

  logWhatsapp('info', 'DUPLICATE CHECK', {
    inboundMessageId,
    recipientPhone: contactNumber,
    duplicate: Boolean(existingReply),
    existingReplyLogId: existingReply?.id || null,
  });

  if (existingReply) {
    summary.skipped.duplicateReply += 1;
    logWhatsapp('info', 'DONE', {
      inboundMessageId,
      recipientPhone: contactNumber,
      outcome: 'skipped',
      reason: 'duplicate-reply',
      existingReplyLogId: existingReply.id,
    });
    return;
  }

  const reply = DEFAULT_AUTO_REPLY;

  logWhatsapp('info', 'REPLY GENERATED', {
    inboundMessageId,
    recipientPhone: contactNumber,
    replyLength: reply.length,
  });

  const outbound = await deliverOutboundMessage({
    recipientPhone: contactNumber,
    subject: 'InstantCare WhatsApp message',
    messageBody: reply,
    templateType: INBOUND_REPLY_TEMPLATE_TYPE,
    notificationMetadata: {
      supportEmail: env.supportEmail,
      inboundMessageId,
      inboundMessageBody: messageBody,
    },
    webhookPayload: {
      inboundMessageId,
      inboundMessageBody: messageBody,
      inboundMessageType: messageType,
      inboundLogId: inboundLogResult.log.id,
    },
  });

  if (outbound.error) {
    summary.failed += 1;
    logWhatsapp('error', 'DONE', {
      inboundMessageId,
      recipientPhone: contactNumber,
      outcome: 'failed',
      whatsappLogId: outbound.log.id,
      error: outbound.error.message,
      details: outbound.error.details,
    });
    return;
  }

  if (!outbound.delivery.sent) {
    summary.queued += 1;
    logWhatsapp('warn', 'DONE', {
      inboundMessageId,
      recipientPhone: contactNumber,
      outcome: 'queued',
      whatsappLogId: outbound.log.id,
      reason: outbound.delivery.reason,
    });
    return;
  }

  summary.replied += 1;
  logWhatsapp('info', 'DONE', {
    inboundMessageId,
    recipientPhone: contactNumber,
    outcome: 'replied',
    whatsappLogId: outbound.log.id,
    providerMessageId: outbound.log.provider_message_id,
  });
};

export const whatsappService = {
  getTemplateTypes() {
    return supportedWhatsappTemplateTypes;
  },

  async listLogs(query = {}) {
    return whatsappLogModel.list(query);
  },

  async getLogById(id) {
    return whatsappLogModel.findById(id);
  },

  async sendTemplateMessage(payload) {
    const template = renderWhatsappTemplate(payload.templateType, payload.templateData || {});
    const recipients = normalizeRecipients(payload.to);

    if (!recipients.length) {
      throw new ApiError(400, 'At least one WhatsApp recipient number is required.');
    }

    const notifications = [];
    const logs = [];

    for (const recipient of recipients) {
      const outcome = await deliverOutboundMessage({
        recipientPhone: recipient,
        subject: template.preview,
        messageBody: template.body,
        templateType: payload.templateType,
        recipientUserId: payload.recipientUserId,
        patientId: payload.patientId,
        appointmentId: payload.appointmentId,
        invoiceId: payload.invoiceId,
        notificationMetadata: {
          templateType: payload.templateType,
          supportEmail: env.supportEmail,
          context: payload.templateData || {},
        },
        webhookPayload: {
          templateType: payload.templateType,
        },
      });

      notifications.push(outcome.notification);
      logs.push(outcome.log);

      if (outcome.error) {
        logger.error({ err: outcome.error, recipient, templateType: payload.templateType }, 'Failed to send WhatsApp message');
      }
    }

    return {
      templateType: payload.templateType,
      phoneNumberId: env.whatsappPhoneNumberId || null,
      supportEmail: env.supportEmail,
      notifications,
      logs,
      whatsappConfigured: isWhatsappConfigured(),
    };
  },

  async retryMessage(logId) {
    const log = await whatsappLogModel.findById(logId);

    if (!RETRIABLE_LOG_STATUSES.has(log.status)) {
      throw new ApiError(400, 'Only queued or failed WhatsApp messages can be retried.');
    }

    if (Number(log.attempt_count || 0) >= Number(log.max_attempts || env.whatsappMaxRetries)) {
      throw new ApiError(400, 'Maximum retry attempts reached for this WhatsApp log.');
    }

    let delivery = null;
    let sendError = null;

    try {
      delivery = await sendViaWhatsappCloud({
        to: log.recipient_phone,
        body: log.message_body,
        context: {
          templateType: log.template_name,
          retry: true,
          whatsappLogId: log.id,
        },
      });
    } catch (error) {
      sendError = error;
    }

    const outcome = buildRetryOutcome({ log, delivery, error: sendError });
    const updated = await whatsappLogModel.update(log.id, outcome.logPayload);

    if (log.notification_id) {
      await resourceServices.notifications.update(log.notification_id, outcome.notificationPayload);
    }

    if (sendError) {
      logger.error({ err: sendError, whatsappLogId: log.id }, 'WhatsApp retry failed');
      throw new ApiError(502, 'WhatsApp retry failed.', updated);
    }

    return updated;
  },

  async retryFailedMessages(limit = 25) {
    const result = await whatsappLogModel.list({ page: 1, limit, status: 'failed', sortBy: 'updated_at', sortOrder: 'desc' });
    const dueLogs = result.items.filter((log) => !log.next_retry_at || new Date(log.next_retry_at).getTime() <= Date.now());
    const processed = [];

    for (const log of dueLogs) {
      try {
        processed.push({ id: log.id, success: true, log: await this.retryMessage(log.id) });
      } catch (error) {
        processed.push({ id: log.id, success: false, error: error.message, details: error.details || null });
      }
    }

    return {
      attempted: dueLogs.length,
      processed,
    };
  },

  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token && token === env.whatsappWebhookVerifyToken) {
      return challenge;
    }

    throw new ApiError(403, 'Invalid WhatsApp webhook verification request.');
  },

  async processWebhook(payload) {
    const { statusEnvelopes, messageEnvelopes } = parseWebhookPayload(payload);
    const summary = {
      received: true,
      processed: 0,
      statusUpdatesReceived: statusEnvelopes.length,
      statusUpdatesApplied: 0,
      statusUpdatesSkipped: 0,
      inboundMessagesReceived: messageEnvelopes.length,
      inboundSaved: 0,
      replied: 0,
      queued: 0,
      failed: 0,
      skipped: {
        missingContact: 0,
        missingMessageId: 0,
        unsupportedMessage: 0,
        duplicateReply: 0,
      },
    };

    logWhatsapp('info', 'WEBHOOK RECEIVED', {
      statusUpdatesReceived: statusEnvelopes.length,
      inboundMessagesReceived: messageEnvelopes.length,
    });

    for (const statusEnvelope of statusEnvelopes) {
      try {
        await processStatusUpdate(statusEnvelope, summary);
      } catch (error) {
        summary.failed += 1;
        logger.error({ err: error, statusEnvelope }, 'Failed to process WhatsApp status update');
      }
    }

    for (const messageEnvelope of messageEnvelopes) {
      try {
        await processInboundMessage(messageEnvelope, summary);
      } catch (error) {
        summary.failed += 1;
        logger.error({ err: error, messageEnvelope }, 'Failed to process WhatsApp inbound message');
      } finally {
        summary.processed += 1;
      }
    }

    return summary;
  },
};