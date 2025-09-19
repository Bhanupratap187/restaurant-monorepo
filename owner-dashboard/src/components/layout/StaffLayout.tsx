import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@restaurant-monorepo/shared-ui';
import { useNavigate } from 'react-router-dom';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'chef':
        return '👨‍🍳 Chef';
      case 'waiter':
        return '🧑‍💼 Waiter';
      case 'manager':
        return '👔 Manager';
      default:
        return '👤 Staff';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Staff Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🍽️</div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Kitchen Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                {user?.name} • {getRoleDisplay(user?.role || '')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Current time */}
            <div className="text-sm text-gray-600">
              {new Date().toLocaleTimeString()}
            </div>

            {/* Quick Actions for Staff */}
            <div className="flex items-center space-x-2">
              {user?.role === 'manager' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Manager View
                </Button>
              )}
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
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
      <main className="p-6">{children}</main>
    </div>
  );
};
