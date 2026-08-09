import { ApiError } from './ApiError.js';

const NON_DIGIT_PATTERN = /\D+/g;

export const normalizeWhatsappPhoneNumber = (value) => {
  const input = String(value || '').trim();
  const normalized = input.replace(NON_DIGIT_PATTERN, '').replace(/^00/, '');

  if (!normalized) {
    return '';
  }

  if (!/^\d{8,15}$/.test(normalized)) {
    throw new ApiError(400, 'WhatsApp number must be a valid international phone number.');
  }

  return normalized;
};