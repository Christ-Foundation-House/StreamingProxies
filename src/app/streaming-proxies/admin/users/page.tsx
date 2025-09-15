'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';

import AdminErrorBoundary from '../_components/AdminErrorBoundary';
import UserList from './_components/UserList';
import UserFilters from './_components/UserFilters';
import RoleAssignmentModal from './_components/RoleAssignmentModal';
import PermissionManagementModal from './_components/PermissionManagementModal';

import { useUsers, User } from '@/lib/streaming-proxies/hooks/useUsers';
import { useRoles } from '@/lib/streaming-proxies/hooks/useRoles';
import { usePermissions } from '@/lib/streaming-proxies/hooks/usePermissions';

export default function UserManagement() {
  const router = useRouter();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal states
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Data hooks
  const { users, loading: usersLoading, error: usersError, updateUserPermissions, updateUserStatus } = useUsers();
  const { roles, loading: rolesLoading } = useRoles();
  const { permissions, loading: permissionsLoading } = usePermissions();

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle user actions
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setRoleModalOpen(true);
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setPermissionModalOpen(true);
  };

  const handleToggleStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      await updateUserStatus(userId, newStatus);
    } catch (error) {
      console.error('Failed to update user status:', error);
      // TODO: Show toast notification
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    // For now, we'll just close the modal
    // In a full implementation, this would update the user's role
    console.log('Assigning role', roleId, 'to user', userId);
    setRoleModalOpen(false);
    setSelectedUser(null);
  };

  const handleUpdatePermissions = async (userId: string, permissions: string[]) => {
    try {
      await updateUserPermissions(userId, permissions);
      setPermissionModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user permissions:', error);
      // TODO: Show toast notification
    }
  };

  const isLoading = usersLoading || rolesLoading || permissionsLoading;

  return (
    <AdminErrorBoundary pageName="User Management" showAdminActions={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/streaming-proxies/admin')}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                  <p className="text-sm text-gray-500">Manage user access and permissions</p>
                </div>
              </div>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Display */}
          {usersError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800">
                <strong>Error loading users:</strong> {usersError}
              </div>
            </div>
          )}

          {/* Filters */}
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            roles={roles}
          />

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading users...</p>
            </div>
          ) : (
            /* User List */
            <UserList
              users={filteredUsers}
              onEditUser={handleEditUser}
              onManagePermissions={handleManagePermissions}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>

        {/* Modals */}
        <RoleAssignmentModal
          user={selectedUser}
          roles={roles}
          isOpen={roleModalOpen}
          onClose={() => {
            setRoleModalOpen(false);
            setSelectedUser(null);
          }}
          onAssignRole={handleAssignRole}
        />

        <PermissionManagementModal
          user={selectedUser}
          permissions={permissions}
          isOpen={permissionModalOpen}
          onClose={() => {
            setPermissionModalOpen(false);
            setSelectedUser(null);
          }}
          onUpdatePermissions={handleUpdatePermissions}
        />
      </div>
    </AdminErrorBoundary>
  );
}