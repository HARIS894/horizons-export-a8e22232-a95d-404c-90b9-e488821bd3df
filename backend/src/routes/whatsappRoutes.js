import { Router } from 'express';
import { whatsappController } from '../controllers/whatsappController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { idParamValidator, listQueryValidator } from '../validators/commonValidators.js';
import {
  createWhatsappContactValidator,
  manualWhatsappMediaValidator,
  manualWhatsappMessageValidator,
  retryFailedWhatsappValidator,
  sendWhatsappValidator,
  updateWhatsappConversationModeValidator,
  whatsappReactionValidator,
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

router.patch(
  '/conversations/:id/mode',
  [...idParamValidator, ...updateWhatsappConversationModeValidator],
  validateRequest,
  whatsappController.updateConversationMode,
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

router.get(
  '/logs/:id/media',
  idParamValidator,
  validateRequest,
  whatsappController.getMedia,
);

// Manual WhatsApp message from InstantCare Inbox
router.post('/messages', manualWhatsappMessageValidator, validateRequest, whatsappController.manualSend);

router.post('/messages/media', manualWhatsappMediaValidator, validateRequest, whatsappController.manualSendMedia);

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

router.post(
  '/logs/:id/reaction',
  [...idParamValidator, ...whatsappReactionValidator],
  validateRequest,
  whatsappController.react,
);

export default router;