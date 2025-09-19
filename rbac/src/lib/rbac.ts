import {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
} from '@restaurant-monorepo/shared-types';

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
}

/**
 * Check if a user role has any of the specified permissions
 */
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if a user role has all of the specified permissions
 */
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if a role can access a specific feature
 */
export function canAccessFeature(userRole: UserRole, feature: string): boolean {
  const featurePermissions: Record<string, Permission[]> = {
    dashboard: ['VIEW_ORDERS', 'VIEW_REPORTS'],
    orders: ['VIEW_ORDERS'],
    orderManagement: ['UPDATE_ORDER_STATUS'],
    menu: ['VIEW_ORDERS'], // Everyone can view menu
    menuManagement: ['MANAGE_MENU'],
    staff: ['MANAGE_STAFF'],
    reports: ['VIEW_REPORTS'],
    payments: ['PROCESS_PAYMENTS'],
    customers: ['VIEW_CUSTOMER_DATA'],
  };

  const requiredPermissions = featurePermissions[feature];
  if (!requiredPermissions) {
    return false;
  }

  return hasAnyPermission(userRole, requiredPermissions);
}

/**
 * Get available features for a role
 */
export function getAvailableFeatures(userRole: UserRole): string[] {
  const features = [
    'dashboard',
    'orders',
    'orderManagement',
    'menu',
    'menuManagement',
    'staff',
    'reports',
    'payments',
    'customers',
  ];

  return features.filter((feature) => canAccessFeature(userRole, feature));
}

/**
 * Role hierarchy check - can roleA manage roleB?
 */
export function canManageRole(
  managerRole: UserRole,
  targetRole: UserRole
): boolean {
  const hierarchy = {
    owner: ['owner', 'manager', 'chef', 'waiter'],
    manager: ['chef', 'waiter'],
    chef: [],
    waiter: [],
  } as const;

  // Type assertion to help TypeScript infer the correct type
  return (
    (hierarchy[managerRole] as readonly UserRole[] | undefined)?.includes(
      targetRole
    ) || false
  );
}

export function filterByPermissions<T>(
  data: T[],
  userRole: UserRole,
  requiredPermission: Permission
): T[] {
  if (hasPermission(userRole, requiredPermission)) {
    return data;
  }
  return [];
}

/**
 * Navigation items based on role
 */
export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  permission: Permission;
  roles: UserRole[];
}

export function getNavigationItems(userRole: UserRole): NavigationItem[] {
  const allNavItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      permission: 'VIEW_ORDERS',
      roles: ['owner', 'manager', 'chef', 'waiter'],
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: '📋',
      permission: 'VIEW_ORDERS',
      roles: ['owner', 'manager', 'chef', 'waiter'],
    },
    {
      name: 'Menu',
      href: '/menu',
      icon: '🍽️',
      permission: 'MANAGE_MENU',
      roles: ['owner', 'manager'],
    },
    {
      name: 'Staff',
      href: '/staff',
      icon: '👥',
      permission: 'MANAGE_STAFF',
      roles: ['owner'],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: '📈',
      permission: 'VIEW_REPORTS',
      roles: ['owner', 'manager'],
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: '💰',
      permission: 'PROCESS_PAYMENTS',
      roles: ['owner', 'manager'],
    },
  ];

  return allNavItems.filter(
    (item) =>
      item.roles.includes(userRole) && hasPermission(userRole, item.permission)
  );
}

// Export the original function for backward compatibility
export function rbac(): string {
  return 'rbac';
}
