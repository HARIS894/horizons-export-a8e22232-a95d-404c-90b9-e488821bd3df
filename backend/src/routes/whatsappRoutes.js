import { Router } from 'express';
import { whatsappController } from '../controllers/whatsappController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { idParamValidator, listQueryValidator } from '../validators/commonValidators.js';
import {
  createWhatsappContactValidator,
  manualWhatsappMessageValidator,
  retryFailedWhatsappValidator,
  sendWhatsappValidator,
} from '../validators/whatsappValidators.js';

const router = Router();

router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.webhook);

router.use(authenticate);
router.use(authorize('admin', 'coordinator'));

router.get('/templates', whatsappController.templateTypes);

router.get(
  '/conversations',
  listQueryValidator,
  validateRequest,
  whatsappController.listConversations,
);

router.get(
  '/conversations/:id/messages',
  [...idParamValidator, ...listQueryValidator],
  validateRequest,
  whatsappController.getConversationMessages,
);

router.post(
  '/contacts',
  createWhatsappContactValidator,
  validateRequest,
  whatsappController.upsertContact,
);

router.get(
  '/logs',
  listQueryValidator,
  validateRequest,
  whatsappController.listLogs,
);

router.get(
  '/logs/:id',
  idParamValidator,
  validateRequest,
  whatsappController.getLogById,
);

// Manual WhatsApp message from InstantCare Inbox
router.post('/messages', manualWhatsappMessageValidator, validateRequest, whatsappController.manualSend);

router.post(
  '/send',
  sendWhatsappValidator,
  validateRequest,
  whatsappController.send,
);

router.post(
  '/retry-failed',
  retryFailedWhatsappValidator,
  validateRequest,
  whatsappController.retryFailed,
);

router.post(
  '/logs/:id/retry',
  idParamValidator,
  validateRequest,
  whatsappController.retry,
);

export default router;