import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { resourceServices } from './resourceServices.js';
import { emailLogModel } from '../models/emailLogModel.js';
import { ApiError } from '../utils/ApiError.js';
import { renderEmailTemplate, supportedEmailTemplateTypes } from '../templates/emailTemplates.js';

const resendClient = env.resendApiKey ? new Resend(env.resendApiKey) : null;

const nowIso = () => new Date().toISOString();

const normalizeRecipients = (to) => {
  const list = Array.isArray(to) ? to : [to];
  return list.filter(Boolean);
};

const getRetryTimestamp = (attemptCount) => {
  const minutes = env.emailRetryDelayMinutes * Math.max(attemptCount, 1);
  const date = new Date(Date.now() + minutes * 60 * 1000);
  return date.toISOString();
};

const isRetriableStatus = (status) => ['failed', 'queued'].includes(status);

const buildNotificationPayload = ({ recipientUserId, patientId, appointmentId, subject, message, metadata }) => ({
  recipient_user_id: recipientUserId || null,
  patient_id: patientId || null,
  appointment_id: appointmentId || null,
  channel: 'email',
  status: 'queued',
  subject,
  message,
  scheduled_for: metadata?.scheduledFor || null,
  metadata: metadata || {},
});

const buildEmailLogPayload = ({ notificationId, patientId, appointmentId, invoiceId, recipientUserId, templateType, to, subject, html, text, metadata }) => ({
  notification_id: notificationId || null,
  patient_id: patientId || null,
  appointment_id: appointmentId || null,
  invoice_id: invoiceId || null,
  recipient_user_id: recipientUserId || null,
  email_type: templateType,
  from_email: env.emailFrom,
  reply_to_email: env.emailReplyTo,
  recipient_email: to,
  subject,
  body_html: html,
  body_text: text,
  status: 'queued',
  attempt_count: 0,
  max_attempts: env.emailMaxRetries,
  next_retry_at: null,
  last_error: null,
  provider_message_id: null,
  idempotency_key: randomUUID(),
  provider_response: metadata || {},
});

const updateStatuses = async ({ notificationId, emailLogId, notificationPayload, emailLogPayload }) => {
  const updates = [];

  if (notificationId) {
    updates.push(resourceServices.notifications.update(notificationId, notificationPayload));
  }

  if (emailLogId) {
    updates.push(emailLogModel.update(emailLogId, emailLogPayload));
  }

  await Promise.all(updates);
};

const sendViaResend = async ({ to, subject, html, text }) => {
  if (!resendClient) {
    return {
      sent: false,
      queued: true,
      provider: 'resend',
      reason: 'RESEND_API_KEY is not configured.',
    };
  }

  const response = await resendClient.emails.send({
    from: env.emailFrom,
    to,
    subject,
    html,
    text,
    replyTo: env.emailReplyTo,
  });

  return {
    sent: true,
    queued: false,
    provider: 'resend',
    response,
  };
};

export const emailService = {
  getTemplateTypes() {
    return supportedEmailTemplateTypes;
  },

  async listLogs(query = {}) {
    return emailLogModel.list(query);
  },

  async getLogById(id) {
    return emailLogModel.findById(id);
  },

  async sendTemplateEmail(payload) {
    const template = renderEmailTemplate(payload.templateType, {
      ...payload.templateData,
      to: payload.to,
    });

    const recipients = normalizeRecipients(payload.to || template.to);
    if (!recipients.length) {
      throw new ApiError(400, 'At least one recipient email is required.');
    }

    const subject = template.subject;
    const message = payload.templateData?.summary || template.text.slice(0, 1000);

    const createdNotifications = [];
    const createdLogs = [];

    for (const recipient of recipients) {
      const notification = await resourceServices.notifications.create(
        buildNotificationPayload({
          recipientUserId: payload.recipientUserId,
          patientId: payload.patientId,
          appointmentId: payload.appointmentId,
          subject,
          message,
          metadata: {
            templateType: payload.templateType,
            supportEmail: env.supportEmail,
            context: payload.templateData || {},
          },
        }),
      );

      const emailLog = await emailLogModel.create(
        buildEmailLogPayload({
          notificationId: notification.id,
          patientId: payload.patientId,
          appointmentId: payload.appointmentId,
          invoiceId: payload.invoiceId,
          recipientUserId: payload.recipientUserId,
          templateType: payload.templateType,
          to: recipient,
          subject,
          html: template.html,
          text: template.text,
          metadata: {
            templateType: payload.templateType,
          },
        }),
      );

      createdNotifications.push(notification);
      createdLogs.push(emailLog);

      try {
        const delivery = await sendViaResend({
          to: recipient,
          subject,
          html: template.html,
          text: template.text,
        });

        if (!delivery.sent) {
          await updateStatuses({
            notificationId: notification.id,
            emailLogId: emailLog.id,
            notificationPayload: {
              status: 'queued',
              metadata: {
                ...(notification.metadata || {}),
                provider: delivery.provider,
                reason: delivery.reason,
              },
            },
            emailLogPayload: {
              status: 'queued',
              provider_response: {
                provider: delivery.provider,
                reason: delivery.reason,
              },
            },
          });

          continue;
        }

        const providerMessageId = delivery.response?.data?.id || delivery.response?.id || null;

        await updateStatuses({
          notificationId: notification.id,
          emailLogId: emailLog.id,
          notificationPayload: {
            status: 'sent',
            sent_at: nowIso(),
            external_reference: providerMessageId,
            metadata: {
              ...(notification.metadata || {}),
              provider: delivery.provider,
            },
          },
          emailLogPayload: {
            status: 'sent',
            attempt_count: 1,
            sent_at: nowIso(),
            provider_message_id: providerMessageId,
            provider_response: delivery.response,
          },
        });
      } catch (error) {
        const attemptCount = Number(emailLog.attempt_count || 0) + 1;
        const canRetry = attemptCount < env.emailMaxRetries;

        await updateStatuses({
          notificationId: notification.id,
          emailLogId: emailLog.id,
          notificationPayload: {
            status: 'failed',
            metadata: {
              ...(notification.metadata || {}),
              provider: 'resend',
              lastError: error.message,
            },
          },
          emailLogPayload: {
            status: 'failed',
            attempt_count: attemptCount,
            last_error: error.message,
            next_retry_at: canRetry ? getRetryTimestamp(attemptCount) : null,
            provider_response: {
              error: error.message,
            },
          },
        });

        logger.error({ err: error, recipient, templateType: payload.templateType }, 'Failed to send email via Resend');
      }
    }

    return {
      templateType: payload.templateType,
      supportEmail: env.supportEmail,
      notifications: createdNotifications,
      emailLogs: await Promise.all(createdLogs.map((log) => emailLogModel.findById(log.id))),
      resendConfigured: Boolean(env.resendApiKey),
    };
  },

  async retryEmail(logId) {
    const log = await emailLogModel.findById(logId);

    if (!isRetriableStatus(log.status)) {
      throw new ApiError(400, 'Only queued or failed emails can be retried.');
    }

    if (Number(log.attempt_count || 0) >= Number(log.max_attempts || env.emailMaxRetries)) {
      throw new ApiError(400, 'Maximum retry attempts reached for this email log.');
    }

    try {
      const delivery = await sendViaResend({
        to: log.recipient_email,
        subject: log.subject,
        html: log.body_html,
        text: log.body_text,
      });

      if (!delivery.sent) {
        const queuedLog = await emailLogModel.update(log.id, {
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

        return queuedLog;
      }

      const attemptCount = Number(log.attempt_count || 0) + 1;
      const providerMessageId = delivery.response?.data?.id || delivery.response?.id || null;
      const updated = await emailLogModel.update(log.id, {
        status: 'sent',
        attempt_count: attemptCount,
        last_error: null,
        next_retry_at: null,
        sent_at: nowIso(),
        provider_message_id: providerMessageId,
        provider_response: delivery.response,
      });

      if (log.notification_id) {
        await resourceServices.notifications.update(log.notification_id, {
          status: 'sent',
          sent_at: nowIso(),
          external_reference: providerMessageId,
        });
      }

      return updated;
    } catch (error) {
      const attemptCount = Number(log.attempt_count || 0) + 1;
      const canRetry = attemptCount < Number(log.max_attempts || env.emailMaxRetries);

      const updated = await emailLogModel.update(log.id, {
        status: 'failed',
        attempt_count: attemptCount,
        last_error: error.message,
        next_retry_at: canRetry ? getRetryTimestamp(attemptCount) : null,
        provider_response: {
          error: error.message,
        },
      });

      if (log.notification_id) {
        await resourceServices.notifications.update(log.notification_id, { status: 'failed' });
      }

      throw new ApiError(502, 'Email retry failed.', updated);
    }
  },

  async retryFailedEmails(limit = 25) {
    const result = await emailLogModel.list({ page: 1, limit, status: 'failed', sortBy: 'updated_at', sortOrder: 'desc' });
    const dueLogs = result.items.filter((log) => !log.next_retry_at || new Date(log.next_retry_at).getTime() <= Date.now());
    const responses = [];

    for (const log of dueLogs) {
      try {
        const retried = await this.retryEmail(log.id);
        responses.push({ id: log.id, success: true, log: retried });
      } catch (error) {
        responses.push({ id: log.id, success: false, error: error.message, details: error.details || null });
      }
    }

    return {
      attempted: dueLogs.length,
      processed: responses,
    };
  },
};