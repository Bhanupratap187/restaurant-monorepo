import { UserRole } from '../types';

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  requiredRoles?: UserRole[];
}

export const getNavigationItems = (userRole: UserRole): NavigationItem[] => {
  const allNavItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      requiredRoles: ['owner', 'manager'],
    },
    {
      name: 'Kitchen',
      href: '/kitchen',
      icon: '👨‍🍳',
      requiredRoles: ['chef', 'waiter', 'manager'],
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: '📋',
      requiredRoles: ['owner', 'manager', 'waiter'],
    },
    {
      name: 'Menu',
      href: '/menu',
      icon: '🍽️',
      requiredRoles: ['owner', 'manager'],
    },
    {
      name: 'Staff',
      href: '/staff',
      icon: '👥',
      requiredRoles: ['owner', 'manager'],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: '📈',
      requiredRoles: ['owner', 'manager'],
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: '💳',
      requiredRoles: ['owner', 'manager'],
    },
  ];

  // Filter navigation items based on user role
  return allNavItems.filter(
    (item) => !item.requiredRoles || item.requiredRoles.includes(userRole)
  );
};

// Get the default route for a user role
export const getDefaultRoute = (userRole: UserRole): string => {
  switch (userRole) {
    case 'chef':
    case 'waiter':
      return '/kitchen';
    case 'owner':
    case 'manager':
    default:
      return '/dashboard';
  }
};

// Check if a route is accessible for a role
export const canAccessRoute = (route: string, userRole: UserRole): boolean => {
  const navItems = getNavigationItems(userRole);
  return navItems.some((item) => route.startsWith(item.href));
};
