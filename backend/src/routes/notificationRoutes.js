import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { idParamValidator, listQueryValidator } from '../validators/commonValidators.js';
import { resourceValidators } from '../validators/resourceValidators.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'coordinator'));
router.get('/', listQueryValidator, validateRequest, notificationController.list);
router.post('/', resourceValidators.notifications.create, validateRequest, notificationController.create);
router.get('/:id', idParamValidator, validateRequest, notificationController.getById);
router.patch('/:id', [...idParamValidator, ...resourceValidators.notifications.update], validateRequest, notificationController.update);
router.patch('/:id/read', idParamValidator, validateRequest, notificationController.markAsRead);
router.delete('/:id', idParamValidator, validateRequest, notificationController.remove);

export default router;