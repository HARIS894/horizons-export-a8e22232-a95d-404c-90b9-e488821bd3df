import { asyncHandler } from '../utils/asyncHandler.js';
import { metaFlowService } from '../services/metaFlowService.js';

export const metaFlowController = {
  dataExchange: asyncHandler(async (req, res) => {
    const response = await metaFlowService.processRequest({
      body: req.body,
      headers: req.headers,
      rawBody: req.rawBody,
    });

    res.status(response.statusCode).type(response.contentType).send(response.body);
  }),
};