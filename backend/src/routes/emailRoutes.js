import { Router } from 'express';
import { emailController } from '../controllers/emailController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { idParamValidator, listQueryValidator } from '../validators/commonValidators.js';
import { retryFailedEmailValidator, sendEmailValidator } from '../validators/emailValidators.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'coordinator'));
router.get('/templates', emailController.templateTypes);
router.get('/logs', listQueryValidator, validateRequest, emailController.listLogs);
router.get('/logs/:id', idParamValidator, validateRequest, emailController.getLogById);
router.post('/send', sendEmailValidator, validateRequest, emailController.send);
router.post('/retry-failed', retryFailedEmailValidator, validateRequest, emailController.retryFailed);
router.post('/logs/:id/retry', idParamValidator, validateRequest, emailController.retry);

export default router;