import {
  constants,
  createCipheriv,
  createDecipheriv,
  createHmac,
  createPrivateKey,
  privateDecrypt,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { resourceServices } from './resourceServices.js';
import { ApiError } from '../utils/ApiError.js';

const FLOW_VERSION = '3.0';
const META_SIGNATURE_HEADER = 'x-hub-signature-256';
const GCM_TAG_LENGTH = 16;
const DEFAULT_MENU_INTRO = 'Select the healthcare journey you need right now.';
const DEFAULT_FAILURE_MESSAGE = 'We could not route your request right now.';
const DEFAULT_FALLBACK_MESSAGE = 'Please retry or request a callback from the InstantCare coordinator desk.';

const JOURNEY_CATALOG = {
  healthcare_services: {
    title: 'Healthcare Services',
    nextStep: 'A care coordinator will review your care requirement and align the right service line.',
  },
  emergency_services: {
    title: 'Emergency Services',
    nextStep: 'The emergency response desk will prioritize this request and coordinate urgent support.',
  },
  health_checkups: {
    title: 'Health Checkups',
    nextStep: 'The diagnostics team will review the preferred package and share scheduling options.',
  },
  book_appointment: {
    title: 'Book Appointment',
    nextStep: 'The scheduling desk will match the request to the right clinician or care team.',
  },
  existing_booking: {
    title: 'Existing Booking',
    nextStep: 'Operations will review the existing booking and coordinate the requested update.',
  },
  talk_to_care_coordinator: {
    title: 'Talk to Care Coordinator',
    nextStep: 'A care coordinator will contact the family for live triage and care planning.',
  },
  talk_to_doctor: {
    title: 'Talk to Doctor',
    nextStep: 'A doctor consultation coordinator will arrange a visit or teleconsultation response.',
  },
  senior_citizen_care: {
    title: 'Senior Citizen Care',
    nextStep: 'The eldercare desk will assess long-duration support needs and recommend coverage.',
  },
  medical_equipment: {
    title: 'Medical Equipment',
    nextStep: 'The equipment team will confirm availability, delivery coverage, and setup needs.',
  },
  nri_family_support: {
    title: 'NRI Family Support',
    nextStep: 'The NRI support desk will prepare the oversight and family update plan.',
  },
  cancer_care: {
    title: 'Cancer Care',
    nextStep: 'The oncology support team will review the request and coordinate the right pathway.',
  },
  home_icu: {
    title: 'Home ICU',
    nextStep: 'Critical care operations will assess equipment, staffing, and setup urgency.',
  },
  patient_attendant: {
    title: 'Patient Attendant',
    nextStep: 'The staffing team will review mobility and daily-care support requirements.',
  },
  contact_support: {
    title: 'Contact Support',
    nextStep: 'The service desk will review the issue and route it to the correct operations team.',
  },
  faq: {
    title: 'FAQ',
    nextStep: 'The support desk will respond with policy or service guidance if self-service is not enough.',
  },
};

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isEncryptedEnvelope = (body) => isObject(body)
  && typeof body.encrypted_flow_data === 'string'
  && typeof body.encrypted_aes_key === 'string'
  && typeof body.initial_vector === 'string';

const buildPlainResponse = (body, statusCode = 200, contentType = 'application/json; charset=utf-8') => ({
  statusCode,
  contentType,
  body,
});

const buildFailureScreen = (errorMessage = DEFAULT_FAILURE_MESSAGE, fallbackMessage = DEFAULT_FALLBACK_MESSAGE) => ({
  screen: 'MAIN_MENU_FAILURE',
  data: {
    error_message: errorMessage,
    fallback_message: fallbackMessage,
  },
});

const normalizeText = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim().replace(/\s+/g, ' ');
};

const getJourneyDetails = (journey) => {
  const normalizedJourney = normalizeText(journey);
  return JOURNEY_CATALOG[normalizedJourney] || null;
};

const formatRequestId = () => {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
  const suffix = `${randomInt(0, 1000)}`.padStart(3, '0') + String(now.getUTCMilliseconds()).padStart(3, '0');
  return `${env.whatsappFlowRequestPrefix}-${datePart}-${suffix}`;
};

const isMissingColumnError = (error) => {
  const code = error?.code || error?.details?.code || null;
  const message = [error?.message, error?.details?.message, error?.details?.details].filter(Boolean).join(' ');

  return code === '42703'
    || code === 'PGRST204'
    || /column/i.test(message);
};

const isMissingRequiredUserError = (error) => {
  const message = [error?.message, error?.details?.message, error?.details?.details].filter(Boolean).join(' ');

  return /null value in column "(?:user_id|recipient_user_id)"/i.test(message)
    || /not-null constraint/i.test(message);
};

const getRequestSignature = (headerValue) => {
  if (typeof headerValue !== 'string' || !headerValue.startsWith('sha256=')) {
    return '';
  }

  return headerValue.slice('sha256='.length);
};

const createMetaSignature = (secret, rawBody) => createHmac('sha256', secret).update(rawBody).digest('hex');

const matchesSignature = (expectedSignature, actualSignature) => {
  if (!expectedSignature || !actualSignature || expectedSignature.length !== actualSignature.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expectedSignature, 'utf8'), Buffer.from(actualSignature, 'utf8'));
};

const validateSignature = (rawBody, headerValue) => {
  if (!rawBody?.length) {
    throw new ApiError(400, 'Missing raw request body for Meta Flows signature validation.');
  }

  if (!env.whatsappFlowAppSecret) {
    throw new ApiError(500, 'WHATSAPP_FLOW_APP_SECRET is not configured.');
  }

  const signature = getRequestSignature(headerValue);
  if (!signature) {
    throw new ApiError(401, 'Missing or invalid Meta Flows signature header.');
  }

  const validSecrets = [env.whatsappFlowAppSecret, env.whatsappFlowAppSecretPrevious].filter(Boolean);
  const isValid = validSecrets.some((secret) => matchesSignature(createMetaSignature(secret, rawBody), signature));

  if (!isValid) {
    throw new ApiError(401, 'Meta Flows signature validation failed.');
  }
};

const getPrivateKey = () => {
  if (!env.whatsappFlowPrivateKey) {
    throw new ApiError(500, 'WHATSAPP_FLOW_PRIVATE_KEY is not configured.');
  }

  return createPrivateKey({
    key: env.whatsappFlowPrivateKey,
    format: 'pem',
    passphrase: env.whatsappFlowPrivateKeyPassphrase || undefined,
  });
};

const decryptFlowRequest = (body) => {
  try {
    const aesKey = privateDecrypt(
      {
        key: getPrivateKey(),
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(body.encrypted_aes_key, 'base64'),
    );

    const encryptedPayload = Buffer.from(body.encrypted_flow_data, 'base64');
    const initialVector = Buffer.from(body.initial_vector, 'base64');
    const encryptedBody = encryptedPayload.subarray(0, -GCM_TAG_LENGTH);
    const authTag = encryptedPayload.subarray(-GCM_TAG_LENGTH);

    const decipher = createDecipheriv('aes-128-gcm', aesKey, initialVector);
    decipher.setAuthTag(authTag);

    const decryptedJson = Buffer.concat([
      decipher.update(encryptedBody),
      decipher.final(),
    ]).toString('utf8');

    return {
      decryptedBody: JSON.parse(decryptedJson),
      aesKey,
      initialVector,
    };
  } catch (error) {
    throw new ApiError(421, 'Unable to decrypt Meta Flows payload.', {
      error: error instanceof Error ? error.message : 'Unknown decryption error',
    });
  }
};

const encryptFlowResponse = (payload, aesKey, initialVector) => {
  const flippedInitialVector = Buffer.from(initialVector.map((entry) => entry ^ 0xFF));
  const cipher = createCipheriv('aes-128-gcm', aesKey, flippedInitialVector);

  return Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
    cipher.getAuthTag(),
  ]).toString('base64');
};

const buildSummaryMarkdown = (journeyDetails, briefContext) => {
  const lines = [
    '# InstantCare Request',
    `- Journey: ${journeyDetails.title}`,
    `- Brief requirement: ${briefContext || 'Not provided'}`,
    `- Next step: ${journeyDetails.nextStep}`,
  ];

  return lines.join('\n');
};

const buildMainMenuSummary = (data) => {
  const journeyDetails = getJourneyDetails(data?.journey);
  if (!journeyDetails) {
    return buildFailureScreen('Please select a valid healthcare journey before continuing.');
  }

  const briefContext = normalizeText(data?.brief_context);

  return {
    screen: 'MAIN_MENU_SUMMARY',
    data: {
      summary_markdown: buildSummaryMarkdown(journeyDetails, briefContext),
      next_step: journeyDetails.nextStep,
    },
  };
};

const persistMainMenuRequest = async ({ flowToken, screen, journey, briefContext, requestId }) => {
  const journeyDetails = getJourneyDetails(journey);

  try {
    await resourceServices.notifications.create({
      channel: 'whatsapp',
      status: 'queued',
      subject: `WhatsApp Flow main menu request ${requestId}`,
      message: `Journey: ${journeyDetails.title}. Brief requirement: ${briefContext || 'Not provided'}.`,
      external_reference: requestId,
      metadata: {
        source: 'whatsapp-flow',
        flow_name: 'instantcare-main-menu',
        flow_token: flowToken || null,
        current_screen: screen || 'MAIN_MENU_SUMMARY',
        journey,
        journey_title: journeyDetails.title,
        brief_context: briefContext || null,
        next_step: journeyDetails.nextStep,
      },
    });
  } catch (error) {
    if (isMissingColumnError(error) || isMissingRequiredUserError(error)) {
      logger.warn({
        event: 'META_FLOW_NOTIFICATION_SAVE_SKIPPED',
        requestId,
        reason: isMissingColumnError(error) ? 'notification-schema-mismatch' : 'notification-user-required',
        error: error.message,
        details: error.details,
      }, 'META_FLOW_NOTIFICATION_SAVE_SKIPPED');
      return;
    }

    throw error;
  }
};

const submitMainMenuRequest = async (payload) => {
  const journey = normalizeText(payload?.data?.journey);
  const journeyDetails = getJourneyDetails(journey);
  if (!journeyDetails) {
    return buildFailureScreen('Please select a valid healthcare journey before submitting the request.');
  }

  const briefContext = normalizeText(payload?.data?.brief_context);
  const requestId = formatRequestId();

  await persistMainMenuRequest({
    flowToken: normalizeText(payload?.flow_token),
    screen: normalizeText(payload?.screen, 'MAIN_MENU_SUMMARY'),
    journey,
    briefContext,
    requestId,
  });

  return {
    screen: 'MAIN_MENU_SUCCESS',
    data: {
      request_id: requestId,
      success_message: 'Your healthcare request has been submitted to InstantCare operations.',
    },
  };
};

const handleDataExchange = async (payload) => {
  const flowAction = normalizeText(payload?.data?.flow_action);

  switch (flowAction) {
    case 'resolve_main_menu':
      return buildMainMenuSummary(payload.data);
    case 'submit_main_menu_request':
      return submitMainMenuRequest(payload);
    default:
      return buildFailureScreen(`Unsupported flow action: ${flowAction || 'unknown'}.`);
  }
};

const handleCleartextPayload = async (payload) => {
  if (!isObject(payload)) {
    throw new ApiError(400, 'Meta Flows request body must be a JSON object.');
  }

  if (payload.action === 'ping') {
    return { data: { status: 'active' } };
  }

  if (payload?.data?.error) {
    logger.warn({ event: 'META_FLOW_CLIENT_ERROR', payload }, 'META_FLOW_CLIENT_ERROR');
    return { data: { acknowledged: true } };
  }

  if (payload.action === 'INIT' || payload.action === 'BACK') {
    return {
      screen: 'MAIN_MENU',
      data: {
        menu_intro: DEFAULT_MENU_INTRO,
      },
    };
  }

  if (payload.action !== 'data_exchange') {
    return buildFailureScreen(`Unsupported Meta Flow action: ${payload.action || 'unknown'}.`);
  }

  return handleDataExchange(payload);
};

export const metaFlowService = {
  async processRequest({ body, headers, rawBody }) {
    if (isEncryptedEnvelope(body)) {
      validateSignature(rawBody, headers[META_SIGNATURE_HEADER]);

      const decryptedRequest = decryptFlowRequest(body);

      try {
        const responsePayload = await handleCleartextPayload(decryptedRequest.decryptedBody);
        return buildPlainResponse(
          encryptFlowResponse(responsePayload, decryptedRequest.aesKey, decryptedRequest.initialVector),
          200,
          'text/plain; charset=utf-8',
        );
      } catch (error) {
        logger.error({ err: error, payload: decryptedRequest.decryptedBody }, 'META_FLOW_REQUEST_FAILED');
        return buildPlainResponse(
          encryptFlowResponse(buildFailureScreen(), decryptedRequest.aesKey, decryptedRequest.initialVector),
          200,
          'text/plain; charset=utf-8',
        );
      }
    }

    return buildPlainResponse(await handleCleartextPayload(body));
  },
};