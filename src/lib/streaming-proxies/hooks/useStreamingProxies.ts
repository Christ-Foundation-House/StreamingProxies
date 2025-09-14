'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  type StreamingProxy, 
  type CreateProxyRequest, 
  type UpdateProxyRequest, 
  type HealthCheckResult,
  type UseStreamingProxiesReturn,
  type ProxyFilters,
  type ApiResponse,
  ProxyStatus
} from '../types';
import { apiClient } from '../api';
import { isApiError, getErrorMessage } from '../utils/error-handler';

export function useStreamingProxies(filters?: ProxyFilters): UseStreamingProxiesReturn {
  const [proxies, setProxies] = useState<StreamingProxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthCheckResults, setHealthCheckResults] = useState<HealthCheckResult[]>([]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProxies();
      if (response.success) {
        setProxies(response.data);
      } else {
        throw new Error('Failed to load proxies');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProxy = useCallback(async (data: CreateProxyRequest): Promise<StreamingProxy> => {
    try {
      const response = await apiClient.createProxy(data);
      if (response.success) {
        setProxies(prev => [...prev, response.data]);
        return response.data;
      }
      throw new Error('Failed to create proxy');
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateProxy = useCallback(async (id: string, data: UpdateProxyRequest): Promise<StreamingProxy> => {
    try {
      const response = await apiClient.updateProxy(id, data);
      if (response.success) {
        setProxies(prev => prev.map(proxy => 
          proxy.id === id ? response.data : proxy
        ));
        return response.data;
      }
      throw new Error('Failed to update proxy');
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const deleteProxy = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await apiClient.deleteProxy(id);
      if (response.success) {
        setProxies(prev => prev.filter(proxy => proxy.id !== id));
      } else {
        throw new Error('Failed to delete proxy');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const bulkUpdateStatus = useCallback(async (ids: string[], status: ProxyStatus): Promise<void> => {
    try {
      setLoading(true);
      // In a real app, this would be a single bulk API call
      const results = await Promise.allSettled(
        ids.map(id => updateProxy(id, { status }))
      );
      
      const failedUpdates = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
      );
      
      if (failedUpdates.length > 0) {
        const errorMessages = failedUpdates.map(({ reason }) => 
          reason instanceof Error ? reason.message : 'Unknown error'
        );
        throw new Error(`Failed to update ${failedUpdates.length} proxies: ${errorMessages.join(', ')}`);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [updateProxy]);

  const updateProxyInState = useCallback((updatedProxy: StreamingProxy) => {
    setProxies(prev => prev.map(proxy => 
      proxy.id === updatedProxy.id ? updatedProxy : proxy
    ));
  }, []);

  const runHealthCheck = useCallback(async (id: string): Promise<HealthCheckResult> => {
    try {
      const response = await apiClient.runHealthCheck(id);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to run health check');
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const filterProxies = useCallback((filters: ProxyFilters): StreamingProxy[] => {
    return proxies.filter(proxy => {
      if (filters.status && proxy.status !== filters.status) return false;
      if (filters.healthStatus && proxy.healthStatus !== filters.healthStatus) return false;
      if (filters.churchBranchId && proxy.churchBranchId !== filters.churchBranchId) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          proxy.name.toLowerCase().includes(searchLower) ||
          proxy.description?.toLowerCase().includes(searchLower) ||
          proxy.serverLocation.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [proxies]);

  const getProxyById = useCallback((id: string): StreamingProxy | undefined => {
    return proxies.find(proxy => proxy.id === id);
  }, [proxies]);

  const getProxiesByStatus = useCallback((status: ProxyStatus): StreamingProxy[] => {
    return proxies.filter(proxy => proxy.status === status);
  }, [proxies]);

  const getAvailableProxies = useCallback((): StreamingProxy[] => {
    return proxies.filter(proxy => 
      proxy.status === ProxyStatus.ACTIVE && 
      proxy.healthStatus === 'healthy' &&
      proxy.currentActiveStreams < (proxy.maxConcurrentStreams || 1)
    );
  }, [proxies]);

  const fetchProxies = useCallback(async (filters?: ProxyFilters): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProxies(filters);
      setProxies(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proxies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Memoize the return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    proxies: filters ? filterProxies(filters) : proxies,
    loading,
    error,
    refresh,
    createProxy,
    updateProxy,
    deleteProxy,
    bulkUpdateStatus,
    runHealthCheck,
    updateProxyInState,
    filterProxies,
    getProxyById,
    getProxiesByStatus,
    getAvailableProxies,
    fetchProxies
  }), [
    proxies,
    loading,
    error,
    refresh,
    createProxy,
    updateProxy,
    deleteProxy,
    bulkUpdateStatus,
    runHealthCheck,
    updateProxyInState,
    filterProxies,
    getProxyById,
    getProxiesByStatus,
    getAvailableProxies,
    filters,
    fetchProxies
  ]);

  return returnValue;
}