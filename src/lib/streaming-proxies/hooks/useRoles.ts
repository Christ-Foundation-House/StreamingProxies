'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiClientError, ApiErrorType } from '../api-client';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UseRolesOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
}

export interface UseRolesReturn {
  roles: Role[];
  loading: boolean;
  error: string | null;
  errorType: ApiErrorType | null;
  isInitialLoad: boolean;
  
  // Actions
  fetchRoles: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Utility functions
  getRoleByName: (name: string) => Role | undefined;
  getRolePermissions: (roleName: string) => string[];
}

export function useRoles(
  options: UseRolesOptions = {}
): UseRolesReturn {
  const {
    autoFetch = true,
    refetchInterval,
  } = options;

  const [roles, setRoles] = useState<Role[]>([]);
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

  // Fetch roles from API
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const response = await fetch('/api/admin/roles');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setRoles(result.data);
      } else {
        throw new Error(result.error || 'Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      handleError(err);
      
      // In development, provide mock data as fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock roles data as fallback');
        setRoles(getMockRoles());
      }
    } finally {
      setLoading(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [clearError, handleError, isInitialLoad]);

  // Refresh roles data
  const refresh = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  // Get role by name
  const getRoleByName = useCallback((name: string): Role | undefined => {
    return roles.find(role => role.name === name);
  }, [roles]);

  // Get permissions for a specific role
  const getRolePermissions = useCallback((roleName: string): string[] => {
    const role = getRoleByName(roleName);
    return role ? role.permissions : [];
  }, [getRoleByName]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchRoles();
    }
  }, [autoFetch, fetchRoles]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(() => {
        if (!loading) {
          fetchRoles();
        }
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, loading, fetchRoles]);

  return {
    roles,
    loading,
    error,
    errorType,
    isInitialLoad,
    
    // Actions
    fetchRoles,
    refresh,
    
    // Utility functions
    getRoleByName,
    getRolePermissions,
  };
}

// Mock data for development fallback
function getMockRoles(): Role[] {
  return [
    {
      id: '1',
      name: 'admin',
      description: 'Full system administrator with all permissions',
      permissions: ['manage_users', 'manage_settings', 'view_analytics', 'manage_proxies', 'create_proxies', 'delete_proxies']
    },
    {
      id: '2',
      name: 'operator',
      description: 'System operator with proxy management and analytics access',
      permissions: ['view_analytics', 'manage_proxies', 'create_proxies']
    },
    {
      id: '3',
      name: 'viewer',
      description: 'Read-only access to analytics and system information',
      permissions: ['view_analytics']
    }
  ];
}