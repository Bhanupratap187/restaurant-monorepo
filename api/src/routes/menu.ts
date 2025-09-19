import { Router } from 'express';
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getMenuCategories,
} from '../controllers/menuController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createMenuItemSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().min(1, 'Description is required').max(500),
    price: z.number().min(0, 'Price cannot be negative'),
    category: z.enum([
      'appetizer',
      'main_course',
      'dessert',
      'beverage',
      'special',
    ]),
    prepTime: z.number().min(1, 'Prep time must be at least 1 minute'),
    allergens: z.array(z.string()).optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
  }),
};

const menuItemParamsSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid menu item ID'),
  }),
};

// Public routes (for viewing menu)
router.get('/', getMenuItems);
router.get('/categories', getMenuCategories);
router.get('/:id', validate(menuItemParamsSchema), getMenuItemById);

// Protected routes (require authentication)
router.use(authenticate);

// Menu management routes - only owners and managers
router.post(
  '/',
  authorize(['MANAGE_MENU']),
  validate(createMenuItemSchema),
  createMenuItem
);
router.put(
  '/:id',
  authorize(['MANAGE_MENU']),
  validate({
    ...menuItemParamsSchema,
    body: createMenuItemSchema.body.partial(),
  }),
  updateMenuItem
);
router.delete(
  '/:id',
  authorize(['MANAGE_MENU']),
  validate(menuItemParamsSchema),
  deleteMenuItem
);
router.patch(
  '/:id/toggle',
  authorize(['MANAGE_MENU']),
  validate(menuItemParamsSchema),
  toggleAvailability
);

export default router;
