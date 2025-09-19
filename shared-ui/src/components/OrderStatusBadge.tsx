import React from 'react';
import { OrderStatus } from '@restaurant-monorepo/shared-types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: '⏳',
    },
    preparing: {
      label: 'Preparing',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: '👨‍🍳',
    },
    ready: {
      label: 'Ready',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: '✅',
    },
    served: {
      label: 'Served',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      icon: '🍽️',
    },
    cancelled: {
      label: 'Cancelled',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: '❌',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const config = statusConfig[status];
  const classes = `inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`;

  return (
    <span className={classes}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};
