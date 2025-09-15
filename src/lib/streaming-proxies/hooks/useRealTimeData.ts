'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { StreamingProxy, SystemStats, HealthCheckResult } from '../types';
import { RealTimeUpdate } from '../types/realtime';
import { useRealTimeConnection, UseRealTimeConnectionOptions } from './useRealTimeConnection';
import { getMockDataProvider } from '../mock-data-provider';

export interface UseRealTimeDataOptions extends UseRealTimeConnectionOptions {
  enableProxyUpdates?: boolean;
  enableStatsUpdates?: boolean;
  enableHealthUpdates?: boolean;
  initialData?: {
    proxies?: StreamingProxy[];
    stats?: SystemStats;
    healthChecks?: HealthCheckResult[];
  };
  // Performance optimization options
  batchUpdates?: boolean;
  batchDelay?: number;
  debounceDelay?: number;
  maxBatchSize?: number;
}

export interface UseRealTimeDataReturn {
  // Data
  proxies: StreamingProxy[];
  stats: SystemStats | null;
  healthChecks: HealthCheckResult[];
  
  // Connection info
  connectionState: ReturnType<typeof useRealTimeConnection>['connectionState'];
  isConnected: boolean;
  isUsingMockData: boolean;
  isOnline: boolean;
  
  // Connection control
  connect: () => void;
  disconnect: () => void;
  retry: () => void;
  
  // Data management
  updateProxy: (proxy: StreamingProxy) => void;
  updateStats: (stats: SystemStats) => void;
  updateHealthCheck: (healthCheck: HealthCheckResult) => void;
  
  // Utility
  getConnectionInfo: ReturnType<typeof useRealTimeConnection>['getConnectionInfo'];
  lastUpdate: RealTimeUpdate | null;
  updateCount: number;
}

export function useRealTimeData(
  options: UseRealTimeDataOptions = {}
): UseRealTimeDataReturn {
  const {
    enableProxyUpdates = true,
    enableStatsUpdates = true,
    enableHealthUpdates = true,
    initialData,
    batchUpdates = true,
    batchDelay = 100, // 100ms batch delay
    debounceDelay = 50, // 50ms debounce delay
    maxBatchSize = 10,
    ...connectionOptions
  } = options;

  // State for real-time data
  const [proxies, setProxies] = useState<StreamingProxy[]>(initialData?.proxies || []);
  const [stats, setStats] = useState<SystemStats | null>(initialData?.stats || null);
  const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>(initialData?.healthChecks || []);

  // Real-time connection
  const connection = useRealTimeConnection(connectionOptions);

  // Batching and debouncing refs
  const updateBatchRef = useRef<RealTimeUpdate[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Initialize with mock data if using mock provider
  useEffect(() => {
    if (connection.isUsingMockData) {
      const mockProvider = getMockDataProvider();
      if (mockProvider) {
        // Load initial mock data
        if (enableProxyUpdates && proxies.length === 0) {
          setProxies(mockProvider.getMockProxies());
        }
        if (enableStatsUpdates && !stats) {
          setStats(mockProvider.getMockStats());
        }
      }
    }
  }, [connection.isUsingMockData, enableProxyUpdates, enableStatsUpdates, proxies.length, stats]);

  // Process a batch of updates efficiently
  const processBatchedUpdates = useCallback((updates: RealTimeUpdate[]) => {
    // Group updates by type and entity for efficient processing
    const proxyUpdates = new Map<string, RealTimeUpdate>();
    const healthUpdates = new Map<string, RealTimeUpdate>();
    let latestStatsUpdate: RealTimeUpdate | null = null;

    // Group and deduplicate updates
    updates.forEach(update => {
      switch (update.type) {
        case 'proxy_status':
        case 'stream_count':
          if (enableProxyUpdates) {
            const proxyId = update.type === 'proxy_status' ? update.data.id : update.data.proxyId;
            proxyUpdates.set(proxyId, update);
          }
          break;
        case 'health_check':
          if (enableHealthUpdates && 'proxyId' in update.data) {
            const healthData = update.data as HealthCheckResult;
            healthUpdates.set(healthData.proxyId, update);
          }
          break;
        case 'system_stats':
          if (enableStatsUpdates) {
            latestStatsUpdate = update; // Only keep the latest stats update
          }
          break;
      }
    });

    // Apply proxy updates in batch
    if (proxyUpdates.size > 0) {
      setProxies(prev => {
        const newProxies = [...prev];
        let hasChanges = false;

        proxyUpdates.forEach(update => {
          if (update.type === 'proxy_status') {
            const index = newProxies.findIndex(p => p.id === update.data.id);
            if (index !== -1) {
              newProxies[index] = update.data;
              hasChanges = true;
            } else {
              newProxies.push(update.data);
              hasChanges = true;
            }
          } else if (update.type === 'stream_count') {
            const index = newProxies.findIndex(p => p.id === update.data.proxyId);
            if (index !== -1) {
              newProxies[index] = {
                ...newProxies[index],
                currentActiveStreams: update.data.count,
                updatedAt: update.timestamp,
              };
              hasChanges = true;
            }
          }
        });

        return hasChanges ? newProxies : prev;
      });
    }

    // Apply health check updates in batch
    if (healthUpdates.size > 0) {
      setHealthChecks(prev => {
        const newHealthChecks = [...prev];
        let hasChanges = false;

        healthUpdates.forEach(update => {
          // Type guard to ensure update.data has proxyId
          if (update.type === 'health_check' && 'proxyId' in update.data) {
            const healthData = update.data as HealthCheckResult;
            const index = newHealthChecks.findIndex(h => h.proxyId === healthData.proxyId);
            if (index !== -1) {
              newHealthChecks[index] = healthData;
              hasChanges = true;
            } else {
              newHealthChecks.push(healthData);
              hasChanges = true;
            }
          }
        });

        if (hasChanges && enableProxyUpdates) {
          // Also update proxy health status
          setProxies(prevProxies => {
            const newProxies = [...prevProxies];
            let proxyChanges = false;

            healthUpdates.forEach(update => {
              // Type guard to ensure update.data has proxyId
              if (update.type === 'health_check' && 'proxyId' in update.data) {
                const healthData = update.data as HealthCheckResult;
                const index = newProxies.findIndex(p => p.id === healthData.proxyId);
                if (index !== -1) {
                  newProxies[index] = {
                    ...newProxies[index],
                    healthStatus: healthData.status,
                    lastHealthCheck: healthData.lastChecked,
                    updatedAt: update.timestamp,
                  };
                  proxyChanges = true;
                }
              }
            });

            return proxyChanges ? newProxies : prevProxies;
          });
        }

        return hasChanges ? newHealthChecks : prev;
      });
    }

    // Apply stats update
    if (latestStatsUpdate) {
      const statsUpdate = latestStatsUpdate as RealTimeUpdate;
      if (statsUpdate.type === 'system_stats') {
        setStats(statsUpdate.data);
      }
    }
  }, [enableProxyUpdates, enableStatsUpdates, enableHealthUpdates]);

  // Flush batched updates
  const flushBatch = useCallback(() => {
    if (updateBatchRef.current.length > 0) {
      processBatchedUpdates(updateBatchRef.current);
      updateBatchRef.current = [];
    }
    
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
  }, [processBatchedUpdates]);

  // Handle real-time updates with batching and debouncing
  const handleRealTimeUpdate = useCallback((update: RealTimeUpdate) => {
    const now = Date.now();
    
    if (!batchUpdates) {
      // Process immediately if batching is disabled
      processBatchedUpdates([update]);
      return;
    }

    // Add to batch
    updateBatchRef.current.push(update);

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce high-frequency updates
    if (now - lastUpdateTimeRef.current < debounceDelay) {
      debounceTimeoutRef.current = setTimeout(() => {
        flushBatch();
        lastUpdateTimeRef.current = Date.now();
      }, debounceDelay);
      return;
    }

    // Flush immediately if batch is full
    if (updateBatchRef.current.length >= maxBatchSize) {
      flushBatch();
      lastUpdateTimeRef.current = now;
      return;
    }

    // Set batch timeout if not already set
    if (!batchTimeoutRef.current) {
      batchTimeoutRef.current = setTimeout(() => {
        flushBatch();
        lastUpdateTimeRef.current = Date.now();
      }, batchDelay);
    }

    lastUpdateTimeRef.current = now;
  }, [batchUpdates, debounceDelay, maxBatchSize, batchDelay, flushBatch, processBatchedUpdates]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = connection.onUpdate(handleRealTimeUpdate);
    
    return () => {
      unsubscribe();
      
      // Cleanup timeouts and flush any pending updates
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
        batchTimeoutRef.current = null;
      }
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      
      // Flush any remaining updates
      if (updateBatchRef.current.length > 0) {
        processBatchedUpdates(updateBatchRef.current);
        updateBatchRef.current = [];
      }
    };
  }, [connection.onUpdate, handleRealTimeUpdate, processBatchedUpdates]);

  // Manual update methods
  const updateProxy = useCallback((proxy: StreamingProxy) => {
    setProxies(prev => {
      const index = prev.findIndex(p => p.id === proxy.id);
      if (index !== -1) {
        const newProxies = [...prev];
        newProxies[index] = proxy;
        return newProxies;
      } else {
        return [...prev, proxy];
      }
    });
  }, []);

  const updateStats = useCallback((newStats: SystemStats) => {
    setStats(newStats);
  }, []);

  const updateHealthCheck = useCallback((healthCheck: HealthCheckResult) => {
    setHealthChecks(prev => {
      const index = prev.findIndex(h => h.proxyId === healthCheck.proxyId);
      if (index !== -1) {
        const newHealthChecks = [...prev];
        newHealthChecks[index] = healthCheck;
        return newHealthChecks;
      } else {
        return [...prev, healthCheck];
      }
    });

    // Also update the proxy's health status
    setProxies(prev => {
      const index = prev.findIndex(p => p.id === healthCheck.proxyId);
      if (index !== -1) {
        const newProxies = [...prev];
        newProxies[index] = {
          ...newProxies[index],
          healthStatus: healthCheck.status,
          lastHealthCheck: healthCheck.lastChecked,
          updatedAt: new Date(),
        };
        return newProxies;
      }
      return prev;
    });
  }, []);

  return {
    // Data
    proxies,
    stats,
    healthChecks,
    
    // Connection info
    connectionState: connection.connectionState,
    isConnected: connection.isConnected,
    isUsingMockData: connection.isUsingMockData,
    isOnline: connection.isOnline,
    
    // Connection control
    connect: connection.connect,
    disconnect: connection.disconnect,
    retry: connection.retry,
    
    // Data management
    updateProxy,
    updateStats,
    updateHealthCheck,
    
    // Utility
    getConnectionInfo: connection.getConnectionInfo,
    lastUpdate: connection.lastUpdate,
    updateCount: connection.updateCount,
  };
}