'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Shield, Check, AlertTriangle } from 'lucide-react';

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

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionManagementModalProps {
  user: User | null;
  permissions: Permission[];
  isOpen: boolean;
  onClose: () => void;
  onUpdatePermissions: (userId: string, permissions: string[]) => void;
}

export default function PermissionManagementModal({
  user,
  permissions,
  isOpen,
  onClose,
  onUpdatePermissions
}: PermissionManagementModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedPermissions([...user.permissions]);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleTogglePermission = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleUpdatePermissions = async () => {
    setIsLoading(true);
    try {
      await onUpdatePermissions(user.id, selectedPermissions);
      onClose();
    } catch (error) {
      console.error('Failed to update permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const hasChanges = JSON.stringify(selectedPermissions.sort()) !== JSON.stringify(user.permissions.sort());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Permissions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure permissions for {user.name} ({user.email})
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Role Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Current Role</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 capitalize">
              {user.role}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Individual permissions can override role-based permissions
            </div>
          </div>

          {/* Permission Categories */}
          <div className="space-y-6 mb-6">
            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <div key={category} className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
                <div className="space-y-3">
                  {categoryPermissions.map((permission) => {
                    const isSelected = selectedPermissions.includes(permission.name);
                    return (
                      <div
                        key={permission.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleTogglePermission(permission.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900">
                                {permission.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {permission.description}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePermission(permission.name)}
                            className="ml-4 text-blue-600 focus:ring-blue-500 rounded"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Changes Summary */}
          {hasChanges && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Permission Changes</span>
              </div>
              <div className="text-sm text-yellow-700">
                <div className="mb-2">
                  <strong>Added permissions:</strong>{' '}
                  {selectedPermissions
                    .filter(p => !user.permissions.includes(p))
                    .map(p => p.replace('_', ' '))
                    .join(', ') || 'None'}
                </div>
                <div>
                  <strong>Removed permissions:</strong>{' '}
                  {user.permissions
                    .filter(p => !selectedPermissions.includes(p))
                    .map(p => p.replace('_', ' '))
                    .join(', ') || 'None'}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Permissions'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}