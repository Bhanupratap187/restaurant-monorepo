import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, OrderStatusBadge, LoadingSpinner } from '@restaurant-monorepo/shared-ui';
import { apiClient } from '@restaurant-monorepo/api-client';
import { Order, OrderStatus } from '@restaurant-monorepo/shared-types';
import { useAuth } from '../hooks/useAuth';

export const KitchenDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await apiClient.getOrders({ 
        limit: 50,
        page: 1 
      });

      if (response.success) {
        // Filter to show only orders that need attention
        const activeOrders = response.data.orders.filter(order => 
          ['pending', 'preparing', 'ready'].includes(order.status)
        );
        setOrders(activeOrders);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrder(orderId);
      const response = await apiClient.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            (order.id || order._id) === orderId 
              ? { ...order, status: newStatus }
              : order
          ).filter(order => 
            // Remove completed/served orders from view
            !['served', 'cancelled'].includes(order.status)
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchOrders, 15000);

    return () => clearInterval(interval);
  }, []);

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'served'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] as OrderStatus || null;
  };

  const getStatusAction = (status: OrderStatus) => {
    const actions = {
      pending: { label: 'Start Cooking', variant: 'primary' as const, icon: '👨‍🍳' },
      preparing: { label: 'Mark Ready', variant: 'success' as const, icon: '✅' },
      ready: { label: 'Mark Served', variant: 'secondary' as const, icon: '🍽️' }
    };
    return actions[status];
  };

  const ordersByStatus = {
    pending: orders.filter(order => order.status === 'pending'),
    preparing: orders.filter(order => order.status === 'preparing'), 
    ready: orders.filter(order => order.status === 'ready')
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading kitchen dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="mr-3 text-4xl">👨‍🍳</span>
              Kitchen Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <Button
            onClick={fetchOrders}
            variant="ghost"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Order Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⏳</span>
            New Orders ({ordersByStatus.pending.length})
          </h2>
          <div className="space-y-4">
            {ordersByStatus.pending.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  No new orders
                </CardContent>
              </Card>
            ) : (
              ordersByStatus.pending.map(order => (
                <OrderCard
                  key={order.id || order._id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  isUpdating={updatingOrder === (order.id || order._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Preparing Orders */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👨‍🍳</span>
            In Progress ({ordersByStatus.preparing.length})
          </h2>
          <div className="space-y-4">
            {ordersByStatus.preparing.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  No orders in progress
                </CardContent>
              </Card>
            ) : (
              ordersByStatus.preparing.map(order => (
                <OrderCard
                  key={order.id || order._id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  isUpdating={updatingOrder === (order.id || order._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Ready Orders */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">✅</span>
            Ready to Serve ({ordersByStatus.ready.length})
          </h2>
          <div className="space-y-4">
            {ordersByStatus.ready.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No orders ready
                </CardContent>
              </Card>
            ) : (
              ordersByStatus.ready.map(order => (
                <OrderCard
                  key={order.id || order._id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  isUpdating={updatingOrder === (order.id || order._id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  isUpdating: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, isUpdating }) => {
  const nextStatus = getNextStatus(order.status);
  const statusAction = getStatusAction(order.status);
  const orderId = order.id || (order as any)._id;

  const timeSinceCreated = Date.now() - new Date(order.createdAt).getTime();
  const minutesAgo = Math.floor(timeSinceCreated / 60000);

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Table {order.tableNumber}</CardTitle>
            {order.customerName && (
              <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
            )}
          </div>
          <div className="text-right">
            <OrderStatusBadge status={order.status} />
            <p className="text-xs text-gray-500 mt-1">{minutesAgo}m ago</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Order Items */}
        <div className="space-y-2 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <span className="font-medium">{item.quantity}x {item.menuItemName}</span>
                {item.specialInstructions && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ {item.specialInstructions}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-600">${item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Total & Action */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Total: ${order.total.toFixed(2)}
          </div>
          {nextStatus && statusAction && (
            <Button
              onClick={() => onUpdateStatus(orderId, nextStatus)}
              variant={statusAction.variant}
              loading={isUpdating}
              size="sm"
              icon={<span>{statusAction.icon}</span>}
            >
              {statusAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
