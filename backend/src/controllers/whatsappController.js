import { logger } from '../config/logger.js';
import { whatsappService } from '../services/whatsappService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const whatsappController = {
  templateTypes: asyncHandler(async (req, res) => {
    sendSuccess(res, whatsappService.getTemplateTypes());
  }),

  listConversations: asyncHandler(async (req, res) => {
    sendSuccess(res, await whatsappService.listConversations(req.query));
  }),

  getConversationMessages: asyncHandler(async (req, res) => {
    sendSuccess(res, await whatsappService.getConversationMessages(req.params.id, req.query));
  }),

  upsertContact: asyncHandler(async (req, res) => {
    sendSuccess(res, await whatsappService.createOrUpdateContact(req.body), 201);
  }),

  manualSend: asyncHandler(async (req, res) => {
    const result = await whatsappService.sendManualMessage(req.body);
    sendSuccess(res, result, 201);
  }),

  send: asyncHandler(async (req, res) => {
    sendSuccess(
      res,
      await whatsappService.sendTemplateMessage(req.body),
      201,
    );
  }),

  listLogs: asyncHandler(async (req, res) => {
    sendSuccess(res, await whatsappService.listLogs(req.query));
  }),

  getLogById: asyncHandler(async (req, res) => {
    sendSuccess(res, await whatsappService.getLogById(req.params.id));
  }),

  retry: asyncHandler(async (req, res) => {
    sendSuccess(res, await whatsappService.retryMessage(req.params.id));
  }),

  retryFailed: asyncHandler(async (req, res) => {
    sendSuccess(
      res,
      await whatsappService.retryFailedMessages(req.body.limit),
    );
  }),

  verifyWebhook: asyncHandler(async (req, res) => {
    const challenge = whatsappService.verifyWebhook(
      req.query['hub.mode'],
      req.query['hub.verify_token'],
      req.query['hub.challenge'],
    );

    logger.info(
      { event: 'WEBHOOK VERIFIED', channel: 'whatsapp' },
      'WEBHOOK VERIFIED',
    );

    res.status(200).send(challenge);
  }),

  webhook: asyncHandler(async (req, res) => {
    const result = await whatsappService.processWebhook(req.body);

    logger.info(
      {
        event: 'WEBHOOK DONE',
        channel: 'whatsapp',
        result,
      },
      'WEBHOOK DONE',
    );

    sendSuccess(res, result);
  }),
};