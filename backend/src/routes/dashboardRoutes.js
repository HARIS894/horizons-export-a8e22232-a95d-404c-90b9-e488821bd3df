import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'coordinator'));
router.get('/overview', dashboardController.overview);
router.get('/widgets', dashboardController.widgets);
router.get('/modules', dashboardController.modules);

export default router;