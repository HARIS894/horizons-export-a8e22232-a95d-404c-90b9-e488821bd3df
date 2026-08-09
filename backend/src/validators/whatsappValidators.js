import { body } from 'express-validator';
import { supportedWhatsappTemplateTypes } from '../templates/whatsappTemplates.js';

const phonePattern = /^\+?[1-9]\d{7,14}$/;

const recipientValidator = body('to').custom((value) => {
  const values = Array.isArray(value) ? value : [value];
  if (!values.length || !values.every((entry) => typeof entry === 'string' && phonePattern.test(entry))) {
    throw new Error('Recipient WhatsApp number must be a valid E.164-style phone number or an array of valid numbers.');
  }
  return true;
});

export const sendWhatsappValidator = [
  body('templateType').isIn(supportedWhatsappTemplateTypes).withMessage('Unsupported WhatsApp template type.'),
  recipientValidator,
  body('templateData').optional().isObject().withMessage('templateData must be an object.'),
  body('recipientUserId').optional().isUUID().withMessage('recipientUserId must be a UUID.'),
  body('patientId').optional().isUUID().withMessage('patientId must be a UUID.'),
  body('appointmentId').optional().isUUID().withMessage('appointmentId must be a UUID.'),
  body('invoiceId').optional().isUUID().withMessage('invoiceId must be a UUID.'),
];

export const retryFailedWhatsappValidator = [
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),
];

export const createWhatsappContactValidator = [
  body('name').trim().isLength({ min: 2 }).withMessage('Client name is required.'),
  body('phoneNumber').isString().trim().notEmpty().withMessage('WhatsApp number is required.'),
  body('notes').optional().isString(),
];

export const manualWhatsappMessageValidator = [
  body('to').isString().trim().notEmpty().withMessage('WhatsApp recipient number is required.'),
  body('message').isString().trim().notEmpty().withMessage('WhatsApp message is required.'),
  body('recipientUserId').optional().isUUID().withMessage('recipientUserId must be a UUID.'),
  body('patientId').optional().isUUID().withMessage('patientId must be a UUID.'),
  body('appointmentId').optional().isUUID().withMessage('appointmentId must be a UUID.'),
];