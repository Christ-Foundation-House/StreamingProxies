'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiClientError, ApiErrorType } from '../api-client';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface UsePermissionsOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
}

export interface UsePermissionsReturn {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  errorType: ApiErrorType | null;
  isInitialLoad: boolean;
  
  // Actions
  fetchPermissions: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Utility functions
  getPermissionsByCategory: () => Record<string, Permission[]>;
  getPermissionByName: (name: string) => Permission | undefined;
  validatePermissions: (permissionNames: string[]) => { valid: string[]; invalid: string[] };
}

export function usePermissions(
  options: UsePermissionsOptions = {}
): UsePermissionsReturn {
  const {
    autoFetch = true,
    refetchInterval,
  } = options;

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ApiErrorType | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Clear error when starting new operations
  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  // Handle API errors consistently
  const handleError = useCallback((err: unknown) => {
    if (err instanceof ApiClientError) {
      setError(err.message);
      setErrorType(err.type);
    } else if (err instanceof Error) {
      setError(err.message);
      setErrorType(ApiErrorType.UNKNOWN_ERROR);
    } else {
      setError('An unknown error occurred');
      setErrorType(ApiErrorType.UNKNOWN_ERROR);
    }
  }, []);

  // Fetch permissions from API
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const response = await fetch('/api/admin/permissions');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setPermissions(result.data);
      } else {
        throw new Error(result.error || 'Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      handleError(err);
      
      // In development, provide mock data as fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock permissions data as fallback');
        setPermissions(getMockPermissions());
      }
    } finally {
      setLoading(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [clearError, handleError, isInitialLoad]);

  // Refresh permissions data
  const refresh = useCallback(async () => {
    await fetchPermissions();
  }, [fetchPermissions]);

  // Group permissions by category
  const getPermissionsByCategory = useCallback((): Record<string, Permission[]> => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  // Get permission by name
  const getPermissionByName = useCallback((name: string): Permission | undefined => {
    return permissions.find(permission => permission.name === name);
  }, [permissions]);

  // Validate permission names
  const validatePermissions = useCallback((permissionNames: string[]): { valid: string[]; invalid: string[] } => {
    const validPermissionNames = permissions.map(p => p.name);
    const valid = permissionNames.filter(name => validPermissionNames.includes(name));
    const invalid = permissionNames.filter(name => !validPermissionNames.includes(name));
    
    return { valid, invalid };
  }, [permissions]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPermissions();
    }
  }, [autoFetch, fetchPermissions]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(() => {
        if (!loading) {
          fetchPermissions();
        }
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, loading, fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    errorType,
    isInitialLoad,
    
    // Actions
    fetchPermissions,
    refresh,
    
    // Utility functions
    getPermissionsByCategory,
    getPermissionByName,
    validatePermissions,
  };
}

// Mock data for development fallback
function getMockPermissions(): Permission[] {
  return [
    {
      id: '1',
      name: 'manage_users',
      description: 'Create, update, and delete user accounts and permissions',
      category: 'User Management'
    },
    {
      id: '2',
      name: 'manage_settings',
      description: 'Modify system settings and configuration',
      category: 'System Administration'
    },
    {
      id: '3',
      name: 'view_analytics',
      description: 'View system analytics and performance metrics',
      category: 'Analytics'
    },
    {
      id: '4',
      name: 'manage_proxies',
      description: 'Manage existing streaming proxy configurations',
      category: 'Proxy Management'
    },
    {
      id: '5',
      name: 'create_proxies',
      description: 'Create new streaming proxy instances',
      category: 'Proxy Management'
    },
    {
      id: '6',
      name: 'delete_proxies',
      description: 'Delete streaming proxy instances',
      category: 'Proxy Management'
    }
  ];
}