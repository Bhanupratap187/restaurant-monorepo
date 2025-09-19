import { Response } from 'express';
import { OrderModel, MenuItemModel } from '@restaurant-monorepo/database';
import { 
  CreateOrderRequest, 
  UpdateOrderStatusRequest,
  OrderStatus
} from '@restaurant-monorepo/shared-types';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

/**
 * Create New Order
 */
export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { tableNumber, items, customerName }: CreateOrderRequest = req.body;

  // Validate items and calculate total
  let total = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await MenuItemModel.findById(item.menuItemId);
    if (!menuItem) {
      throw ApiError.notFound(`Menu item ${item.menuItemId} not found`);
    }

    if (!menuItem.available) {
      throw ApiError.badRequest(`Menu item "${menuItem.name}" is currently unavailable`);
    }

    const itemTotal = menuItem.price * item.quantity;
    total += itemTotal;

    orderItems.push({
      menuItemId: item.menuItemId,
      menuItemName: menuItem.name,
      quantity: item.quantity,
      unitPrice: menuItem.price,
      totalPrice: itemTotal,
      specialInstructions: item.specialInstructions,
    });
  }

  // Create order
  const order = new OrderModel({
    tableNumber,
    items: orderItems,
    total,
    customerName,
    createdBy: req.user?._id,
  });

  await order.save();
  await order.populate('items.menuItemId');

  logger.info('Order created successfully', { 
    orderId: order._id, 
    orderNumber: order.orderNumber,
    tableNumber,
    total 
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order,
    },
  });
});

/**
 * Get Orders with Pagination and Filters
 */
export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as OrderStatus;
  const tableNumber = req.query.tableNumber as string;

  // Build filter object
  const filter: any = {};
  if (status) filter.status = status;
  if (tableNumber) filter.tableNumber = parseInt(tableNumber);

  // Execute queries in parallel
  const [orders, totalCount] = await Promise.all([
    OrderModel.find(filter)
      .populate('items.menuItemId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit),
    OrderModel.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    success: true,
    data: {
      orders,
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
});

/**
 * Get Order by ID
 */
export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const order = await OrderModel.findById(req.params.id as string)
    .populate('items.menuItemId')
    .populate('createdBy', 'name email');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  res.json({
    success: true,
    data: {
      order,
    },
  });
});

/**
 * Update Order Status
 */
export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status }: UpdateOrderStatusRequest = req.body;
  const orderId = req.params.id;

  const order = await OrderModel.findByIdAndUpdate(
    orderId,
    { status, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('items.menuItemId');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  logger.info('Order status updated', { 
    orderId: order.id, 
    orderNumber: order.orderNumber,
    newStatus: status,
    updatedBy: req.user?._id 
  });

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: {
      order,
    },
  });
});

/**
 * Get Order Statistics
 */
export const getOrderStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await OrderModel.aggregate([
    {
      $facet: {
        todayStats: [
          { $match: { createdAt: { $gte: today } } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$total' },
              avgOrderValue: { $avg: '$total' }
            }
          }
        ],
        statusBreakdown: [
          { $match: { createdAt: { $gte: today } } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      stats: stats[0],
    },
  });
});

