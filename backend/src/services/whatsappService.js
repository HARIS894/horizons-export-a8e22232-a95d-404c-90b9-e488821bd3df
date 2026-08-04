import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { whatsappLogModel } from '../models/whatsappLogModel.js';
import { resourceServices } from './resourceServices.js';
import { ApiError } from '../utils/ApiError.js';
import { renderWhatsappTemplate, supportedWhatsappTemplateTypes } from '../templates/whatsappTemplates.js';

const nowIso = () => new Date().toISOString();

const isWhatsappConfigured = Boolean(env.whatsappAccessToken && env.whatsappPhoneNumberId);

const normalizeRecipients = (to) => {
  const list = Array.isArray(to) ? to : [to];
  return list.filter(Boolean);
};

const getRetryTimestamp = (attemptCount) => {
  const minutes = env.whatsappRetryDelayMinutes * Math.max(attemptCount, 1);
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
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

const buildWhatsAppLogPayload = ({ notificationId, patientId, appointmentId, invoiceId, recipientUserId, templateType, to, messageBody, metadata }) => ({
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
  status: 'queued',
  attempt_count: 0,
  max_attempts: env.whatsappMaxRetries,
  next_retry_at: null,
  last_error: null,
  provider_message_id: null,
  idempotency_key: randomUUID(),
  direction: 'outbound',
  webhook_payload: {},
  provider_response: metadata || {},
});

const sendViaWhatsappCloud = async ({ to, body, preview }) => {
  if (!isWhatsappConfigured) {
    return {
      sent: false,
      queued: true,
      provider: 'whatsapp-cloud-api',
      reason: 'WhatsApp Cloud API credentials are not configured.',
    };
  }

  const endpoint = `https://graph.facebook.com/${env.whatsappApiVersion}/${env.whatsappPhoneNumberId}/messages`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.whatsappAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body,
      },
      context: preview ? { message_id: undefined } : undefined,
    }),
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(502, 'WhatsApp Cloud API request failed.', responseBody);
  }

  return {
    sent: true,
    queued: false,
    provider: 'whatsapp-cloud-api',
    response: responseBody,
  };
};

const updateStatuses = async ({ notificationId, whatsappLogId, notificationPayload, whatsappLogPayload }) => {
  const updates = [];
  if (notificationId) {
    updates.push(resourceServices.notifications.update(notificationId, notificationPayload));
  }
  if (whatsappLogId) {
    updates.push(whatsappLogModel.update(whatsappLogId, whatsappLogPayload));
  }
  await Promise.all(updates);
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

    const createdNotifications = [];
    const createdLogs = [];

    for (const recipient of recipients) {
      const notification = await resourceServices.notifications.create(
        buildNotificationPayload({
          recipientUserId: payload.recipientUserId,
          patientId: payload.patientId,
          appointmentId: payload.appointmentId,
          subject: template.preview,
          message: template.body,
          metadata: {
            templateType: payload.templateType,
            supportEmail: env.supportEmail,
            context: payload.templateData || {},
          },
        }),
      );

      const log = await whatsappLogModel.create(
        buildWhatsAppLogPayload({
          notificationId: notification.id,
          patientId: payload.patientId,
          appointmentId: payload.appointmentId,
          invoiceId: payload.invoiceId,
          recipientUserId: payload.recipientUserId,
          templateType: payload.templateType,
          to: recipient,
          messageBody: template.body,
          metadata: { templateType: payload.templateType },
        }),
      );

      createdNotifications.push(notification);
      createdLogs.push(log);

      try {
        const delivery = await sendViaWhatsappCloud({
          to: recipient,
          body: template.body,
          preview: template.preview,
        });

        if (!delivery.sent) {
          await updateStatuses({
            notificationId: notification.id,
            whatsappLogId: log.id,
            notificationPayload: {
              status: 'queued',
              metadata: {
                ...(notification.metadata || {}),
                provider: delivery.provider,
                reason: delivery.reason,
              },
            },
            whatsappLogPayload: {
              status: 'queued',
              provider_response: {
                provider: delivery.provider,
                reason: delivery.reason,
              },
            },
          });
          continue;
        }

        const providerMessageId = delivery.response?.messages?.[0]?.id || null;
        const sentAt = nowIso();

        await updateStatuses({
          notificationId: notification.id,
          whatsappLogId: log.id,
          notificationPayload: {
            status: 'sent',
            sent_at: sentAt,
            external_reference: providerMessageId,
            metadata: {
              ...(notification.metadata || {}),
              provider: delivery.provider,
            },
          },
          whatsappLogPayload: {
            status: 'sent',
            attempt_count: 1,
            sent_at: sentAt,
            provider_message_id: providerMessageId,
            provider_response: delivery.response,
          },
        });
      } catch (error) {
        const attemptCount = Number(log.attempt_count || 0) + 1;
        const canRetry = attemptCount < env.whatsappMaxRetries;

        await updateStatuses({
          notificationId: notification.id,
          whatsappLogId: log.id,
          notificationPayload: {
            status: 'failed',
            metadata: {
              ...(notification.metadata || {}),
              provider: 'whatsapp-cloud-api',
              lastError: error.message,
            },
          },
          whatsappLogPayload: {
            status: 'failed',
            attempt_count: attemptCount,
            last_error: error.message,
            next_retry_at: canRetry ? getRetryTimestamp(attemptCount) : null,
            provider_response: error.details || { error: error.message },
          },
        });

        logger.error({ err: error, recipient, templateType: payload.templateType }, 'Failed to send WhatsApp message');
      }
    }

    return {
      templateType: payload.templateType,
      phoneNumberId: env.whatsappPhoneNumberId || null,
      supportEmail: env.supportEmail,
      logs: await Promise.all(createdLogs.map((log) => whatsappLogModel.findById(log.id))),
      notifications: createdNotifications,
      whatsappConfigured: isWhatsappConfigured,
    };
  },

  async retryMessage(logId) {
    const log = await whatsappLogModel.findById(logId);

    if (!['failed', 'queued'].includes(log.status)) {
      throw new ApiError(400, 'Only queued or failed WhatsApp messages can be retried.');
    }

    if (Number(log.attempt_count || 0) >= Number(log.max_attempts || env.whatsappMaxRetries)) {
      throw new ApiError(400, 'Maximum retry attempts reached for this WhatsApp log.');
    }

    try {
      const delivery = await sendViaWhatsappCloud({
        to: log.recipient_phone,
        body: log.message_body,
        preview: log.template_name,
      });

      if (!delivery.sent) {
        const queued = await whatsappLogModel.update(log.id, {
          status: 'queued',
          next_retry_at: getRetryTimestamp(Number(log.attempt_count || 0) + 1),
          provider_response: {
            provider: delivery.provider,
            reason: delivery.reason,
          },
        });

        if (log.notification_id) {
          await resourceServices.notifications.update(log.notification_id, { status: 'queued' });
        }

        return queued;
      }

      const attemptCount = Number(log.attempt_count || 0) + 1;
      const providerMessageId = delivery.response?.messages?.[0]?.id || null;
      const sentAt = nowIso();
      const updated = await whatsappLogModel.update(log.id, {
        status: 'sent',
        attempt_count: attemptCount,
        last_error: null,
        next_retry_at: null,
        sent_at: sentAt,
        provider_message_id: providerMessageId,
        provider_response: delivery.response,
      });

      if (log.notification_id) {
        await resourceServices.notifications.update(log.notification_id, {
          status: 'sent',
          sent_at: sentAt,
          external_reference: providerMessageId,
        });
      }

      return updated;
    } catch (error) {
      const attemptCount = Number(log.attempt_count || 0) + 1;
      const canRetry = attemptCount < Number(log.max_attempts || env.whatsappMaxRetries);
      const updated = await whatsappLogModel.update(log.id, {
        status: 'failed',
        attempt_count: attemptCount,
        last_error: error.message,
        next_retry_at: canRetry ? getRetryTimestamp(attemptCount) : null,
        provider_response: error.details || { error: error.message },
      });

      if (log.notification_id) {
        await resourceServices.notifications.update(log.notification_id, { status: 'failed' });
      }

      throw new ApiError(502, 'WhatsApp retry failed.', updated);
    }
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
    const statuses = payload?.entry?.flatMap((entry) => entry?.changes || [])
      .flatMap((change) => change?.value?.statuses || []) || [];
    const messages = payload?.entry?.flatMap((entry) => entry?.changes || [])
      .flatMap((change) => change?.value?.messages || []) || [];

    const updates = [];

    for (const status of statuses) {
      const messageId = status?.id;
      if (!messageId) {
        continue;
      }

      const result = await whatsappLogModel.list({ page: 1, limit: 1, provider_message_id: messageId });
      const log = result.items[0];
      if (!log) {
        continue;
      }

      const normalizedStatus = mapWebhookStatus(status.status);
      const payloadUpdate = {
        status: normalizedStatus,
        webhook_payload: status,
        provider_response: {
          ...(log.provider_response || {}),
          webhookStatus: status,
        },
      };

      if (normalizedStatus === 'delivered') {
        payloadUpdate.delivered_at = status.timestamp ? new Date(Number(status.timestamp) * 1000).toISOString() : nowIso();
      }
      if (normalizedStatus === 'read') {
        payloadUpdate.read_at = status.timestamp ? new Date(Number(status.timestamp) * 1000).toISOString() : nowIso();
      }

      const updatedLog = await whatsappLogModel.update(log.id, payloadUpdate);
      if (log.notification_id) {
        const notificationUpdate = {
          status: normalizedStatus,
        };
        if (normalizedStatus === 'delivered') {
          notificationUpdate.delivered_at = payloadUpdate.delivered_at;
        }
        if (normalizedStatus === 'read') {
          notificationUpdate.read_at = payloadUpdate.read_at;
        }

        await resourceServices.notifications.update(log.notification_id, notificationUpdate);
      }

      updates.push(updatedLog);
    }

    for (const message of messages) {
      const contactNumber = message?.from;
      if (!contactNumber) {
        continue;
      }

      const inboundLog = await whatsappLogModel.create({
        notification_id: null,
        patient_id: null,
        appointment_id: null,
        invoice_id: null,
        recipient_user_id: null,
        whatsapp_type: 'inbound-webhook',
        phone_number_id: env.whatsappPhoneNumberId || null,
        recipient_phone: contactNumber,
        template_name: 'inbound-webhook',
        message_body: message?.text?.body || '',
        status: 'delivered',
        attempt_count: 0,
        max_attempts: env.whatsappMaxRetries,
        next_retry_at: null,
        last_error: null,
        provider_message_id: message?.id || null,
        idempotency_key: randomUUID(),
        direction: 'inbound',
        webhook_payload: message,
        provider_response: payload,
      });

      updates.push(inboundLog);
    }

    return {
      received: true,
      statusUpdates: statuses.length,
      inboundMessages: messages.length,
      processed: updates.length,
    };
  },
};