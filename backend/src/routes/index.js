import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import emailRoutes from './emailRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import resourceRoutes from './resourceRoutes.js';
import whatsappRoutes from './whatsappRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'instantcare-backend',
      status: 'ok',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/emails', emailRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/notifications', notificationRoutes);
router.use(resourceRoutes);

export default router;