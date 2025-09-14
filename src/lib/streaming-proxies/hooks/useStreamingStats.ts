'use client';

import { useState, useEffect, useCallback } from 'react';
import { SystemStats, AnalyticsData, UseStreamingStatsReturn } from '../types';
import { apiClient } from '../api';

export function useStreamingStats(timeRange: string = '30d'): UseStreamingStatsReturn {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, analyticsResponse] = await Promise.all([
        apiClient.getSystemStats(),
        apiClient.getAnalytics(timeRange)
      ]);
      
      setStats(statsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const updateStats = useCallback((newStats: SystemStats) => {
    setStats(newStats);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    analytics,
    loading,
    error,
    refresh,
    updateStats,
  };
}