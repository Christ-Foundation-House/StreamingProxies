'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  StreamingProxy, 
  ProxyFilters, 
  CreateProxyRequest, 
  UpdateProxyRequest,
  HealthCheckResult,
  SystemStats,
  AnalyticsData,
  ApiResponse,
  ProxyStatus,
  HealthStatus
} from '../types';
import { apiClient, ApiClientError, ApiErrorType } from '../api-client';

export interface UseStreamingProxiesOptions {
  filters?: ProxyFilters;
  autoFetch?: boolean;
  refetchInterval?: number;
}

export interface UseStreamingProxiesReturn {
  proxies: StreamingProxy[];
  loading: boolean;
  error: string | null;
  errorType: ApiErrorType | null;
  isEmpty: boolean;
  isInitialLoad: boolean;
  
  // Actions
  fetchProxies: (filters?: ProxyFilters) => Promise<void>;
  refresh: () => Promise<void>;
  createProxy: (data: CreateProxyRequest) => Promise<StreamingProxy>;
  updateProxy: (id: string, data: UpdateProxyRequest) => Promise<StreamingProxy>;
  deleteProxy: (id: string) => Promise<void>;
  runHealthCheck: (id: string) => Promise<HealthCheckResult>;
  runAllHealthChecks: () => Promise<HealthCheckResult[]>;
  
  // Utilities
  getProxyById: (id: string) => StreamingProxy | undefined;
  getProxiesByStatus: (status: string) => StreamingProxy[];
  getAvailableProxies: () => StreamingProxy[];
  filterProxies: (filters: ProxyFilters) => StreamingProxy[];
  
  // State management
  updateProxyInState: (proxy: StreamingProxy) => void;
  removeProxyFromState: (proxyId: string) => void;
}

export function useStreamingProxies(
  options: UseStreamingProxiesOptions = {}
): UseStreamingProxiesReturn {
  const {
    filters,
    autoFetch = true,
    refetchInterval,
  } = options;

  const [proxies, setProxies] = useState<StreamingProxy[]>([]);
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

  // Fetch proxies from API
  const fetchProxies = useCallback(async (fetchFilters?: ProxyFilters) => {
    try {
      setLoading(true);
      clearError();

      const response = await apiClient.getProxies(fetchFilters || filters);
      
      if (response.success && response.data) {
        // Transform dates from API response
        const transformedProxies = response.data.map(proxy => ({
          ...proxy,
          createdAt: new Date(proxy.createdAt),
          updatedAt: new Date(proxy.updatedAt),
          lastHealthCheck: proxy.lastHealthCheck ? new Date(proxy.lastHealthCheck) : undefined,
        }));
        
        setProxies(transformedProxies);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching proxies:', err);
      handleError(err);
      
      // In development, provide mock data as fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock proxy data as fallback');
        setProxies(getMockProxies());
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [filters, clearError, handleError]);

  // Refresh current data
  const refresh = useCallback(async () => {
    await fetchProxies();
  }, [fetchProxies]);

  // Create new proxy
  const createProxy = useCallback(async (data: CreateProxyRequest) => {
    try {
      clearError();
      
      const response = await apiClient.createProxy(data);
      
      if (response.success && response.data) {
        const newProxy = {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          lastHealthCheck: response.data.lastHealthCheck ? new Date(response.data.lastHealthCheck) : undefined,
        };
        
        // Add to state
        setProxies(prev => [newProxy, ...prev]);
        
        return newProxy;
      } else {
        throw new Error('Failed to create proxy');
      }
    } catch (err) {
      console.error('Error creating proxy:', err);
      handleError(err);
      throw err;
    }
  }, [clearError, handleError]);

  // Update proxy
  const updateProxy = useCallback(async (id: string, data: UpdateProxyRequest) => {
    try {
      clearError();
      
      const response = await apiClient.updateProxy(id, data);
      
      if (response.success && response.data) {
        const updatedProxy = {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          lastHealthCheck: response.data.lastHealthCheck ? new Date(response.data.lastHealthCheck) : undefined,
        };
        
        // Update in state
        setProxies(prev => 
          prev.map(proxy => 
            proxy.id === id ? updatedProxy : proxy
          )
        );
        
        return updatedProxy;
      } else {
        throw new Error('Failed to update proxy');
      }
    } catch (err) {
      console.error('Error updating proxy:', err);
      handleError(err);
      throw err;
    }
  }, [clearError, handleError]);

  // Delete proxy
  const deleteProxy = useCallback(async (id: string) => {
    try {
      clearError();
      
      const response = await apiClient.deleteProxy(id);
      
      if (response.success) {
        // Remove from state
        setProxies(prev => prev.filter(proxy => proxy.id !== id));
      } else {
        throw new Error('Failed to delete proxy');
      }
    } catch (err) {
      console.error('Error deleting proxy:', err);
      handleError(err);
      throw err;
    }
  }, [clearError, handleError]);

  // Run health check for specific proxy
  const runHealthCheck = useCallback(async (id: string) => {
    try {
      clearError();
      
      const response = await apiClient.runHealthCheck(id);
      
      if (response.success && response.data) {
        const healthCheck = {
          ...response.data,
          lastChecked: new Date(response.data.lastChecked),
        };
        
        // Update proxy health status in state
        setProxies(prev => 
          prev.map(proxy => 
            proxy.id === id 
              ? { 
                  ...proxy, 
                  healthStatus: healthCheck.status,
                  lastHealthCheck: healthCheck.lastChecked,
                  updatedAt: new Date()
                }
              : proxy
          )
        );
        
        return healthCheck;
      } else {
        throw new Error('Failed to run health check');
      }
    } catch (err) {
      console.error('Error running health check:', err);
      handleError(err);
      throw err;
    }
  }, [clearError, handleError]);

  // Run health checks for all proxies
  const runAllHealthChecks = useCallback(async () => {
    try {
      clearError();
      
      const response = await apiClient.runAllHealthChecks();
      
      if (response.success && response.data) {
        const healthChecks = response.data.map(check => ({
          ...check,
          lastChecked: new Date(check.lastChecked),
        }));
        
        // Update all proxy health statuses in state
        setProxies(prev => 
          prev.map(proxy => {
            const healthCheck = healthChecks.find(check => check.proxyId === proxy.id);
            return healthCheck 
              ? { 
                  ...proxy, 
                  healthStatus: healthCheck.status,
                  lastHealthCheck: healthCheck.lastChecked,
                  updatedAt: new Date()
                }
              : proxy;
          })
        );
        
        return healthChecks;
      } else {
        throw new Error('Failed to run health checks');
      }
    } catch (err) {
      console.error('Error running health checks:', err);
      handleError(err);
      throw err;
    }
  }, [clearError, handleError]);

  // Utility functions
  const getProxyById = useCallback((id: string) => {
    return proxies.find(proxy => proxy.id === id);
  }, [proxies]);

  const getProxiesByStatus = useCallback((status: string) => {
    return proxies.filter(proxy => proxy.status === status);
  }, [proxies]);

  const getAvailableProxies = useCallback(() => {
    return proxies.filter(proxy => 
      proxy.status === 'active' && 
      proxy.currentActiveStreams < proxy.maxConcurrentStreams
    );
  }, [proxies]);

  const filterProxies = useCallback((filterOptions: ProxyFilters) => {
    return proxies.filter(proxy => {
      if (filterOptions.status && proxy.status !== filterOptions.status) {
        return false;
      }
      if (filterOptions.healthStatus && proxy.healthStatus !== filterOptions.healthStatus) {
        return false;
      }
      if (filterOptions.churchBranchId && proxy.churchBranchId !== filterOptions.churchBranchId) {
        return false;
      }
      if (filterOptions.search) {
        const searchLower = filterOptions.search.toLowerCase();
        return (
          proxy.name.toLowerCase().includes(searchLower) ||
          proxy.serverLocation.toLowerCase().includes(searchLower) ||
          (proxy.description && proxy.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [proxies]);

  // State management functions
  const updateProxyInState = useCallback((proxy: StreamingProxy) => {
    setProxies(prev => 
      prev.map(p => p.id === proxy.id ? proxy : p)
    );
  }, []);

  const removeProxyFromState = useCallback((proxyId: string) => {
    setProxies(prev => prev.filter(p => p.id !== proxyId));
  }, []);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchProxies();
    }
  }, [autoFetch, fetchProxies]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(() => {
        if (!loading) {
          fetchProxies();
        }
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, loading, fetchProxies]);

  // Computed values
  const isEmpty = !loading && !error && proxies.length === 0;

  return {
    proxies,
    loading,
    error,
    errorType,
    isEmpty,
    isInitialLoad,
    
    // Actions
    fetchProxies,
    refresh,
    createProxy,
    updateProxy,
    deleteProxy,
    runHealthCheck,
    runAllHealthChecks,
    
    // Utilities
    getProxyById,
    getProxiesByStatus,
    getAvailableProxies,
    filterProxies,
    
    // State management
    updateProxyInState,
    removeProxyFromState,
  };
}

// Mock data for development fallback
function getMockProxies(): StreamingProxy[] {
  return [
    {
      id: 'proxy-1',
      name: 'US East Proxy',
      description: 'Primary proxy for US East region',
      rtmpUrl: 'rtmp://us-east.streaming-proxy.com/live',
      serverLocation: 'New York, US',
      maxConcurrentStreams: 10,
      currentActiveStreams: 3,
      status: ProxyStatus.ACTIVE,
      bandwidthLimit: 1000,
      churchBranchId: 'church-1',
      createdBy: 'admin@example.com',
      createdAt: new Date('2023-01-15T10:00:00Z'),
      updatedAt: new Date(),
      lastHealthCheck: new Date(),
      healthStatus: HealthStatus.HEALTHY,
    },
    {
      id: 'proxy-2',
      name: 'US West Proxy',
      description: 'Secondary proxy for US West region',
      rtmpUrl: 'rtmp://us-west.streaming-proxy.com/live',
      serverLocation: 'Los Angeles, US',
      maxConcurrentStreams: 8,
      currentActiveStreams: 5,
      status: ProxyStatus.ACTIVE,
      bandwidthLimit: 800,
      churchBranchId: 'church-1',
      createdBy: 'admin@example.com',
      createdAt: new Date('2023-02-01T10:00:00Z'),
      updatedAt: new Date(),
      lastHealthCheck: new Date(),
      healthStatus: HealthStatus.WARNING,
    },
    {
      id: 'proxy-3',
      name: 'EU Central Proxy',
      description: 'European proxy server',
      rtmpUrl: 'rtmp://eu-central.streaming-proxy.com/live',
      serverLocation: 'Frankfurt, Germany',
      maxConcurrentStreams: 12,
      currentActiveStreams: 0,
      status: ProxyStatus.MAINTENANCE,
      bandwidthLimit: 1200,
      churchBranchId: 'church-2',
      createdBy: 'admin@example.com',
      createdAt: new Date('2023-03-01T10:00:00Z'),
      updatedAt: new Date(),
      lastHealthCheck: new Date(),
      healthStatus: HealthStatus.ERROR,
    },
  ];
}