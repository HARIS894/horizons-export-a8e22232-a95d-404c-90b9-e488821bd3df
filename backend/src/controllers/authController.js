import { authService } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  }),

  roleLogin: asyncHandler(async (req, res) => {
    const result = await authService.login({
      ...req.body,
      role: req.params.role,
    });
    sendSuccess(res, result);
  }),

  refresh: asyncHandler(async (req, res) => {
    const result = await authService.refresh(req.body.refreshToken);
    sendSuccess(res, result);
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body);
    sendSuccess(res, result);
  }),

  verifyEmailOtp: asyncHandler(async (req, res) => {
    const result = await authService.verifyEmailOtp(req.body);
    sendSuccess(res, result);
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const result = await authService.resetPassword(req.body);
    sendSuccess(res, result);
  }),

  logout: asyncHandler(async (req, res) => {
    const result = await authService.logout(req.body.refreshToken);
    sendSuccess(res, result);
  }),

  me: asyncHandler(async (req, res) => {
    const result = await authService.me(req.user);
    sendSuccess(res, result);
  }),
};