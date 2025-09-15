'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiClientError, ApiErrorType } from '../api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  createdAt: Date;
}

export interface UseUsersOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
}

export interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  errorType: ApiErrorType | null;
  isInitialLoad: boolean;
  
  // Actions
  fetchUsers: () => Promise<void>;
  updateUserPermissions: (userId: string, permissions: string[]) => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<void>;
  refresh: () => Promise<void>;
  
  // State management
  updateUser: (updatedUser: User) => void;
}

export function useUsers(
  options: UseUsersOptions = {}
): UseUsersReturn {
  const {
    autoFetch = true,
    refetchInterval,
  } = options;

  const [users, setUsers] = useState<User[]>([]);
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

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Transform date strings to Date objects
        const transformedUsers = result.data.map((user: any) => ({
          ...user,
          lastLogin: new Date(user.lastLogin),
          createdAt: new Date(user.createdAt),
        }));
        
        setUsers(transformedUsers);
      } else {
        throw new Error(result.error || 'Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      handleError(err);
    } finally {
      setLoading(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [clearError, handleError, isInitialLoad]);

  // Update user permissions
  const updateUserPermissions = useCallback(async (userId: string, permissions: string[]) => {
    try {
      setLoading(true);
      clearError();

      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Transform date strings to Date objects
        const updatedUser = {
          ...result.data,
          lastLogin: new Date(result.data.lastLogin),
          createdAt: new Date(result.data.createdAt),
        };
        
        // Update the user in the local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? updatedUser : user
        ));
      } else {
        throw new Error(result.error || 'Failed to update user permissions');
      }
    } catch (err) {
      console.error('Error updating user permissions:', err);
      handleError(err);
      throw err; // Re-throw to allow UI to handle the error
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  // Update user status
  const updateUserStatus = useCallback(async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      setLoading(true);
      clearError();

      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Transform date strings to Date objects
        const updatedUser = {
          ...result.data,
          lastLogin: new Date(result.data.lastLogin),
          createdAt: new Date(result.data.createdAt),
        };
        
        // Update the user in the local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? updatedUser : user
        ));
      } else {
        throw new Error(result.error || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      handleError(err);
      throw err; // Re-throw to allow UI to handle the error
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  // Refresh users data
  const refresh = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Update user in state (for real-time updates)
  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [autoFetch, fetchUsers]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(() => {
        if (!loading) {
          fetchUsers();
        }
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, loading, fetchUsers]);

  return {
    users,
    loading,
    error,
    errorType,
    isInitialLoad,
    
    // Actions
    fetchUsers,
    updateUserPermissions,
    updateUserStatus,
    refresh,
    
    // State management
    updateUser,
  };
}