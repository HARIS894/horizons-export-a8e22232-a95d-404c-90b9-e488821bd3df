import { emailService } from '../services/emailService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const emailController = {
  templateTypes: asyncHandler(async (_req, res) => {
    sendSuccess(res, emailService.getTemplateTypes());
  }),

  send: asyncHandler(async (req, res) => {
    sendSuccess(res, await emailService.sendTemplateEmail(req.body), 201);
  }),

  listLogs: asyncHandler(async (req, res) => {
    sendSuccess(res, await emailService.listLogs(req.query));
  }),

  getLogById: asyncHandler(async (req, res) => {
    sendSuccess(res, await emailService.getLogById(req.params.id));
  }),

  retry: asyncHandler(async (req, res) => {
    sendSuccess(res, await emailService.retryEmail(req.params.id));
  }),

  retryFailed: asyncHandler(async (req, res) => {
    sendSuccess(res, await emailService.retryFailedEmails(req.body.limit));
  }),
};