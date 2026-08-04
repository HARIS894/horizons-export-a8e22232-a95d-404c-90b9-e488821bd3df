import { dashboardService } from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const dashboardController = {
  overview: asyncHandler(async (_req, res) => {
    sendSuccess(res, await dashboardService.getOverview());
  }),
  widgets: asyncHandler(async (_req, res) => {
    sendSuccess(res, await dashboardService.getWidgets());
  }),
  modules: asyncHandler(async (_req, res) => {
    sendSuccess(res, dashboardService.getModules());
  }),
};