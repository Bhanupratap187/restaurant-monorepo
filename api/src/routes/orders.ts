import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// Validation schemas
const createOrderSchema = {
  body: z.object({
    tableNumber: z.number().min(1, 'Table number must be positive'),
    items: z
      .array(
        z.object({
          menuItemId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid menu item ID'),
          quantity: z.number().min(1, 'Quantity must be at least 1'),
          specialInstructions: z.string().optional(),
        })
      )
      .min(1, 'Order must have at least one item'),
    customerName: z.string().optional(),
  }),
};

const updateStatusSchema = {
  body: z.object({
    status: z.enum(['pending', 'preparing', 'ready', 'served', 'cancelled']),
  }),
};

const orderParamsSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
};

// Routes
router.post(
  '/',
  authorize(['VIEW_ORDERS']),
  validate(createOrderSchema),
  createOrder
);
router.get('/', authorize(['VIEW_ORDERS']), getOrders);
router.get('/stats', authorize(['VIEW_REPORTS']), getOrderStats);
router.get(
  '/:id',
  authorize(['VIEW_ORDERS']),
  validate(orderParamsSchema),
  getOrderById
);
router.patch(
  '/:id/status',
  authorize(['UPDATE_ORDER_STATUS']),
  validate({ ...orderParamsSchema, ...updateStatusSchema }),
  updateOrderStatus
);

export default router;
