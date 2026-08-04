import { body } from 'express-validator';
import { supportedEmailTemplateTypes } from '../templates/emailTemplates.js';

const emailRecipientValidator = body('to')
  .custom((value) => {
    const values = Array.isArray(value) ? value : [value];
    if (!values.every((entry) => typeof entry === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry))) {
      throw new Error('Recipient email must be a valid email address or an array of valid email addresses.');
    }
    return true;
  });

export const sendEmailValidator = [
  body('templateType').isIn(supportedEmailTemplateTypes).withMessage('Unsupported email template type.'),
  emailRecipientValidator,
  body('templateData').optional().isObject().withMessage('templateData must be an object.'),
  body('recipientUserId').optional().isUUID().withMessage('recipientUserId must be a UUID.'),
  body('patientId').optional().isUUID().withMessage('patientId must be a UUID.'),
  body('appointmentId').optional().isUUID().withMessage('appointmentId must be a UUID.'),
  body('invoiceId').optional().isUUID().withMessage('invoiceId must be a UUID.'),
];

export const retryFailedEmailValidator = [
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),
];