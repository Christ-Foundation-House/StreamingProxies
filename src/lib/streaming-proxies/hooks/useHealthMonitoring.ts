'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StreamingProxy, HealthCheckResult, UseHealthMonitoringReturn, HealthStatus } from '../types';
import { apiClient } from '../api';

export function useHealthMonitoring(proxies: StreamingProxy[] = []): UseHealthMonitoringReturn {
  const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = useCallback(async (proxyId: string): Promise<HealthCheckResult> => {
    try {
      const response = await apiClient.runHealthCheck(proxyId);
      const result = response.data;
      
      setHealthChecks(prev => {
        const filtered = prev.filter(check => check.proxyId !== proxyId);
        return [...filtered, result];
      });
      
      return result;
    } catch (err) {
      const errorResult: HealthCheckResult = {
        proxyId,
        status: HealthStatus.ERROR,
        responseTime: 0,
        lastChecked: new Date(),
        errorMessage: err instanceof Error ? err.message : 'Health check failed'
      };
      
      setHealthChecks(prev => {
        const filtered = prev.filter(check => check.proxyId !== proxyId);
        return [...filtered, errorResult];
      });
      
      throw err;
    }
  }, []);

  const runAllHealthChecks = useCallback(async (): Promise<HealthCheckResult[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.allSettled(
        proxies.map(proxy => runHealthCheck(proxy.id))
      );
      
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<HealthCheckResult> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
      
      return successfulResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run health checks';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [proxies, runHealthCheck]);

  // Auto-run health checks periodically
  useEffect(() => {
    if (proxies.length === 0) return;

    const interval = setInterval(() => {
      runAllHealthChecks().catch(err => {
        console.error('Error in scheduled health check:', err);
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [proxies, runAllHealthChecks]);

  const getHealthCheck = useCallback((proxyId: string) => {
    return healthChecks.find(check => check.proxyId === proxyId);
  }, [healthChecks]);

  const getHealthChecksByStatus = useCallback((status: HealthStatus) => {
    return healthChecks.filter(check => check.status === status);
  }, [healthChecks]);

  const getHealthSummary = useCallback(() => {
    const total = healthChecks.length;
    const healthy = healthChecks.filter(c => c.status === HealthStatus.HEALTHY).length;
    const warning = healthChecks.filter(c => c.status === HealthStatus.WARNING).length;
    const errorCount = healthChecks.filter(c => c.status === HealthStatus.ERROR).length;
    const healthyPercentage = total > 0 ? Math.round((healthy / total) * 100) : 0;
    const averageResponseTime = healthChecks.reduce((sum, check) => sum + (check.responseTime || 0), 0) / (total || 1);
    
    return {
      total,
      healthy,
      warning,
      error: errorCount,
      healthyPercentage,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100 // Round to 2 decimal places
    };
  }, [healthChecks]);

  const needsHealthCheck = useCallback((proxyId: string, maxAge = 300000) => {
    const check = getHealthCheck(proxyId);
    if (!check) return true;
    const age = Date.now() - new Date(check.lastChecked).getTime();
    return age > maxAge;
  }, [getHealthCheck]);

  const getStaleHealthChecks = useCallback((maxAge = 300000) => {
    return healthChecks.filter(check => {
      const age = Date.now() - new Date(check.lastChecked).getTime();
      return age > maxAge;
    });
  }, [healthChecks]);

  const updateHealthCheck = useCallback((result: HealthCheckResult) => {
    setHealthChecks(prev => {
      const filtered = prev.filter(check => check.proxyId !== result.proxyId);
      return [...filtered, result];
    });
  }, []);

  // Memoize the return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    healthChecks,
    loading,
    error,
    runHealthCheck,
    runAllHealthChecks,
    getHealthCheck,
    getHealthChecksByStatus,
    getHealthSummary,
    needsHealthCheck,
    getStaleHealthChecks,
    updateHealthCheck
  }), [
    healthChecks,
    loading,
    error,
    runHealthCheck,
    runAllHealthChecks,
    getHealthCheck,
    getHealthChecksByStatus,
    getHealthSummary,
    needsHealthCheck,
    getStaleHealthChecks,
    updateHealthCheck
  ]);

  return returnValue;
}