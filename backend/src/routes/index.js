import { Router } from 'express';
import authRoutes from './authRoutes.js';
import contentRoutes from './contentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import emailRoutes from './emailRoutes.js';
import flowRoutes from './flowRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import resourceRoutes from './resourceRoutes.js';
import whatsappRoutes from './whatsappRoutes.js';
import { databaseHealthService } from '../services/databaseHealthService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/health', asyncHandler(async (_req, res) => {
  const database = await databaseHealthService.getStatus();
  res.status(200).json({
    success: true,
    data: {
      service: 'instantcare-backend',
      status: 'ok',
      database,
    },
  });
}));

router.get('/health/database', asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: await databaseHealthService.getStatus(),
  });
}));

router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/emails', emailRoutes);
router.use('/flows', flowRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/notifications', notificationRoutes);
router.use(resourceRoutes);

export default router;