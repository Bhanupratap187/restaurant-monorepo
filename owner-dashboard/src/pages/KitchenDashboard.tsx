import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  OrderStatusBadge,
} from '@restaurant-monorepo/shared-ui';
import { apiClient } from '@restaurant-monorepo/api-client';
import { useAuth } from '../hooks/useAuth';
import { OrderStatus } from '@restaurant-monorepo/shared-types';

interface Order {
  _id: string;
  tableNumber: number;
  status: string;
  items: Array<{
    menuItem: {
      name: string;
      price: number;
    };
    quantity: number;
    specialInstructions?: string;
  }>;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export const KitchenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();

    // Auto-refresh orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // ULTIMATE SAFETY: Don't render if user is not available
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await apiClient.getOrders({
        limit: 20,
        status: user?.role === 'chef' ? 'confirmed' : undefined, // Chefs see confirmed orders, waiters see all
      });

      if (response.success) {
        // Ensure the orders have the required _id property
        const ordersWithId = (response.data.orders || []).map((order: any) => ({
          _id: order._id,
          tableNumber: order.tableNumber,
          status: order.status,
          items: order.items,
          total: order.total,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        }));
        setOrders(ordersWithId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      const response = await apiClient.updateOrderStatus(orderId, newStatus as OrderStatus);

      if (response.success) {
        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : order
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusActions = (order: Order) => {
    const { status } = order;
    const isChef = user?.role === 'chef';
    const isWaiter = user?.role === 'waiter';
    const isManager = user?.role === 'manager';

    // Define available actions based on role and current status
    if (isChef || isManager) {
      switch (status) {
        case 'confirmed':
          return [
            { label: 'Start Cooking', status: 'preparing', variant: 'primary' },
          ];
        case 'preparing':
          return [
            { label: 'Ready to Serve', status: 'ready', variant: 'success' },
          ];
        default:
          return [];
      }
    }

    if (isWaiter || isManager) {
      switch (status) {
        case 'pending':
          return [
            { label: 'Confirm Order', status: 'confirmed', variant: 'primary' },
            { label: 'Cancel', status: 'cancelled', variant: 'destructive' },
          ];
        case 'ready':
          return [{ label: 'Served', status: 'completed', variant: 'success' }];
        default:
          return [];
      }
    }

    return [];
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 min ago';
    return `${diffMinutes} mins ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'chef' ? 'Kitchen Orders' : 'Order Management'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'chef'
              ? 'Manage food preparation and cooking status'
              : 'Track and manage customer orders'}
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={fetchOrders}
          loading={loading}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        >
          Refresh
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center text-red-700">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    Table {order.tableNumber}
                  </CardTitle>
                  <div className="flex flex-col items-end space-y-2">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                    <span className="text-xs text-gray-500">
                      {getOrderAge(order.createdAt)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex-1">
                        <span className="font-medium">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        {item.specialInstructions && (
                          <p className="text-xs text-orange-600 mt-1">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <span className="text-gray-500 ml-2">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Total: ${order.total.toFixed(2)}</span>
                    <span>Order: {formatTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {getStatusActions(order).map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant as any}
                      size="sm"
                      loading={updatingOrder === order._id}
                      onClick={() =>
                        updateOrderStatus(order._id, action.status)
                      }
                      className="flex-1"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Orders
            </h3>
            <p className="text-gray-600">
              {user?.role === 'chef'
                ? 'No orders ready for preparation at the moment.'
                : 'All orders have been processed.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
