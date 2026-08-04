import { contentService } from '../services/contentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const contentController = {
  libraryDataset: asyncHandler(async (req, res) => {
    sendSuccess(res, await contentService.getLibraryDataset(req.query));
  }),
  search: asyncHandler(async (req, res) => {
    sendSuccess(res, await contentService.search(req.query.query || ''));
  }),
};