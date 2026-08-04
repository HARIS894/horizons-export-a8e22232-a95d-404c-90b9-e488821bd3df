import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/jwtService.js';

export const authenticate = (req, _res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new ApiError(401, 'Authorization token is required.'));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token.'));
  }
};

export const authorize = (...allowedRoles) => (req, _res, next) => {
  const userRoles = req.user?.roles || [];
  if (!allowedRoles.length || allowedRoles.some((role) => userRoles.includes(role))) {
    next();
    return;
  }

  next(new ApiError(403, 'You do not have permission to access this resource.'));
};