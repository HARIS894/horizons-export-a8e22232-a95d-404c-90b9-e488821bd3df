import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const createCrudController = (service) => ({
  list: asyncHandler(async (req, res) => {
    const result = await service.list(req.query);
    sendSuccess(res, result);
  }),

  create: asyncHandler(async (req, res) => {
    const result = await service.create(req.body);
    sendSuccess(res, result, 201);
  }),

  getById: asyncHandler(async (req, res) => {
    const result = await service.getById(req.params.id);
    sendSuccess(res, result);
  }),

  update: asyncHandler(async (req, res) => {
    const result = await service.update(req.params.id, req.body);
    sendSuccess(res, result);
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await service.remove(req.params.id);
    sendSuccess(res, result);
  }),
});