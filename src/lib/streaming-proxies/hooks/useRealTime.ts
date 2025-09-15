'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  type StreamingProxy,
  type SystemStats,
  type UseRealTimeReturn,
  type HealthCheckResult,
} from '../types';
import type { RealTimeUpdate } from '../types/realtime';
import { WEBSOCKET_EVENTS, SYSTEM_CONFIG } from '../utils/constants';

// Type guard to check if an object is a valid WebSocket message
type WebSocketMessage = {
  type: string;
  data: unknown;
};

const isWebSocketMessage = (data: unknown): data is WebSocketMessage => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'data' in data
  );
};

export function useRealTime(): UseRealTimeReturn {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealTimeUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;

      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    cleanup();

    try {
      // In a real app, this would connect to your WebSocket server
      const wsUrl = process.env.NODE_ENV === 'development'
        ? 'ws://localhost:3001/ws'
        : 'wss://your-domain.com/ws';

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          if (!isWebSocketMessage(data)) {
            throw new Error('Invalid message format');
          }

          // Create a properly typed update based on the message type
          const timestamp = new Date();

          switch (data.type) {
            case 'stream_count': {
              const { proxyId, count } = data.data as { proxyId: unknown; count: unknown };
              setLastUpdate({
                type: 'stream_count',
                data: {
                  proxyId: String(proxyId || ''),
                  count: Number(count || 0)
                },
                timestamp
              });
              break;
            }

            case 'system_stats':
              setLastUpdate({
                type: 'system_stats',
                data: data.data as SystemStats,
                timestamp
              });
              break;

            case 'health_check': {
              const healthData = data.data as Omit<HealthCheckResult, 'lastChecked'> & { lastChecked: string };
              setLastUpdate({
                type: 'health_check',
                data: {
                  ...healthData,
                  lastChecked: new Date(healthData.lastChecked)
                },
                timestamp
              });
              break;
            }

            case 'proxy_status':
            default:
              setLastUpdate({
                type: 'proxy_status',
                data: data.data as StreamingProxy,
                timestamp
              });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(`Failed to parse WebSocket message: ${errorMessage}`);
          console.error('WebSocket message error:', err);
        }
      };

      const handleOpen = () => {
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected');
      };

      const handleError = (event: Event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
      };

      const handleClose = () => {
        setConnected(false);
        wsRef.current = null;

        // Auto-reconnect with exponential backoff
        if (reconnectAttemptsRef.current < SYSTEM_CONFIG.MAX_WEBSOCKET_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            SYSTEM_CONFIG.WEBSOCKET_RECONNECT_INTERVAL_MS * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        const errorMessage = 'WebSocket error: ' + (error instanceof Error ? error.message : 'Unknown error');
        console.error(errorMessage, error);
        setError(errorMessage);
        setConnected(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }
    wsRef.current.send(JSON.stringify(message));
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    lastUpdate,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}

// Type definitions for real-time updates

// Specialized hooks for different types of real-time updates
export function useRealTimeProxyUpdates(
  onProxyUpdate: (proxy: StreamingProxy) => void
) {
  const { lastUpdate } = useRealTime();

  useEffect(() => {
    if (lastUpdate && lastUpdate.type === 'proxy_status') {
      onProxyUpdate(lastUpdate.data);
    }
  }, [lastUpdate, onProxyUpdate]);

  return null;
}

export function useRealTimeStatsUpdates(
  onStatsUpdate: (stats: SystemStats) => void
) {
  const { lastUpdate } = useRealTime();

  useEffect(() => {
    if (lastUpdate && lastUpdate.type === 'system_stats') {
      onStatsUpdate(lastUpdate.data);
    }
  }, [lastUpdate, onStatsUpdate]);

  return null;
}

export function useRealTimeStreamUpdates(
  onStreamCountUpdate: (proxyId: string, count: number) => void
) {
  const { lastUpdate } = useRealTime();

  useEffect(() => {
    if (lastUpdate && lastUpdate.type === 'stream_count') {
      onStreamCountUpdate(lastUpdate.data.proxyId, lastUpdate.data.count);
    }
  }, [lastUpdate, onStreamCountUpdate]);

  return null;
}

// Mock WebSocket server simulation for development
export function simulateRealTimeUpdates() {
  if (typeof window === 'undefined') return;

  const mockUpdates = [
    {
      type: 'system_stats',
      data: {
        totalProxies: 5,
        activeProxies: 4,
        totalActiveStreams: 3,
        totalBandwidthUsage: 150,
        healthyProxies: 3,
        warningProxies: 1,
        errorProxies: 1,
      } as SystemStats,
      timestamp: new Date(),
    },
    {
      type: 'stream_count',
      data: { proxyId: 'proxy-1', count: 2 },
      timestamp: new Date(),
    },
  ] as unknown as RealTimeUpdate[];

  let index = 0;
  setInterval(() => {
    const update = mockUpdates[index % mockUpdates.length];
    window.dispatchEvent(new CustomEvent('mock-websocket-message', {
      detail: update
    }));
    index++;
  }, 5000);
}