import { Request, Response } from 'express';
import { MenuItemModel } from '@restaurant-monorepo/database';
import { CreateMenuItemRequest, MenuCategory } from '@restaurant-monorepo/shared-types';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

/**
 * Create Menu Item
 */
export const createMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const menuItemData: CreateMenuItemRequest = req.body;

  const menuItem = new MenuItemModel(menuItemData);
  await menuItem.save();

  logger.info('Menu item created', { 
    menuItemId: menuItem._id, 
    name: menuItem.name,
    createdBy: req.user?._id 
  });

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: {
      menuItem,
    },
  });
});

/**
 * Get Menu Items with Filters
 */
export const getMenuItems = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const category = req.query.category as MenuCategory;
  const available = req.query.available as string;
  const search = req.query.search as string;

  // Build filter object
  const filter: any = {};
  if (category) filter.category = category;
  if (available !== undefined) filter.available = available === 'true';
  if (search) {
    filter.$text = { $search: search };
  }

  const menuItems = await MenuItemModel.find(filter)
    .sort({ category: 1, name: 1 });

  res.json({
    success: true,
    data: {
      menuItems,
      count: menuItems.length,
    },
  });
});

/**
 * Get Menu Item by ID
 */
export const getMenuItemById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const menuItem = await MenuItemModel.findById(req.params.id);

  if (!menuItem) {
    throw ApiError.notFound('Menu item not found');
  }

  res.json({
    success: true,
    data: {
      menuItem,
    },
  });
});

/**
 * Update Menu Item
 */
export const updateMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const menuItem = await MenuItemModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    throw ApiError.notFound('Menu item not found');
  }

  logger.info('Menu item updated', { 
    menuItemId: menuItem._id, 
    name: menuItem.name,
    updatedBy: req.user?._id 
  });

  res.json({
    success: true,
    message: 'Menu item updated successfully',
    data: {
      menuItem,
    },
  });
});

/**
 * Delete Menu Item (Soft Delete)
 */
export const deleteMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const menuItem = await MenuItemModel.findByIdAndDelete(req.params.id);

  if (!menuItem) {
    throw ApiError.notFound('Menu item not found');
  }

  logger.info('Menu item deleted', { 
    menuItemId: menuItem._id, 
    name: menuItem.name,
    deletedBy: req.user?._id 
  });

  res.json({
    success: true,
    message: 'Menu item deleted successfully',
  });
});

/**
 * Toggle Menu Item Availability
 */
export const toggleAvailability = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const menuItem = await MenuItemModel.findById(req.params.id);

  if (!menuItem) {
    throw ApiError.notFound('Menu item not found');
  }

  menuItem.available = !menuItem.available;
  await menuItem.save();

  logger.info('Menu item availability toggled', { 
    menuItemId: menuItem._id, 
    name: menuItem.name,
    available: menuItem.available,
    toggledBy: req.user?._id 
  });

  res.json({
    success: true,
    message: `Menu item ${menuItem.available ? 'enabled' : 'disabled'} successfully`,
    data: {
      menuItem,
    },
  });
});

/**
 * Get Menu Categories with Item Counts
 */
export const getMenuCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const categories = await MenuItemModel.aggregate([
    { $match: { available: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      categories,
    },
  });
});

