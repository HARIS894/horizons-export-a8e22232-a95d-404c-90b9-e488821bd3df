import { body } from 'express-validator';

export const allowedAuthRoles = ['admin', 'coordinator', 'doctor', 'nurse', 'family', 'nri'];

export const registerValidator = [
  body('fullName').trim().isLength({ min: 3 }).withMessage('Full name is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('role').optional().isIn(allowedAuthRoles).withMessage('Invalid role.'),
  body('phone').optional().isString().trim(),
  body('preferredLanguage').optional().isString().trim(),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('password').isString().notEmpty().withMessage('Password is required.'),
  body('role').optional().isIn(allowedAuthRoles).withMessage('Invalid role.'),
];

export const refreshTokenValidator = [
  body('refreshToken').isString().notEmpty().withMessage('refreshToken is required.'),
];

export const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('role').optional().isIn(allowedAuthRoles).withMessage('Invalid role.'),
];

export const verifyOtpValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('otp').isString().isLength({ min: 4, max: 8 }).withMessage('A valid OTP is required.'),
  body('role').optional().isIn(allowedAuthRoles).withMessage('Invalid role.'),
];

export const resetPasswordValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('otp').isString().isLength({ min: 4, max: 8 }).withMessage('A valid OTP is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.'),
  body('role').optional().isIn(allowedAuthRoles).withMessage('Invalid role.'),
];