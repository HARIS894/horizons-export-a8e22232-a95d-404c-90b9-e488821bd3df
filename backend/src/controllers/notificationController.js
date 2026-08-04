import { notificationService } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const notificationController = {
  list: asyncHandler(async (req, res) => {
    sendSuccess(res, await notificationService.list(req.query));
  }),
  create: asyncHandler(async (req, res) => {
    sendSuccess(res, await notificationService.create(req.body), 201);
  }),
  getById: asyncHandler(async (req, res) => {
    sendSuccess(res, await notificationService.getById(req.params.id));
  }),
  update: asyncHandler(async (req, res) => {
    sendSuccess(res, await notificationService.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req, res) => {
    sendSuccess(res, await notificationService.remove(req.params.id));
  }),
  markAsRead: asyncHandler(async (req, res) => {
    sendSuccess(res, await notificationService.markAsRead(req.params.id));
  }),
};