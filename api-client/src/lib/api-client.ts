import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  User,
  Order,
  MenuItem,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CreateMenuItemRequest,
  UserRole,
} from '@restaurant-monorepo/shared-types';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    message: string;
    status: number;
    timestamp: string;
    path: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface OrderStats {
  todayStats?: Array<{
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  }>;
  statusBreakdown?: Array<{
    _id: string;
    count: number;
  }>;
}

/**
 * Centralized API Client for Restaurant Management System
 */
export class RestaurantApiClient {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuth();
          // Dispatch event for auth failure (only in browser)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get stored auth token
   */
  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // =============================================================================
  // AUTHENTICATION ENDPOINTS
  // =============================================================================

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  /**
   * User registration
   */
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<ApiResponse<LoginResponse>> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.api.post('/auth/refresh');
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<null>> {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  // =============================================================================
  // MENU ENDPOINTS
  // =============================================================================

  /**
   * Get menu items with optional filters
   */
  async getMenuItems(params?: {
    category?: string;
    available?: boolean;
    search?: string;
  }): Promise<ApiResponse<{ menuItems: MenuItem[]; count: number }>> {
    const response = await this.api.get('/menu', { params });
    return response.data;
  }

  /**
   * Get menu item by ID
   */
  async getMenuItemById(
    id: string
  ): Promise<ApiResponse<{ menuItem: MenuItem }>> {
    const response = await this.api.get(`/menu/${id}`);
    return response.data;
  }

  /**
   * Create new menu item
   */
  async createMenuItem(
    menuItem: CreateMenuItemRequest
  ): Promise<ApiResponse<{ menuItem: MenuItem }>> {
    const response = await this.api.post('/menu', menuItem);
    return response.data;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(
    id: string,
    menuItem: Partial<CreateMenuItemRequest>
  ): Promise<ApiResponse<{ menuItem: MenuItem }>> {
    const response = await this.api.put(`/menu/${id}`, menuItem);
    return response.data;
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete(`/menu/${id}`);
    return response.data;
  }

  /**
   * Toggle menu item availability
   */
  async toggleMenuItemAvailability(
    id: string
  ): Promise<ApiResponse<{ menuItem: MenuItem }>> {
    const response = await this.api.patch(`/menu/${id}/toggle`);
    return response.data;
  }

  /**
   * Get menu categories with statistics
   */
  async getMenuCategories(): Promise<
    ApiResponse<{
      categories: Array<{
        _id: string;
        count: number;
        avgPrice: number;
        minPrice: number;
        maxPrice: number;
      }>;
    }>
  > {
    const response = await this.api.get('/menu/categories');
    return response.data;
  }

  // =============================================================================
  // ORDER ENDPOINTS
  // =============================================================================

  /**
   * Get orders with pagination and filters
   */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    tableNumber?: number;
  }): Promise<
    ApiResponse<{
      orders: Order[];
      pagination: PaginatedResponse<Order>['pagination'];
    }>
  > {
    const response = await this.api.get('/orders', { params });
    return response.data;
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<ApiResponse<{ order: Order }>> {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  /**
   * Create new order
   */
  async createOrder(
    orderData: CreateOrderRequest
  ): Promise<ApiResponse<{ order: Order }>> {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    status: UpdateOrderStatusRequest['status']
  ): Promise<ApiResponse<{ order: Order }>> {
    const response = await this.api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<ApiResponse<{ stats: OrderStats[] }>> {
    const response = await this.api.get('/orders/stats');
    return response.data;
  }

  // =============================================================================
  // USER MANAGEMENT ENDPOINTS
  // =============================================================================

  /**
   * Get all users (staff management)
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<
    ApiResponse<{
      users: User[];
      pagination: PaginatedResponse<User>['pagination'];
    }>
  > {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(
    id: string,
    isActive: boolean
  ): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Check if API is healthy
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await axios.get(
      `${this.baseURL.replace('/api', '')}/health`
    );
    return response.data;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

// Create and export a singleton instance
export const apiClient = new RestaurantApiClient();

// Export for backward compatibility
export function apiClient_legacy(): string {
  return 'api-client';
}
