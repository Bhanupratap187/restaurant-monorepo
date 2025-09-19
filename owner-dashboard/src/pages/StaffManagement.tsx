import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from '@restaurant-monorepo/shared-ui';
import { apiClient } from '@restaurant-monorepo/api-client';
import { User } from '@restaurant-monorepo/shared-types';

type StaffMember = Omit<User, 'createdAt' | 'lastLogin'> & {
  _id: string;
  createdAt: Date;
  lastLogin?: Date;
};

export const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getUsers();

      if (response.success) {
        // Filter for staff roles only (not owners)
        const staffMembers = response.data.users.filter(
          (user) =>
            user?.role && ['chef', 'waiter', 'manager'].includes(user?.role)
        ) as StaffMember[];

        setStaff(staffMembers);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);

      const response = await apiClient.updateUserStatus(userId, !currentStatus);

      if (response.success) {
        // Update local state
        setStaff((prevStaff) =>
          prevStaff.map((member) =>
            member._id === userId
              ? { ...member, isActive: !currentStatus }
              : member
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'chef':
        return 'bg-orange-100 text-orange-800';
      case 'waiter':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'chef':
        return '👨‍🍳';
      case 'waiter':
        return '🧑‍💼';
      case 'manager':
        return '👔';
      default:
        return '👤';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">
            Manage restaurant staff, roles, and permissions.
          </p>
        </div>

        <Link to="/staff/new">
          <Button
            variant="primary"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
          >
            Add Staff Member
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center text-red-700">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">👥</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {staff.length}
                </div>
                <div className="text-sm text-gray-600">Total Staff</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">👨‍🍳</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {staff.filter((s) => s.role === 'chef').length}
                </div>
                <div className="text-sm text-gray-600">Chefs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🧑‍💼</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {staff.filter((s) => s.role === 'waiter').length}
                </div>
                <div className="text-sm text-gray-600">Waiters</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {staff.filter((s) => s.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {staff.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {staff.map((member) => (
                <div
                  key={member._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{getRoleIcon(member.role)}</div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {member.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                              member.role
                            )}`}
                          >
                            {member.role.charAt(0).toUpperCase() +
                              member.role.slice(1)}
                          </span>
                          {!member.isActive && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-1">
                          {member.email}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            Joined: {formatDate(member.createdAt instanceof Date ? member.createdAt.toISOString() : member.createdAt)}
                          </span>
                          <span>
                            Last login: {member.lastLogin ? formatDate(member.lastLogin instanceof Date ? member.lastLogin.toISOString() : member.lastLogin) : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        variant={member.isActive ? 'ghost' : 'primary'}
                        size="sm"
                        loading={actionLoading === member._id}
                        onClick={() =>
                          toggleUserStatus(member._id, member.isActive)
                        }
                      >
                        {member.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
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
                    d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 10a3 3 0 110-6 3 3 0 010 6zm7 0a3 3 0 11-6 0 3 3 0 016 0zM15 16a3 3 0 00-3 3v1h-6a3 3 0 01-3-3v-1a3 3 0 013-3h6z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Staff Members
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first staff member.
              </p>
              <Link to="/staff/new">
                <Button variant="primary">Add First Staff Member</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
