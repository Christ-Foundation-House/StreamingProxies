'use client';

import { useState, useEffect, useCallback } from 'react';
import { SystemStats, AnalyticsData } from '../types';
import { apiClient, ApiClientError, ApiErrorType } from '../api-client';

export interface UseSystemStatsOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
}

export interface UseSystemStatsReturn {
  stats: SystemStats | null;
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  errorType: ApiErrorType | null;
  isInitialLoad: boolean;
  
  // Actions
  fetchStats: () => Promise<void>;
  fetchAnalytics: (timeRange?: '7d' | '30d' | '90d') => Promise<void>;
  refresh: () => Promise<void>;
  
  // State management
  updateStats: (newStats: SystemStats) => void;
}

export function useSystemStats(
  options: UseSystemStatsOptions = {}
): UseSystemStatsReturn {
  const {
    autoFetch = true,
    refetchInterval,
  } = options;

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
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

  // Fetch system stats from API
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const response = await apiClient.getSystemStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching system stats:', err);
      handleError(err);
      
      // In development, provide mock data as fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock system stats as fallback');
        setStats(getMockSystemStats());
      }
    } finally {
      setLoading(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [clearError, handleError, isInitialLoad]);

  // Fetch analytics data from API
  const fetchAnalytics = useCallback(async (timeRange: '7d' | '30d' | '90d' = '7d') => {
    try {
      setLoading(true);
      clearError();

      const response = await apiClient.getAnalytics(timeRange);
      
      if (response.success && response.data) {
        // Transform date strings to Date objects if needed
        const transformedAnalytics = {
          ...response.data,
          usageByDay: response.data.usageByDay.map(day => ({
            ...day,
            date: typeof day.date === 'string' ? day.date : day.date,
          })),
        };
        
        setAnalytics(transformedAnalytics);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      handleError(err);
      
      // In development, provide mock data as fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock analytics data as fallback');
        setAnalytics(getMockAnalytics(timeRange));
      }
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  // Refresh both stats and analytics
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchAnalytics(),
    ]);
  }, [fetchStats, fetchAnalytics]);

  // Update stats in state (for real-time updates)
  const updateStats = useCallback((newStats: SystemStats) => {
    setStats(newStats);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(() => {
        if (!loading) {
          refresh();
        }
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, loading, refresh]);

  return {
    stats,
    analytics,
    loading,
    error,
    errorType,
    isInitialLoad,
    
    // Actions
    fetchStats,
    fetchAnalytics,
    refresh,
    
    // State management
    updateStats,
  };
}

// Mock data for development fallback
function getMockSystemStats(): SystemStats {
  return {
    totalProxies: 3,
    activeProxies: 2,
    totalActiveStreams: 8,
    totalBandwidthUsage: 450, // Mbps
    healthyProxies: 1,
    warningProxies: 1,
    errorProxies: 1,
  };
}

function getMockAnalytics(timeRange: '7d' | '30d' | '90d'): AnalyticsData {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const now = new Date();
  
  return {
    usageByDay: Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i - 1));
      
      return {
        date: date.toISOString().split('T')[0],
        totalStreams: Math.floor(Math.random() * 20) + 5,
        totalDataTransferred: Math.floor(Math.random() * 1000000000) + 500000000, // 500MB - 1.5GB
        peakViewers: Math.floor(Math.random() * 100) + 20,
      };
    }),
    topProxies: [
      {
        proxyId: 'proxy-1',
        proxyName: 'US East Proxy',
        totalStreams: 45,
        totalDataTransferred: 5000000000, // 5GB
      },
      {
        proxyId: 'proxy-2',
        proxyName: 'US West Proxy',
        totalStreams: 38,
        totalDataTransferred: 4200000000, // 4.2GB
      },
      {
        proxyId: 'proxy-3',
        proxyName: 'EU Central Proxy',
        totalStreams: 12,
        totalDataTransferred: 1800000000, // 1.8GB
      },
    ],
    peakHours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      averageStreams: Math.floor(Math.random() * 15) + 2,
    })),
  };
}