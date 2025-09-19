import { Response } from 'express';
import { UserModel } from '@restaurant-monorepo/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Get All Users (Staff Management)
 */
export const getUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const isActive = req.query.isActive as string;

    // Build filter
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const [users, totalCount] = await Promise.all([
      UserModel.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit),
      UserModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  }
);

/**
 * Get User by ID
 */
export const getUserById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await UserModel.findById(req.params.id).select('-password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  }
);

/**
 * Update User Status (Activate/Deactivate)
 */
export const updateUserStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { isActive } = req.body;
    const userId = req.params.id;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user,
      },
    });
  }
);
