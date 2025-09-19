import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '@restaurant-monorepo/database';
import {
  LoginRequest,
  LoginResponse,
  ROLE_PERMISSIONS,
} from '@restaurant-monorepo/shared-types';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

/**
 * User Registration
 */
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('User already exists with this email');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get permissions based on role
    const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];

    // Create user
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      role,
      permissions,
    });

    await user.save();

    // Generate token
    const token = generateToken(user.id);

    logger.info('User registered successfully', {
      userId: user.id,
      email,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  }
);

/**
 * User Login
 */
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password }: LoginRequest = req.body;

    // Find user with password field
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Update last login
    await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Generate token
    const token = generateToken(user.id);

    logger.info('User logged in successfully', { userId: user._id, email });

    const response: LoginResponse = {
      token,
      user: user.toJSON() as any,
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: response,
    });
  }
);

/**
 * Get Current User Profile
 */
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }
);

/**
 * Refresh Token
 */
export const refreshToken = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const newToken = generateToken(req.user._id.toString());

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
      },
    });
  }
);

/**
 * Logout (Optional - mainly for logging purposes)
 */
export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Log if user is authenticated, but don't require it
    if (req.user) {
      logger.info('User logged out', { userId: req.user._id });
    } else {
      logger.info('Anonymous logout attempt');
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);
