import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '@restaurant-monorepo/database';
import {
  User,
  Permission,
  ROLE_PERMISSIONS,
} from '@restaurant-monorepo/shared-types';
import { env } from '../config/environment';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

export interface AuthenticatedRequest extends Request {
  user?: User & { _id: string };
}

/**
 * JWT Authentication Middleware
 */
export const authenticate = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      const user = await UserModel.findById(decoded.userId).select('+password');

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Invalid or expired token');
      }

      req.user = user as User & { _id: string };
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.unauthorized('Invalid token');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Token expired');
      }
      throw error;
    }
  }
);

/**
 * Permission-based Authorization
 */
export function authorize(requiredPermissions: Permission[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw ApiError.forbidden(
        `Insufficient permissions. Required: [${requiredPermissions.join(
          ', '
        )}]`
      );
    }

    next();
  };
}

/**
 * Generate JWT Token
 */
export function generateToken(userId: string): string {
  // @ts-ignore
  return jwt.sign({ userId }, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRES_IN as string,
  });
}
