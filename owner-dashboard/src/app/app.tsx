import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { UnifiedLogin } from '../components/auth/UnifiedLogin';
import { RegisterForm } from '../components/auth/RegisterForm';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Dashboard } from '../pages/Dashboard';
import { StaffManagement } from '../pages/StaffManagement';
import { AddStaffMember } from '../pages/AddStaffMember';
import { KitchenDashboard } from '../pages/KitchenDashboard';
import { StaffLayout } from '../components/layout/StaffLayout';
import { LoadingSpinner } from '@restaurant-monorepo/shared-ui';
import { canAccessFeature } from '@restaurant-monorepo/rbac';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredFeature?: string;
}> = ({ children, requiredFeature }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based default routing
  const getDefaultRoute = () => {
    if (!user?.role) return '/login';

    switch (user?.role) {
      case 'chef':
      case 'waiter':
        return '/kitchen';
      case 'owner':
      case 'manager':
      default:
        return '/dashboard';
    }
  };

  // Check if user should use staff layout
  const useStaffLayout =
    user?.role && (user?.role === 'chef' || user?.role === 'waiter');

  // Auto-redirect to appropriate dashboard if accessing root or wrong default
  if (
    user?.role &&
    (location.pathname === '/' ||
      (location.pathname === '/dashboard' &&
        (user?.role === 'chef' || user?.role === 'waiter')) ||
      (location.pathname === '/kitchen' && user?.role === 'owner'))
  ) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  // Check if user has access to required feature
  if (
    requiredFeature &&
    user?.role &&
    !canAccessFeature(user?.role || '', requiredFeature)
  ) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this feature.
          </p>
          <p className="text-sm text-gray-500">
            Required feature:{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {requiredFeature}
            </code>
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Use appropriate layout based on user role
  if (useStaffLayout) {
    return <StaffLayout>{children}</StaffLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Public Route Component (only accessible when not authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    // Redirect to role-appropriate dashboard based on user role
    const defaultRoute =
      user?.role === 'chef' || user?.role === 'waiter'
        ? '/kitchen'
        : '/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

// Placeholder components for routes that aren't implemented yet
const ComingSoonPage: React.FC<{ title: string; description?: string }> = ({
  title,
  description = 'This feature is coming soon!',
}) => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-6">
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
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
        />
      </svg>
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-600 mb-6">{description}</p>
    <p className="text-sm text-gray-500">Check back soon for updates!</p>
  </div>
);

// Main App Component
function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <UnifiedLogin />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterForm />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredFeature="dashboard">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Orders Management */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute requiredFeature="orders">
            <ComingSoonPage
              title="Orders Management"
              description="View and manage all restaurant orders in real-time."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/new"
        element={
          <ProtectedRoute requiredFeature="orders">
            <ComingSoonPage
              title="Create New Order"
              description="Create a new order for a customer."
            />
          </ProtectedRoute>
        }
      />

      {/* Menu Management */}
      <Route
        path="/menu"
        element={
          <ProtectedRoute requiredFeature="menuManagement">
            <ComingSoonPage
              title="Menu Management"
              description="Manage your restaurant's menu items, categories, and pricing."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/menu/new"
        element={
          <ProtectedRoute requiredFeature="menuManagement">
            <ComingSoonPage
              title="Add Menu Item"
              description="Add a new item to your restaurant menu."
            />
          </ProtectedRoute>
        }
      />

      {/* Staff Management */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute requiredFeature="staff">
            <StaffManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/new"
        element={
          <ProtectedRoute requiredFeature="staff">
            <AddStaffMember />
          </ProtectedRoute>
        }
      />

      {/* Reports & Analytics */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredFeature="reports">
            <ComingSoonPage
              title="Reports & Analytics"
              description="View detailed reports and analytics about your restaurant performance."
            />
          </ProtectedRoute>
        }
      />

      {/* Payments */}
      <Route
        path="/payments"
        element={
          <ProtectedRoute requiredFeature="payments">
            <ComingSoonPage
              title="Payment Management"
              description="Process payments and manage financial transactions."
            />
          </ProtectedRoute>
        }
      />

      {/* Kitchen/Staff Routes */}
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute>
            <KitchenDashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to appropriate dashboard based on role */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-6">Page not found</p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
