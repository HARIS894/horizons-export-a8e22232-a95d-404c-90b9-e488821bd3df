import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { isSupabaseEnabled, supabaseAdmin } from '../config/supabase.js';
import { whatsappContactModel } from '../models/whatsappContactModel.js';
import { whatsappConversationModel } from '../models/whatsappConversationModel.js';
import { whatsappLogModel } from '../models/whatsappLogModel.js';
import { resourceServices } from './resourceServices.js';
import { ApiError } from '../utils/ApiError.js';
import { normalizeWhatsappPhoneNumber } from '../utils/phoneNumber.js';
import { renderWhatsappTemplate, supportedWhatsappTemplateTypes } from '../templates/whatsappTemplates.js';

const META_TIMEOUT_MS = 15000;
const CUSTOMER_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_AUTO_REPLY = 'Hello! Thank you for contacting InstantCare. How can we help you today?';
const INBOUND_TEMPLATE_TYPE = 'inbound-message';
const INBOUND_REPLY_TEMPLATE_TYPE = 'inbound-reply';
const SUCCESSFUL_REPLY_STATUSES = new Set(['sent', 'delivered', 'read']);
const RETRIABLE_LOG_STATUSES = new Set(['queued', 'failed']);
const NON_RETRIABLE_META_ERROR_CODES = new Set(['131047']);
const APPROVED_META_TEMPLATE_CONFIG = {};

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

const getConversationStatus = (status) => status || 'open';

const isTemplateType = (value) => supportedWhatsappTemplateTypes.includes(value);

const mergeMetadata = (record, extra) => ({
  ...(record?.metadata || {}),
  ...extra,
});

const getProviderMessageId = (delivery) => delivery?.response?.messages?.[0]?.id || null;

const getMetaErrorPayload = (payload) => payload?.error || payload?.errors?.[0] || null;

const getFailureDetails = (payload) => {
  const error = getMetaErrorPayload(payload);
  if (!error) {
    return null;
  }

  const code = error.code || error.error_code || null;
  const details = error.error_data?.details || error.details || null;
  const message = details || error.message || error.title || null;

  if (!message && !code) {
    return null;
  }

  return {
    code: code ? String(code) : null,
    message: message || 'WhatsApp delivery failed.',
    details: details || null,
  };
};

const formatFailureMessage = (failure) => {
  if (!failure) {
    return null;
  }

  if (failure.code && failure.message) {
    return `${failure.message} (code ${failure.code})`;
  }

  return failure.message || (failure.code ? `WhatsApp delivery failed (code ${failure.code})` : null);
};

const isTemplateRequiredFailure = (failure) => {
  if (!failure) {
    return false;
  }

  if (failure.code && NON_RETRIABLE_META_ERROR_CODES.has(String(failure.code))) {
    return true;
  }

  return /customer(?: |-)?service window|24\s*hour|24-hour|re-engagement|template/i.test(`${failure.message || ''} ${failure.details || ''}`);
};

const buildTemplateRequiredError = () => new ApiError(
  409,
  'This customer has not opened a WhatsApp conversation. Please send an approved template first.',
  {
    code: 'WHATSAPP_TEMPLATE_REQUIRED',
    activeConversationWindow: false,
    approvedTemplateAvailable: false,
  },
);

const getApprovedMetaTemplateConfig = (templateType) => APPROVED_META_TEMPLATE_CONFIG[templateType] || null;

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

const isMissingColumnError = (error) => {
  const code = error?.code || error?.details?.code || null;
  const message = error?.message || error?.details?.message || '';

  return code === '42703'
    || code === 'PGRST204'
    || /column/i.test(message);
};

const isMissingRequiredUserError = (error) => {
  const message = error?.message || error?.details?.message || '';

  return /null value in column "(?:user_id|recipient_user_id)"/i.test(message)
    || /not-null constraint/i.test(message);
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
  contactId,
  conversationId,
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
}) => ({
  notification_id: notificationId || null,
  patient_id: patientId || null,
  appointment_id: appointmentId || null,
  invoice_id: invoiceId || null,
  recipient_user_id: recipientUserId || null,
  contact_id: contactId || null,
  conversation_id: conversationId || null,
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
});

const getContactDisplayName = (contact, phoneNumber) => {
  const name = String(contact?.name || '').trim();
  return name || phoneNumber;
};

const ensureWhatsappContact = async ({ phoneNumber, name = '', notes, autoCreateName = true }) => {
  const normalizedPhoneNumber = normalizeWhatsappPhoneNumber(phoneNumber);
  const existing = await whatsappContactModel.findByPhoneNumber(normalizedPhoneNumber);
  const nextName = String(name || '').trim() || existing?.name || (autoCreateName ? normalizedPhoneNumber : '');

  if (existing) {
    const updatePayload = {};

    if (nextName && nextName !== existing.name) {
      updatePayload.name = nextName;
    }

    if (notes !== undefined && (notes || null) !== (existing.notes || null)) {
      updatePayload.notes = notes || null;
    }

    if (!Object.keys(updatePayload).length) {
      return existing;
    }

    return whatsappContactModel.update(existing.id, updatePayload);
  }

  return whatsappContactModel.create({
    name: nextName || normalizedPhoneNumber,
    phone_number: normalizedPhoneNumber,
    notes: notes || null,
  });
};

const ensureWhatsappConversation = async ({ contactId = null, phoneNumber, unreadDelta = 0, status = 'open', lastMessageAt = nowIso() }) => {
  const normalizedPhoneNumber = normalizeWhatsappPhoneNumber(phoneNumber);
  const existing = await whatsappConversationModel.findByPhoneNumber(normalizedPhoneNumber);

  if (existing) {
    const nextUnreadCount = Math.max(0, Number(existing.unread_count || 0) + Number(unreadDelta || 0));
    return whatsappConversationModel.update(existing.id, {
      contact_id: contactId || existing.contact_id || null,
      status: getConversationStatus(status),
      unread_count: nextUnreadCount,
      last_message_at: lastMessageAt,
    });
  }

  return whatsappConversationModel.create({
    contact_id: contactId || null,
    phone_number: normalizedPhoneNumber,
    status: getConversationStatus(status),
    unread_count: Math.max(0, Number(unreadDelta || 0)),
    last_message_at: lastMessageAt,
  });
};

const ensureWhatsappThread = async ({ phoneNumber, name = '', notes, unreadDelta = 0, autoCreateName = true, lastMessageAt = nowIso() }) => {
  const contact = await ensureWhatsappContact({ phoneNumber, name, notes, autoCreateName });
  const conversation = await ensureWhatsappConversation({
    contactId: contact.id,
    phoneNumber: contact.phone_number,
    unreadDelta,
    lastMessageAt,
  });

  return {
    contact,
    conversation,
    phoneNumber: contact.phone_number,
  };
};

const getLatestLogForPhoneNumber = async (phoneNumber) => {
  const result = await whatsappLogModel.list({
    page: 1,
    limit: 1,
    recipient_phone: phoneNumber,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  return result.items[0] || null;
};

const getLatestInboundLogForPhoneNumber = async (phoneNumber) => {
  const result = await whatsappLogModel.list({
    page: 1,
    limit: 1,
    recipient_phone: phoneNumber,
    direction: 'inbound',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  return result.items[0] || null;
};

const getConversationWindowState = async (phoneNumber) => {
  const normalizedPhoneNumber = normalizeWhatsappPhoneNumber(phoneNumber);
  const latestInboundLog = await getLatestInboundLogForPhoneNumber(normalizedPhoneNumber);
  const lastInboundAt = latestInboundLog ? getLogTimestamp(latestInboundLog) : null;

  if (!lastInboundAt) {
    return {
      active: false,
      lastInboundAt: null,
      expiresAt: null,
      templateRequired: true,
      approvedTemplateAvailable: false,
    };
  }

  const openedAtMs = new Date(lastInboundAt).getTime();
  const expiresAtMs = openedAtMs + CUSTOMER_SERVICE_WINDOW_MS;
  const active = Number.isFinite(openedAtMs) && expiresAtMs > Date.now();

  return {
    active,
    lastInboundAt,
    expiresAt: new Date(expiresAtMs).toISOString(),
    templateRequired: !active,
    approvedTemplateAvailable: false,
  };
};

const getLogTimestamp = (log) => log?.created_at || log?.createdAt || log?.updated_at || log?.updatedAt || null;

const annotateLog = (log, { activeConversationWindow }) => {
  const failure = getFailureDetails(log?.provider_response) || (log?.last_error ? { code: null, message: log.last_error, details: null } : null);
  const isManualFreeform = log?.template_name === 'manual';
  const canRetry = RETRIABLE_LOG_STATUSES.has(log?.status)
    && !(isManualFreeform && !activeConversationWindow)
    && !isTemplateRequiredFailure(failure);

  return {
    ...log,
    message_kind: isTemplateType(log?.template_name) ? 'template' : isManualFreeform ? 'freeform' : log?.direction === 'inbound' ? 'inbound' : 'freeform',
    delivery_failure_code: failure?.code || null,
    delivery_failure_reason: formatFailureMessage(failure),
    can_retry: canRetry,
    retry_block_reason: canRetry
      ? null
      : isManualFreeform && !activeConversationWindow
        ? 'Outside the active customer-service window.'
        : isTemplateRequiredFailure(failure)
          ? 'This free-form message requires an approved template first.'
          : null,
  };
};

const buildConversationSummary = async (conversation, contactsById) => {
  const latestLog = await getLatestLogForPhoneNumber(conversation.phone_number);
  const contact = conversation.contact_id ? contactsById.get(conversation.contact_id) || null : null;
  const customerServiceWindow = await getConversationWindowState(conversation.phone_number);

  return {
    ...conversation,
    contact,
    display_name: getContactDisplayName(contact, conversation.phone_number),
    last_message_preview: latestLog ? latestLog.message_body : '',
    latest_log: latestLog ? annotateLog(latestLog, { activeConversationWindow: customerServiceWindow.active }) : null,
    customer_service_window: customerServiceWindow,
    can_send_freeform: customerServiceWindow.active,
    can_send_template: customerServiceWindow.approvedTemplateAvailable,
  };
};

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

const createOutboundNotification = async ({ recipientUserId, patientId, appointmentId, subject, message, metadata, templateType, recipientPhone }) => {
  if (!recipientUserId) {
    logWhatsapp('warn', 'NOTIFICATION SAVE SKIPPED', {
      templateType,
      recipientPhone,
      subject,
      reason: 'missing-recipient-user-id',
    });

    return null;
  }

  try {
    return await resourceServices.notifications.create(
      buildNotificationPayload({
        recipientUserId,
        patientId,
        appointmentId,
        subject,
        message,
        metadata,
      }),
    );
  } catch (error) {
    logWhatsapp('warn', 'NOTIFICATION SAVE SKIPPED', {
      templateType,
      recipientPhone,
      subject,
      reason: isMissingColumnError(error)
        ? 'notification-schema-mismatch'
        : isMissingRequiredUserError(error)
          ? 'notification-user-required'
          : 'notification-create-failed',
      error: error.message,
      details: error.details,
    });

    return null;
  }
};

const createOutboundLogFromDelivery = async ({
  notification,
  patientId,
  appointmentId,
  invoiceId,
  recipientUserId,
  contactId,
  conversationId,
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
  const failure = error ? getFailureDetails(toErrorDetails(error)) : null;
  const canRetry = error ? attemptCount < env.whatsappMaxRetries && !isTemplateRequiredFailure(failure) : false;

  const logPayload = buildWhatsAppLogPayload({
    notificationId: notification?.id || null,
    patientId,
    appointmentId,
    invoiceId,
    recipientUserId,
    contactId,
    conversationId,
    templateType,
    to: recipientPhone,
    messageBody,
    status: error ? 'failed' : delivery.sent ? 'sent' : 'queued',
    attemptCount,
    nextRetryAt: error && canRetry ? getRetryTimestamp(attemptCount) : null,
    lastError: error ? formatFailureMessage(failure) || error.message : null,
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
    notificationId: notification?.id || null,
    whatsappLogId: log.id,
    status: log.status,
    providerMessageId,
  });

  return log;
};

const updateNotificationFromDelivery = async ({ notification, delivery, error }) => {
  if (!notification?.id) {
    return null;
  }

  const providerMessageId = getProviderMessageId(delivery);
  const sentAt = delivery?.sent ? nowIso() : null;

  if (error) {
    const failure = getFailureDetails(toErrorDetails(error));
    return resourceServices.notifications.update(notification.id, {
      status: 'failed',
      metadata: mergeMetadata(notification, {
        provider: 'whatsapp-cloud-api',
        lastError: formatFailureMessage(failure) || error.message,
        errorCode: failure?.code || null,
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
  contactId = null,
  conversationId = null,
  notificationMetadata = {},
  webhookPayload = {},
}) => {
  const thread = conversationId && contactId
    ? {
        phoneNumber: normalizeWhatsappPhoneNumber(recipientPhone),
        contact: {
          id: contactId,
          phone_number: normalizeWhatsappPhoneNumber(recipientPhone),
        },
        conversation: {
          id: conversationId,
        },
      }
    : await ensureWhatsappThread({
        phoneNumber: recipientPhone,
        unreadDelta: 0,
        autoCreateName: true,
        lastMessageAt: nowIso(),
      });

  const notification = await createOutboundNotification({
    recipientUserId,
    patientId,
    appointmentId,
    subject,
    message: messageBody,
    metadata: notificationMetadata,
    templateType,
    recipientPhone: thread.phoneNumber,
  });

  let delivery = null;
  let sendError = null;

  try {
    delivery = await sendViaWhatsappCloud({
      to: thread.phoneNumber,
      body: messageBody,
      context: {
        templateType,
        notificationId: notification?.id || null,
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
    contactId: thread.contact.id,
    conversationId: thread.conversation.id,
    templateType,
    recipientPhone: thread.phoneNumber,
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

const ensureInboundLog = async ({ message, value, phoneNumber, contactId, conversationId }) => {
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
      contactId,
      conversationId,
      templateType: INBOUND_TEMPLATE_TYPE,
      to: phoneNumber || message?.from || 'unknown',
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
  const failure = error ? getFailureDetails(toErrorDetails(error)) : null;
  const canRetry = attemptCount < Number(log.max_attempts || env.whatsappMaxRetries) && !isTemplateRequiredFailure(failure);
  const providerMessageId = getProviderMessageId(delivery);
  const sentAt = delivery?.sent ? nowIso() : null;

  if (error) {
    return {
      logPayload: {
        status: 'failed',
        attempt_count: attemptCount,
        last_error: formatFailureMessage(failure) || error.message,
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
  const failure = getFailureDetails(status);

  await updateStatuses({
    notificationId: existingLog.notification_id,
    whatsappLogId: existingLog.id,
    notificationPayload: {
      status: mappedStatus,
      ...timestamps,
    },
    whatsappLogPayload: {
      status: mappedStatus,
      last_error: mappedStatus === 'failed' ? formatFailureMessage(failure) : null,
      next_retry_at: mappedStatus === 'failed' && !isTemplateRequiredFailure(failure)
        ? existingLog.next_retry_at
        : null,
      provider_response: status,
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

  if (!contactNumber) {
    summary.skipped.missingContact += 1;
    logWhatsapp('warn', 'DONE', {
      inboundMessageId,
      outcome: 'skipped',
      reason: 'missing-contact',
    });
    return;
  }

  const thread = await ensureWhatsappThread({
    phoneNumber: contactNumber,
    unreadDelta: 1,
    autoCreateName: true,
    lastMessageAt: nowIso(),
  });

  const normalizedContactNumber = thread.phoneNumber;

  logWhatsapp('info', 'MESSAGE RECEIVED', {
    inboundMessageId,
    recipientPhone: normalizedContactNumber,
    messageType,
  });

  const inboundLogResult = await ensureInboundLog({
    message,
    value,
    phoneNumber: normalizedContactNumber,
    contactId: thread.contact.id,
    conversationId: thread.conversation.id,
  });

  if (!inboundLogResult.duplicate) {
    summary.inboundSaved += 1;
  }

  if (!inboundMessageId) {
    summary.skipped.missingMessageId += 1;
    logWhatsapp('warn', 'DONE', {
      recipientPhone: normalizedContactNumber,
      outcome: 'skipped',
      reason: 'missing-message-id',
    });
    return;
  }

  if (messageType !== 'text' || !messageBody) {
    summary.skipped.unsupportedMessage += 1;
    logWhatsapp('info', 'DONE', {
      inboundMessageId,
      recipientPhone: normalizedContactNumber,
      outcome: 'skipped',
      reason: 'unsupported-message',
      messageType,
    });
    return;
  }

  logWhatsapp('info', 'DUPLICATE CHECK', {
    inboundMessageId,
    recipientPhone: normalizedContactNumber,
    messageType,
  });

  const existingReply = await findSuccessfulReplyByInboundMessageId(inboundMessageId);

  logWhatsapp('info', 'DUPLICATE CHECK', {
    inboundMessageId,
    recipientPhone: normalizedContactNumber,
    duplicate: Boolean(existingReply),
    existingReplyLogId: existingReply?.id || null,
  });

  if (existingReply) {
    summary.skipped.duplicateReply += 1;
    logWhatsapp('info', 'DONE', {
      inboundMessageId,
      recipientPhone: normalizedContactNumber,
      outcome: 'skipped',
      reason: 'duplicate-reply',
      existingReplyLogId: existingReply.id,
    });
    return;
  }

  const reply = DEFAULT_AUTO_REPLY;

  logWhatsapp('info', 'REPLY GENERATED', {
    inboundMessageId,
    recipientPhone: normalizedContactNumber,
    replyLength: reply.length,
  });

  const outbound = await deliverOutboundMessage({
    recipientPhone: normalizedContactNumber,
    subject: 'InstantCare WhatsApp message',
    messageBody: reply,
    templateType: INBOUND_REPLY_TEMPLATE_TYPE,
    contactId: thread.contact.id,
    conversationId: thread.conversation.id,
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
      recipientPhone: normalizedContactNumber,
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
      recipientPhone: normalizedContactNumber,
      outcome: 'queued',
      whatsappLogId: outbound.log.id,
      reason: outbound.delivery.reason,
    });
    return;
  }

  summary.replied += 1;
  logWhatsapp('info', 'DONE', {
    inboundMessageId,
    recipientPhone: normalizedContactNumber,
    outcome: 'replied',
    whatsappLogId: outbound.log.id,
    providerMessageId: outbound.log.provider_message_id,
  });
};

export const whatsappService = {
  getTemplateTypes() {
    return supportedWhatsappTemplateTypes;
  },
async sendManualMessage({
  to,
  message,
  recipientUserId = null,
  patientId = null,
  appointmentId = null,
}) {
  const recipientPhone = normalizeWhatsappPhoneNumber(to);
  const messageBody = String(message || '').trim();

  if (!recipientPhone) {
    throw new ApiError(400, 'WhatsApp recipient number is required.');
  }

  if (!messageBody) {
    throw new ApiError(400, 'WhatsApp message is required.');
  }

  const customerServiceWindow = await getConversationWindowState(recipientPhone);

  if (!customerServiceWindow.active) {
    throw buildTemplateRequiredError();
  }

  const thread = await ensureWhatsappThread({
    phoneNumber: recipientPhone,
    unreadDelta: 0,
    autoCreateName: true,
    lastMessageAt: nowIso(),
  });

  const outcome = await deliverOutboundMessage({
    recipientPhone: thread.phoneNumber,
    subject: 'InstantCare Manual WhatsApp Message',
    messageBody,
    templateType: 'manual',
    recipientUserId,
    patientId,
    appointmentId,
    contactId: thread.contact.id,
    conversationId: thread.conversation.id,
    notificationMetadata: {
      source: 'manual-inbox',
    },
    webhookPayload: {
      source: 'manual-inbox',
    },
  });

  if (outcome.error) {
    throw outcome.error;
  }

  return {
    recipientPhone: thread.phoneNumber,
    message: messageBody,
    delivery: outcome.delivery,
    log: annotateLog(outcome.log, { activeConversationWindow: true }),
  };
},
  async listConversations(query = {}) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 25);
    const fetchLimit = query.search ? Math.max(limit * 4, 100) : limit;
    const result = await whatsappConversationModel.list({
      page: query.search ? 1 : page,
      limit: fetchLimit,
      sortBy: query.sortBy || 'last_message_at',
      sortOrder: query.sortOrder || 'desc',
    });

    const contacts = await whatsappContactModel.findManyByIds(result.items.map((item) => item.contact_id).filter(Boolean));
    const contactsById = new Map(contacts.map((contact) => [contact.id, contact]));
    const summaries = await Promise.all(result.items.map((conversation) => buildConversationSummary(conversation, contactsById)));
    const searchTerm = String(query.search || '').trim().toLowerCase();
    const filtered = searchTerm
      ? summaries.filter((item) => {
          const fields = [
            item.phone_number,
            item.display_name,
            item.contact?.notes || '',
            item.last_message_preview || '',
          ];

          return fields.some((value) => String(value || '').toLowerCase().includes(searchTerm));
        })
      : summaries;

    return {
      items: query.search
        ? filtered.slice((page - 1) * limit, (page - 1) * limit + limit)
        : filtered,
      meta: {
        page,
        limit,
        total: query.search ? filtered.length : result.meta?.total || filtered.length,
      },
    };
  },

  async getConversationMessages(conversationId, query = {}) {
    const conversation = await whatsappConversationModel.findById(conversationId);
    const contact = conversation.contact_id
      ? await whatsappContactModel.findById(conversation.contact_id).catch(() => null)
      : null;
    const customerServiceWindow = await getConversationWindowState(conversation.phone_number);
    const latestLog = await getLatestLogForPhoneNumber(conversation.phone_number);

    const logs = await whatsappLogModel.list({
      page: query.page || 1,
      limit: query.limit || 25,
      sortBy: query.sortBy || 'created_at',
      sortOrder: query.sortOrder || 'desc',
      recipient_phone: conversation.phone_number,
    });

    if (Number(conversation.unread_count || 0) > 0) {
      await whatsappConversationModel.update(conversation.id, { unread_count: 0 });
    }

    return {
      conversation: {
        ...conversation,
        unread_count: 0,
        contact,
        display_name: getContactDisplayName(contact, conversation.phone_number),
        last_message_preview: latestLog ? latestLog.message_body : '',
        latest_log: latestLog ? annotateLog(latestLog, { activeConversationWindow: customerServiceWindow.active }) : null,
        customer_service_window: customerServiceWindow,
        can_send_freeform: customerServiceWindow.active,
        can_send_template: customerServiceWindow.approvedTemplateAvailable,
      },
      items: logs.items.map((log) => annotateLog(log, { activeConversationWindow: customerServiceWindow.active })),
      meta: logs.meta,
    };
  },

  async createOrUpdateContact({ name, phoneNumber, notes }) {
    const thread = await ensureWhatsappThread({
      phoneNumber,
      name,
      notes,
      unreadDelta: 0,
      autoCreateName: true,
      lastMessageAt: nowIso(),
    });

    return {
      contact: thread.contact,
      conversation: {
        ...thread.conversation,
        contact: thread.contact,
        display_name: getContactDisplayName(thread.contact, thread.phoneNumber),
      },
    };
  },
  async listLogs(query = {}) {
    return whatsappLogModel.list(query);
  },

  async getLogById(id) {
    return whatsappLogModel.findById(id);
  },

  async sendTemplateMessage(payload) {
    if (!getApprovedMetaTemplateConfig(payload.templateType)) {
      throw buildTemplateRequiredError();
    }

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
    const customerServiceWindow = await getConversationWindowState(log.recipient_phone);
    const annotated = annotateLog(log, { activeConversationWindow: customerServiceWindow.active });

    if (!RETRIABLE_LOG_STATUSES.has(log.status)) {
      throw new ApiError(400, 'Only queued or failed WhatsApp messages can be retried.');
    }

    if (!annotated.can_retry) {
      throw new ApiError(400, annotated.retry_block_reason || 'This WhatsApp message cannot be retried.', {
        code: 'WHATSAPP_RETRY_BLOCKED',
        reason: annotated.retry_block_reason || null,
      });
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