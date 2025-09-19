import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { StaffLogin } from '../components/auth/StaffLogin';
import { KitchenDashboard } from '../pages/KitchenDashboard';
import { LoadingSpinner, Button } from '@restaurant-monorepo/shared-ui';

// Protected Route Component for Staff
const StaffProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading, user, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading staff dashboard..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Simple header for staff dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple top bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🍽️</div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Staff Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                {user?.name} • {user?.role === 'chef' ? '👨‍🍳 Chef' : '🧑‍💼 Waiter'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Current time */}
            <div className="text-sm text-gray-600">
              {new Date().toLocaleTimeString()}
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => await logout()}
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              }
            >
              End Shift
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/kitchen" replace />;
  }

  return <>{children}</>;
};

// Main App Content
function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <StaffLogin />
          </PublicRoute>
        }
      />

      {/* Staff Dashboard Routes */}
      <Route
        path="/kitchen"
        element={
          <StaffProtectedRoute>
            <KitchenDashboard />
          </StaffProtectedRoute>
        }
      />

      {/* Alternative route names */}
      <Route
        path="/orders"
        element={
          <StaffProtectedRoute>
            <KitchenDashboard />
          </StaffProtectedRoute>
        }
      />

      {/* Redirect root to kitchen */}
      <Route path="/" element={<Navigate to="/kitchen" replace />} />

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍🍳</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-6">Page not found</p>
              <a
                href="/kitchen"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                Back to Kitchen
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
