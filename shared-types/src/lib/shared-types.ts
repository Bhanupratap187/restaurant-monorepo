export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  customerName?: string;
}

// Menu Management Types
export type MenuCategory =
  | 'appetizer'
  | 'main_course'
  | 'dessert'
  | 'beverage'
  | 'special';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  available: boolean;
  prepTime: number; // in minutes
  allergens: string[];
  imageUrl?: string;
}

// User and Authentication Types
export type UserRole = 'owner' | 'manager' | 'chef' | 'waiter';

export type Permission =
  | 'VIEW_ORDERS'
  | 'UPDATE_ORDER_STATUS'
  | 'MANAGE_MENU'
  | 'VIEW_REPORTS'
  | 'MANAGE_STAFF'
  | 'PROCESS_PAYMENTS'
  | 'VIEW_CUSTOMER_DATA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
}

// API Request/Response Types
export interface CreateOrderRequest {
  tableNumber: number;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  customerName?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface CreateMenuItemRequest {
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  prepTime: number;
  allergens: string[];
  imageUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// RBAC Helper Types
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'VIEW_ORDERS',
    'UPDATE_ORDER_STATUS',
    'MANAGE_MENU',
    'VIEW_REPORTS',
    'MANAGE_STAFF',
    'PROCESS_PAYMENTS',
    'VIEW_CUSTOMER_DATA',
  ],
  manager: [
    'VIEW_ORDERS',
    'UPDATE_ORDER_STATUS',
    'VIEW_REPORTS',
    'PROCESS_PAYMENTS',
    'VIEW_CUSTOMER_DATA',
  ],
  chef: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
  waiter: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'VIEW_CUSTOMER_DATA'],
};
