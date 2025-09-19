# 🍽️ Unified Restaurant Management System

## Overview

The restaurant management system now features a **unified dashboard** with role-based access control. All users (owners, managers, chefs, and waiters) login through a single entry point and are automatically routed to the appropriate dashboard view based on their role.

## 🔐 Authentication Flow

### Single Login Entry Point

- **URL**: `/login`
- **Component**: `UnifiedLogin.tsx`
- **Supports**: All user roles (owner, manager, chef, waiter)

### Role-Based Routing

After successful login, users are automatically redirected to their appropriate dashboard:

| Role        | Default Route | Dashboard View                              |
| ----------- | ------------- | ------------------------------------------- |
| **Owner**   | `/dashboard`  | Full management dashboard with all features |
| **Manager** | `/dashboard`  | Management dashboard + kitchen view access  |
| **Chef**    | `/kitchen`    | Kitchen operations dashboard                |
| **Waiter**  | `/kitchen`    | Order management dashboard                  |

## 🏗️ Architecture

### Unified Components

```
owner-dashboard/src/
├── components/
│   ├── auth/
│   │   ├── UnifiedLogin.tsx     # Single login form
│   │   └── RegisterForm.tsx     # User registration
│   └── layout/
│       ├── DashboardLayout.tsx  # Owner/Manager layout
│       └── StaffLayout.tsx      # Chef/Waiter layout
├── pages/
│   ├── Dashboard.tsx           # Owner/Manager dashboard
│   ├── KitchenDashboard.tsx    # Chef/Waiter dashboard
│   ├── StaffManagement.tsx     # Staff management
│   └── AddStaffMember.tsx      # Add new staff
└── utils/
    └── navigation.ts           # Role-based navigation logic
```

### Key Features

#### 🔄 Smart Routing

- Automatic redirection based on user role
- Protection against accessing unauthorized routes
- Seamless switching between views (for managers)

#### 🎨 Role-Specific Layouts

- **DashboardLayout**: Full sidebar navigation for owners/managers
- **StaffLayout**: Simplified header layout for chefs/waiters
- Dynamic navigation items based on user permissions

#### 👥 Cross-Role Functionality

- **Managers** can access both management and kitchen views
- Quick-switch buttons for role flexibility
- Consistent authentication across all views

## 🚀 Usage

### For Users

1. **Visit** the application URL
2. **Login** with your credentials at `/login`
3. **Automatically redirected** to your role-appropriate dashboard
4. **Access features** based on your permissions

### For Developers

```typescript
// Check user access to routes
import { canAccessRoute, getNavigationItems } from '../utils/navigation';

const userCanAccess = canAccessRoute('/staff', user?.role);
const navItems = getNavigationItems(user?.role);
```

### Role-Based Component Rendering

```jsx
// Conditional rendering based on role
{
  user?.role === 'manager' && <Link to="/kitchen">Switch to Kitchen View</Link>;
}

// Use appropriate layout
const useStaffLayout = user?.role === 'chef' || user?.role === 'waiter';
return useStaffLayout ? (
  <StaffLayout>{children}</StaffLayout>
) : (
  <DashboardLayout>{children}</DashboardLayout>
);
```

## 🔧 Configuration

### Environment Variables

- `NODE_ENV`: Shows test accounts in development mode
- API endpoints configured in `api-client`

### Navigation Configuration

Navigation items are defined in `utils/navigation.ts`:

```typescript
export const getNavigationItems = (userRole: UserRole): NavigationItem[] => {
  // Returns filtered navigation based on role
};
```

## 🧪 Testing

### Test Accounts

- **Owner**: `test@example.com` / `password123`
- **Chef**: `chef@restaurant.com` / `chef123`

### Authentication Testing

```bash
# Test owner login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test chef login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "chef@restaurant.com", "password": "chef123"}'
```

## 📱 User Experience

### Role-Specific Features

#### 👑 Owner/Manager Dashboard

- Staff management and analytics
- Menu and order management
- Financial reports and payments
- Full system administration

#### 👨‍🍳 Kitchen Dashboard

- Real-time order queue
- Order status updates
- Special instructions handling
- Kitchen-focused interface

#### 🧑‍💼 Service Dashboard

- Customer order management
- Table service tracking
- Order confirmation and completion
- Customer-focused workflow

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Route and feature protection
- **Automatic Logout**: On token expiration
- **CSRF Protection**: Through API client

## 🚀 Benefits

1. **Single Codebase**: Easier maintenance and deployment
2. **Unified Auth**: One login system for all users
3. **Role Flexibility**: Easy role changes and permissions
4. **Consistent UX**: Shared components and styling
5. **Better Security**: Centralized access control

---

_This unified system replaces the previous separate owner-dashboard and staff-dashboard applications, providing a more maintainable and user-friendly solution._
