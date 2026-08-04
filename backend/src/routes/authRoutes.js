import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
	allowedAuthRoles,
	forgotPasswordValidator,
	loginValidator,
	refreshTokenValidator,
	registerValidator,
	resetPasswordValidator,
	verifyOtpValidator,
} from '../validators/authValidators.js';
import { body, param } from 'express-validator';

const router = Router();
const roleParamValidator = [param('role').isIn(allowedAuthRoles).withMessage('Invalid login role.')];

router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/login/:role', [...roleParamValidator, ...loginValidator], validateRequest, authController.roleLogin);
router.post('/refresh', refreshTokenValidator, validateRequest, authController.refresh);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, authController.forgotPassword);
router.post('/verify-email-otp', verifyOtpValidator, validateRequest, authController.verifyEmailOtp);
router.post('/reset-password', resetPasswordValidator, validateRequest, authController.resetPassword);
router.post('/logout', body('refreshToken').isString().notEmpty().withMessage('refreshToken is required.'), validateRequest, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;