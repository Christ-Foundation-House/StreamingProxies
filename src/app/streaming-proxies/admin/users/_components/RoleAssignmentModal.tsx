'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Shield, Check } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  createdAt: Date;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface RoleAssignmentModalProps {
  user: User | null;
  roles: Role[];
  isOpen: boolean;
  onClose: () => void;
  onAssignRole: (userId: string, roleId: string) => void;
}

export default function RoleAssignmentModal({
  user,
  roles,
  isOpen,
  onClose,
  onAssignRole
}: RoleAssignmentModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleAssignRole = async () => {
    if (!selectedRole || selectedRole === user.role) return;
    
    setIsLoading(true);
    try {
      await onAssignRole(user.id, selectedRole);
      onClose();
    } catch (error) {
      console.error('Failed to assign role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleData = roles.find(role => role.name === selectedRole);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assign Role</h2>
              <p className="text-sm text-gray-500 mt-1">
                Change role for {user.name} ({user.email})
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Role */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Current Role</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 capitalize">
              {user.role}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {roles.find(role => role.name === user.role)?.description}
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select New Role</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRole(role.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 capitalize">
                          {role.name}
                        </div>
                        {selectedRole === role.name && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {role.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value={role.name}
                      checked={selectedRole === role.name}
                      onChange={() => setSelectedRole(role.name)}
                      className="ml-4 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permission Preview */}
          {selectedRoleData && selectedRole !== user.role && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Permissions for {selectedRoleData.name} role:
              </h4>
              <div className="flex flex-wrap gap-1">
                {selectedRoleData.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                  >
                    {permission.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={!selectedRole || selectedRole === user.role || isLoading}
            >
              {isLoading ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}