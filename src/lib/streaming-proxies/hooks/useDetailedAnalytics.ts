'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, ApiClientError, ApiErrorType } from '../api-client';

// Import types from the API endpoints
export interface PerformanceMetrics {
  totalStreams: number;
  activeStreams: number;
  completedStreams: number;
  failedStreams: number;
  averageStreamDuration: number;
  peakConcurrentViewers: number;
  totalViewers: number;
  averageViewersPerStream: number;
  streamSuccessRate: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
}

export interface UsageMetrics {
  bandwidthUsage: {
    peak: number;
    average: number;
    total: number;
    unit: string;
  };
  storageUsage: {
    used: number;
    total: number;
    unit: string;
  };
  cpuUsage: {
    average: number;
    peak: number;
    unit: string;
  };
  memoryUsage: {
    average: number;
    peak: number;
    unit: string;
  };
  networkTraffic: {
    inbound: number;
    outbound: number;
    unit: string;
  };
}

export interface CostMetrics {
  currentMonth: number;
  lastMonth: number;
  yearToDate: number;
  costPerStream: number;
  costPerViewer: number;
  costPerGB: number;
  projectedMonthly: number;
  currency: string;
}

export interface TrendData {
  date: string;
  streams: number;
  viewers: number;
  bandwidth: number;
  cost: number;
  errorRate: number;
}

export interface AnalyticsMetrics {
  performance: PerformanceMetrics;
  usage: UsageMetrics;
  costs: CostMetrics;
  trends: TrendData[];
}

export interface UseDetailedAnalyticsOptions {
  timeRange?: string;
  autoFetch?: boolean;
  refetchInterval?: number;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

export interface UseDetailedAnalyticsReturn {
  metrics: AnalyticsMetrics | null;
  loading: boolean;
  error: string | null;
  errorType: ApiErrorType | null;
  isInitialLoad: boolean;
  lastUpdated: Date | null;
  
  // Actions
  fetchMetrics: (timeRange?: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearCache: () => void;
  
  // Computed values
  isHealthy: boolean;
  hasWarnings: boolean;
  hasCriticalIssues: boolean;
}

interface CacheEntry {
  data: AnalyticsMetrics;
  timestamp: Date;
  timeRange: string;
}

export function useDetailedAnalytics(
  options: UseDetailedAnalyticsOptions = {}
): UseDetailedAnalyticsReturn {
  const {
    timeRange = '7d',
    autoFetch = true,
    refetchInterval,
    enableCaching = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ApiErrorType | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cache for analytics data
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Check if cached data is still valid
  const getCachedData = useCallback((range: string): AnalyticsMetrics | null => {
    if (!enableCaching) return null;
    
    const cached = cacheRef.current.get(range);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp.getTime() > cacheTimeout;
    if (isExpired) {
      cacheRef.current.delete(range);
      return null;
    }
    
    return cached.data;
  }, [enableCaching, cacheTimeout]);

  // Cache analytics data
  const setCachedData = useCallback((range: string, data: AnalyticsMetrics) => {
    if (!enableCaching) return;
    
    cacheRef.current.set(range, {
      data,
      timestamp: new Date(),
      timeRange: range
    });
  }, [enableCaching]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Fetch detailed analytics from API
  const fetchMetrics = useCallback(async (range: string = timeRange) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    const cachedData = getCachedData(range);
    if (cachedData) {
      setMetrics(cachedData);
      setLastUpdated(new Date());
      return;
    }

    try {
      setLoading(true);
      clearError();

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(`/api/admin/analytics/detailed?timeRange=${range}`, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const analyticsData = result.data as AnalyticsMetrics;
        setMetrics(analyticsData);
        setCachedData(range, analyticsData);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Invalid response format from API');
      }
    } catch (err) {
      // Don't handle aborted requests as errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('Error fetching detailed analytics:', err);
      handleError(err);
      
      // In development, provide mock data as fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock analytics data as fallback');
        const mockData = getMockAnalyticsMetrics(range);
        setMetrics(mockData);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
      abortControllerRef.current = null;
    }
  }, [timeRange, getCachedData, setCachedData, clearError, handleError, isInitialLoad]);

  // Refresh current metrics
  const refresh = useCallback(async () => {
    await fetchMetrics(timeRange);
  }, [fetchMetrics, timeRange]);

  // Computed values for health status
  const isHealthy = metrics ? 
    metrics.performance.uptime > 99.5 && 
    metrics.performance.errorRate < 0.05 &&
    metrics.performance.streamSuccessRate > 95 : false;

  const hasWarnings = metrics ?
    metrics.performance.uptime < 99.9 ||
    metrics.performance.errorRate > 0.01 ||
    metrics.performance.averageResponseTime > 100 : false;

  const hasCriticalIssues = metrics ?
    metrics.performance.uptime < 99 ||
    metrics.performance.errorRate > 0.1 ||
    metrics.performance.streamSuccessRate < 90 : false;

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchMetrics(timeRange);
    }
  }, [autoFetch, timeRange, fetchMetrics]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    metrics,
    loading,
    error,
    errorType,
    isInitialLoad,
    lastUpdated,
    
    // Actions
    fetchMetrics,
    refresh,
    clearCache,
    
    // Computed values
    isHealthy,
    hasWarnings,
    hasCriticalIssues,
  };
}

// Mock data for development fallback
function getMockAnalyticsMetrics(timeRange: string): AnalyticsMetrics {
  const getDaysFromTimeRange = (range: string): number => {
    switch (range) {
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  const days = getDaysFromTimeRange(timeRange);
  const trends: TrendData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      streams: Math.floor(Math.random() * 50) + 20,
      viewers: Math.floor(Math.random() * 1000) + 500,
      bandwidth: Math.floor(Math.random() * 500) + 200,
      cost: Math.floor(Math.random() * 100) + 50,
      errorRate: Math.random() * 0.05
    });
  }

  return {
    performance: {
      totalStreams: 1234,
      activeStreams: 45,
      completedStreams: 1189,
      failedStreams: 12,
      averageStreamDuration: 154,
      peakConcurrentViewers: 892,
      totalViewers: 45678,
      averageViewersPerStream: 37,
      streamSuccessRate: 99.03,
      averageResponseTime: 45,
      errorRate: 0.02,
      uptime: 99.9
    },
    usage: {
      bandwidthUsage: {
        peak: 2.4,
        average: 1.2,
        total: 45.6,
        unit: 'Gbps'
      },
      storageUsage: {
        used: 2.3,
        total: 10.0,
        unit: 'TB'
      },
      cpuUsage: {
        average: 65.5,
        peak: 89.2,
        unit: '%'
      },
      memoryUsage: {
        average: 72.1,
        peak: 94.8,
        unit: '%'
      },
      networkTraffic: {
        inbound: 123.4,
        outbound: 567.8,
        unit: 'GB'
      }
    },
    costs: {
      currentMonth: 1234.56,
      lastMonth: 1156.78,
      yearToDate: 13456.78,
      costPerStream: 0.89,
      costPerViewer: 0.027,
      costPerGB: 0.12,
      projectedMonthly: 1345.67,
      currency: 'USD'
    },
    trends
  };
}