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

  console.log("========== WHATSAPP SEND ==========");
  console.log({
    isWhatsappConfigured,
    phoneNumberId: env.whatsappPhoneNumberId,
    accessTokenPresent: !!env.whatsappAccessToken,
    to,
    body,
  });

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
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.whatsappAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: false,
        body,
      },
    }),
  });

  const responseBody = await response.json().catch(() => ({}));

  console.log("========== META RESPONSE ==========");
  console.log("STATUS:", response.status);
  console.log(JSON.stringify(responseBody, null, 2));

  if (!response.ok) {
    throw new ApiError(
      502,
      "WhatsApp Cloud API request failed.",
      responseBody
    );
  }

  return {
    sent: true,
    queued: false,
    provider: "whatsapp-cloud-api",
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
console.log("====== WEBHOOK ======");
console.log(JSON.stringify(payload, null, 2));

const statuses =
  payload?.entry?.flatMap(e => e.changes || [])
  .flatMap(c => c.value?.statuses || []);

const messages =
  payload?.entry?.flatMap(e => e.changes || [])
  .flatMap(c => c.value?.messages || []);

console.log("MESSAGES =", messages.length);
console.log("STATUSES =", statuses.length);
  async processWebhook(payload) {

    console.log("MESSAGE =", JSON.stringify(message, null, 2));

console.log("CONTACT =", contactNumber);

console.log("REPLY =", reply);

console.log("BEFORE SEND");

const delivery = await sendViaWhatsappCloud({
    to: contactNumber,
    body: reply
});

console.log("AFTER SEND");

    // -------- STATUS LOOP --------
    for (const status of statuses) {

        const messageId = status.id;

        if (!messageId) continue;

        const result = await whatsappLogModel.list({
            page: 1,
            limit: 1,
            provider_message_id: messageId
        });

        const log = result.items?.[0];

        if (!log) continue;

        await whatsappLogModel.update(log.id,{
            status: mapWebhookStatus(status.status),
            provider_response: status
        });

    }

    // -------- MESSAGE LOOP --------
    for (const message of messages) {

        const contactNumber = message.from;

        if (!contactNumber) continue;

        const incoming =
            (message.text?.body || "")
            .trim()
            .toLowerCase();

        console.log("Incoming =", incoming);

        let reply = "";

        switch (incoming) {

            case "hi":
            case "hello":
            case "hey":
            case "hii":
            case "namaste":

                reply =
`🙏 Welcome to InstantCare

1️⃣ Home Nursing
2️⃣ Caregiver
3️⃣ Doctor Visit
4️⃣ Physiotherapy
5️⃣ Ambulance
6️⃣ Health Checkup
7️⃣ Elder Care
8️⃣ Talk to Executive

Reply with a number.`;

                break;

            case "1":
                reply="Please share Patient Name, Age & Location.";
                break;

            case "2":
                reply="Please share Patient Name & Requirement.";
                break;

            default:
                reply="Please reply 1-8.";
        }

        console.log("Reply =", reply);

        try {

    console.log("===== SENDING TO META =====");

    const delivery = await sendViaWhatsappCloud({
        to: contactNumber,
        body: reply
    });

    console.log("SUCCESS");
    console.log(JSON.stringify(delivery,null,2));

}
catch(err){

    console.log("========== META ERROR ==========");

    console.log(err);

    console.log(err.details);

}

    }

    return {

        received:true,

        statusUpdates:statuses.length,

        inboundMessages:messages.length,

        processed:messages.length

    };

}