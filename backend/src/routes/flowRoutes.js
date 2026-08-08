import { Router } from 'express';
import { metaFlowController } from '../controllers/metaFlowController.js';

const router = Router();

router.post('/meta', metaFlowController.dataExchange);

export default router;