import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwtService.js';
import { userModel } from '../models/userModel.js';
import { authSessionModel } from '../models/authSessionModel.js';
import { emailOtpModel } from '../models/emailOtpModel.js';
import { emailService } from './emailService.js';

const allowedAuthRoles = ['admin', 'coordinator', 'doctor', 'nurse', 'family', 'nri'];

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const createOtpCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const normalizeRole = (role) => {
  if (!role) {
    return null;
  }

  return String(role).trim().toLowerCase();
};

const toIso = (date) => date.toISOString();

const buildTokenPayload = (user, roles) => ({
  sub: user.id,
  email: user.email,
  roles,
  primaryRole: roles[0] || null,
});

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  phone: user.phone || null,
  preferredLanguage: user.preferredLanguage || null,
  status: user.status || 'active',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const isSessionActive = (session) => {
  if (!session || session.status !== 'active' || session.revoked_at) {
    return false;
  }

  return new Date(session.expires_at).getTime() > Date.now();
};

const getOtpExpiryIso = () => new Date(Date.now() + env.passwordResetOtpExpiresMinutes * 60 * 1000).toISOString();

const getLatestPendingOtp = async (email, purpose) => {
  const result = await emailOtpModel.list({ page: 1, limit: 20, email: email.toLowerCase(), purpose, status: 'pending', sortBy: 'created_at', sortOrder: 'desc' });
  return result.items.find((entry) => !entry.consumed_at) || null;
};

const getUserRoles = async (userId) => {
  const roles = await userModel.getUserRoles(userId);
  return roles.length ? roles : [];
};

const issueAuthTokens = async ({ user, roles, meta = {} }) => {
  const tokenPayload = buildTokenPayload(user, roles);
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ ...tokenPayload, tokenType: 'refresh' });
  const refreshTokenHash = hashValue(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const session = await authSessionModel.create({
    user_id: user.id,
    refresh_token_hash: refreshTokenHash,
    session_type: 'refresh_token',
    role_slug: roles[0] || 'family',
    user_agent: meta.userAgent || null,
    ip_address: meta.ipAddress || null,
    expires_at: expiresAt,
    last_used_at: new Date().toISOString(),
    revoked_at: null,
    status: 'active',
    metadata: {},
  });

  return {
    accessToken,
    refreshToken,
    session,
  };
};

const ensureRoleAllowed = (roles, requestedRole) => {
  if (!requestedRole) {
    return roles;
  }

  if (!allowedAuthRoles.includes(requestedRole)) {
    throw new ApiError(400, 'Unsupported role requested.');
  }

  if (!roles.includes(requestedRole)) {
    throw new ApiError(403, `This account does not have the ${requestedRole} role.`);
  }

  return [requestedRole, ...roles.filter((role) => role !== requestedRole)];
};

const getFallbackUserForRole = (role) => {
  if (role !== 'admin') {
    return null;
  }

  return {
    id: 'demo-admin',
    email: env.demoAdminEmail,
    fullName: 'InstantCare Admin',
    phone: null,
    preferredLanguage: null,
    status: 'active',
    createdAt: null,
    updatedAt: null,
  };
};

export const authService = {
  async register(payload) {
    const existingUser = await userModel.findByEmail(payload.email);
    if (existingUser) {
      throw new ApiError(409, 'User already exists.');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await userModel.createUser({
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone || null,
      preferred_language: payload.preferredLanguage || null,
      passwordHash,
    });

    const assignedRole = normalizeRole(payload.role) || 'family';
    await userModel.assignRole(user.id, assignedRole);
    const roles = await getUserRoles(user.id);
    const tokenSet = await issueAuthTokens({ user, roles, meta: payload.meta || {} });

    const safeUser = sanitizeUser(user);

    return {
      user: safeUser,
      roles,
      accessToken: tokenSet.accessToken,
      refreshToken: tokenSet.refreshToken,
    };
  },

  async login(payload) {
    const requestedRole = normalizeRole(payload.role);
    const user = await userModel.findByEmail(payload.email);

    if (user) {
      const matches = await bcrypt.compare(payload.password, user.passwordHash || '');
      if (!matches) {
        throw new ApiError(401, 'Invalid email or password.');
      }

      const roles = ensureRoleAllowed(await getUserRoles(user.id), requestedRole);
      await userModel.updateUser(user.id, { last_login_at: new Date().toISOString() });
      const tokenSet = await issueAuthTokens({
        user,
        roles,
        meta: payload.meta || {},
      });

      const safeUser = sanitizeUser(user);
      return {
        user: safeUser,
        roles,
        accessToken: tokenSet.accessToken,
        refreshToken: tokenSet.refreshToken,
      };
    }

    if (payload.email.toLowerCase() === env.demoAdminEmail.toLowerCase() && payload.password === env.demoAdminPassword) {
      const roles = ensureRoleAllowed(['admin'], requestedRole || 'admin');
      const safeUser = getFallbackUserForRole('admin');
      const accessToken = signAccessToken({ sub: safeUser.id, email: safeUser.email, roles, primaryRole: 'admin' });
      const refreshToken = signRefreshToken({ sub: safeUser.id, email: safeUser.email, roles, primaryRole: 'admin', tokenType: 'refresh' });

      return {
        user: safeUser,
        roles,
        accessToken,
        refreshToken,
      };
    }

    throw new ApiError(401, 'Invalid email or password.');
  },

  async refresh(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token.');
    }

    if (decoded.sub === 'demo-admin') {
      const roles = decoded.roles || ['admin'];
      return {
        accessToken: signAccessToken({ sub: decoded.sub, email: decoded.email, roles, primaryRole: roles[0] }),
        refreshToken: signRefreshToken({ sub: decoded.sub, email: decoded.email, roles, primaryRole: roles[0], tokenType: 'refresh' }),
      };
    }

    const hashedToken = hashValue(refreshToken);
    const result = await authSessionModel.list({ page: 1, limit: 10, user_id: decoded.sub, status: 'active' });
    const session = result.items.find((item) => item.refresh_token_hash === hashedToken);

    if (!isSessionActive(session)) {
      throw new ApiError(401, 'Refresh session is invalid or expired.');
    }

    await authSessionModel.update(session.id, {
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    });

    const user = await userModel.findById(decoded.sub);
    const roles = ensureRoleAllowed(await getUserRoles(user.id), decoded.primaryRole || decoded.roles?.[0]);
    const tokenSet = await issueAuthTokens({ user, roles });

    return {
      accessToken: tokenSet.accessToken,
      refreshToken: tokenSet.refreshToken,
      roles,
    };
  },

  async forgotPassword(payload) {
    const requestedRole = normalizeRole(payload.role);
    const user = await userModel.findByEmail(payload.email);
    if (!user) {
      return {
        success: true,
        message: 'If the account exists, an OTP has been sent to the registered email address.',
      };
    }

    const roles = await getUserRoles(user.id);
    ensureRoleAllowed(roles, requestedRole);

    const existingOtp = await getLatestPendingOtp(user.email, 'forgot_password');
    if (existingOtp) {
      await emailOtpModel.update(existingOtp.id, {
        status: 'expired',
      });
    }

    const otp = createOtpCode();
    const otpHash = await bcrypt.hash(otp, 10);
    const record = await emailOtpModel.create({
      user_id: user.id,
      email: user.email,
      otp_hash: otpHash,
      purpose: 'forgot_password',
      role_slug: requestedRole || roles[0] || 'family',
      expires_at: getOtpExpiryIso(),
      verified_at: null,
      consumed_at: null,
      status: 'pending',
      attempt_count: 0,
      max_attempts: 5,
      metadata: {},
    });

    await emailService.sendTemplateEmail({
      templateType: 'email-otp',
      to: user.email,
      recipientUserId: user.id,
      templateData: {
        email: user.email,
        otp,
        expiresIn: `${env.passwordResetOtpExpiresMinutes} minutes`,
        purpose: 'Forgot password',
      },
    });

    return {
      success: true,
      otpRequestId: record.id,
      message: 'If the account exists, an OTP has been sent to the registered email address.',
    };
  },

  async verifyEmailOtp(payload) {
    const requestedRole = normalizeRole(payload.role);
    const user = await userModel.findByEmail(payload.email);
    if (!user) {
      throw new ApiError(404, 'Account not found.');
    }

    const otpRecord = await getLatestPendingOtp(user.email, 'forgot_password');
    if (!otpRecord) {
      throw new ApiError(400, 'No active OTP found for this email address.');
    }

    if (requestedRole && otpRecord.role_slug && otpRecord.role_slug !== requestedRole) {
      throw new ApiError(403, 'OTP role does not match the requested login role.');
    }

    if (new Date(otpRecord.expires_at).getTime() <= Date.now()) {
      await emailOtpModel.update(otpRecord.id, { status: 'expired' });
      throw new ApiError(400, 'OTP has expired.');
    }

    if (Number(otpRecord.attempt_count || 0) >= Number(otpRecord.max_attempts || 5)) {
      await emailOtpModel.update(otpRecord.id, { status: 'locked' });
      throw new ApiError(429, 'Maximum OTP attempts reached.');
    }

    const matches = await bcrypt.compare(payload.otp, otpRecord.otp_hash || '');
    if (!matches) {
      await emailOtpModel.update(otpRecord.id, {
        attempt_count: Number(otpRecord.attempt_count || 0) + 1,
      });
      throw new ApiError(401, 'Invalid OTP.');
    }

    const updated = await emailOtpModel.update(otpRecord.id, {
      status: 'verified',
      verified_at: new Date().toISOString(),
    });

    return {
      success: true,
      otpRequestId: updated.id,
      verifiedAt: updated.verified_at || updated.verifiedAt,
    };
  },

  async resetPassword(payload) {
    const requestedRole = normalizeRole(payload.role);
    const user = await userModel.findByEmail(payload.email);
    if (!user) {
      throw new ApiError(404, 'Account not found.');
    }

    const roles = await getUserRoles(user.id);
    ensureRoleAllowed(roles, requestedRole);

    const otpRecord = await getLatestPendingOtp(user.email, 'forgot_password');
    if (!otpRecord) {
      throw new ApiError(400, 'No active OTP found for this email address.');
    }

    if (new Date(otpRecord.expires_at).getTime() <= Date.now()) {
      await emailOtpModel.update(otpRecord.id, { status: 'expired' });
      throw new ApiError(400, 'OTP has expired.');
    }

    const matches = await bcrypt.compare(payload.otp, otpRecord.otp_hash || '');
    if (!matches) {
      throw new ApiError(401, 'Invalid OTP.');
    }

    const passwordHash = await bcrypt.hash(payload.newPassword, 10);
    await userModel.updateUser(user.id, { password_hash: passwordHash });
    await emailOtpModel.update(otpRecord.id, {
      status: 'consumed',
      consumed_at: new Date().toISOString(),
    });

    const sessions = await authSessionModel.list({ page: 1, limit: 100, user_id: user.id, status: 'active' });
    await Promise.all(
      sessions.items.map((session) =>
        authSessionModel.update(session.id, {
          status: 'revoked',
          revoked_at: new Date().toISOString(),
        }),
      ),
    );

    return {
      success: true,
      message: 'Password reset successfully.',
    };
  },

  async logout(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return { success: true };
    }

    if (decoded.sub === 'demo-admin') {
      return { success: true };
    }

    const hashedToken = hashValue(refreshToken);
    const sessions = await authSessionModel.list({ page: 1, limit: 50, user_id: decoded.sub, status: 'active' });
    const session = sessions.items.find((item) => item.refresh_token_hash === hashedToken);
    if (!session) {
      return { success: true };
    }

    await authSessionModel.update(session.id, {
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    });

    return { success: true };
  },

  async me(authUser) {
    if (authUser.sub === 'demo-admin') {
      return {
        id: 'demo-admin',
        email: env.demoAdminEmail,
        fullName: 'InstantCare Admin',
        roles: ['admin'],
      };
    }

    const user = await userModel.findById(authUser.sub);
    const roles = await getUserRoles(user.id);
    return {
      ...sanitizeUser(user),
      roles,
      primaryRole: roles[0] || null,
    };
  },
};