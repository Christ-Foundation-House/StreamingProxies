'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RealTimeUpdate } from '../types/realtime';
import { 
  WebSocketManager, 
  ConnectionState, 
  getWebSocketManager, 
  WebSocketManagerConfig 
} from '../websocket-manager';
import { 
  MockDataProvider, 
  getMockDataProvider, 
  MockDataProviderConfig 
} from '../mock-data-provider';

export interface UseRealTimeConnectionOptions {
  wsConfig?: Partial<WebSocketManagerConfig>;
  mockConfig?: Partial<MockDataProviderConfig>;
  autoConnect?: boolean;
  fallbackToMock?: boolean;
  reconnectOnMount?: boolean;
}

export interface UseRealTimeConnectionReturn {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  isUsingMockData: boolean;
  isOnline: boolean;
  
  // Connection control
  connect: () => void;
  disconnect: () => void;
  retry: () => void;
  
  // Data handling
  lastUpdate: RealTimeUpdate | null;
  updateCount: number;
  
  // Event subscription
  onUpdate: (handler: (update: RealTimeUpdate) => void) => () => void;
  
  // Utility methods
  send: (message: any) => boolean;
  getConnectionInfo: () => {
    type: 'websocket' | 'mock' | 'offline';
    status: string;
    lastConnected?: Date;
    reconnectAttempts: number;
  };
}

export function useRealTimeConnection(
  options: UseRealTimeConnectionOptions = {}
): UseRealTimeConnectionReturn {
  const {
    wsConfig,
    mockConfig,
    autoConnect = true,
    fallbackToMock = true,
    reconnectOnMount = true,
  } = options;

  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    reconnectAttempts: 0,
  });
  const [lastUpdate, setLastUpdate] = useState<RealTimeUpdate | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Refs
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const mockProviderRef = useRef<MockDataProvider | null>(null);
  const updateHandlersRef = useRef<Set<(update: RealTimeUpdate) => void>>(new Set());
  const connectionStateUnsubscribeRef = useRef<(() => void) | null>(null);
  const wsUpdateUnsubscribeRef = useRef<(() => void) | null>(null);
  const mockUpdateUnsubscribeRef = useRef<(() => void) | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize managers
  useEffect(() => {
    wsManagerRef.current = getWebSocketManager(wsConfig);
    
    if (fallbackToMock) {
      mockProviderRef.current = getMockDataProvider(mockConfig);
    }

    return () => {
      // Cleanup on unmount
      disconnect();
    };
  }, [wsConfig, mockConfig, fallbackToMock]);

  // Handle connection state changes
  const handleConnectionStateChange = useCallback((newState: ConnectionState) => {
    setConnectionState(newState);

    // Handle disabled WebSocket
    if (newState.status === 'disabled') {
      console.log('WebSocket is disabled, real-time updates unavailable');
      return;
    }

    // Switch to mock data if WebSocket fails and fallback is enabled
    if (fallbackToMock && (newState.status === 'error' || newState.status === 'disconnected') && mockProviderRef.current) {
      if (!isUsingMockData && newState.reconnectAttempts > 2) {
        console.log('WebSocket connection failed multiple times, switching to mock data provider');
        setIsUsingMockData(true);
        
        // Stop WebSocket updates and start mock updates
        if (wsUpdateUnsubscribeRef.current) {
          wsUpdateUnsubscribeRef.current();
          wsUpdateUnsubscribeRef.current = null;
        }
        
        mockUpdateUnsubscribeRef.current = mockProviderRef.current.subscribe(handleUpdate);
        mockProviderRef.current.start();
      }
    }

    // Switch back to WebSocket if it reconnects
    if (newState.status === 'connected' && isUsingMockData) {
      console.log('WebSocket reconnected, switching from mock data');
      setIsUsingMockData(false);
      
      // Stop mock updates and start WebSocket updates
      if (mockUpdateUnsubscribeRef.current) {
        mockUpdateUnsubscribeRef.current();
        mockUpdateUnsubscribeRef.current = null;
      }
      
      if (mockProviderRef.current) {
        mockProviderRef.current.stop();
      }
      
      if (wsManagerRef.current) {
        wsUpdateUnsubscribeRef.current = wsManagerRef.current.onUpdate(handleUpdate);
      }
    }
  }, [fallbackToMock, isUsingMockData]);

  // Handle real-time updates
  const handleUpdate = useCallback((update: RealTimeUpdate) => {
    setLastUpdate(update);
    setUpdateCount(prev => prev + 1);
    
    // Broadcast to all registered handlers
    updateHandlersRef.current.forEach(handler => {
      try {
        handler(update);
      } catch (error) {
        console.error('Error in update handler:', error);
      }
    });
  }, []);

  // Connection methods
  const connect = useCallback(() => {
    if (!isOnline) {
      console.warn('Cannot connect while offline');
      return;
    }

    if (wsManagerRef.current) {
      // Subscribe to connection state changes
      if (connectionStateUnsubscribeRef.current) {
        connectionStateUnsubscribeRef.current();
      }
      connectionStateUnsubscribeRef.current = wsManagerRef.current.onConnectionStateChange(handleConnectionStateChange);
      
      // Try to connect via WebSocket
      wsManagerRef.current.connect();
      
      // Subscribe to WebSocket updates
      if (wsUpdateUnsubscribeRef.current) {
        wsUpdateUnsubscribeRef.current();
      }
      wsUpdateUnsubscribeRef.current = wsManagerRef.current.onUpdate(handleUpdate);
    } else if (fallbackToMock && mockProviderRef.current) {
      // Fallback to mock data immediately if no WebSocket manager
      console.log('No WebSocket manager available, using mock data');
      setIsUsingMockData(true);
      mockUpdateUnsubscribeRef.current = mockProviderRef.current.subscribe(handleUpdate);
      mockProviderRef.current.start();
      
      setConnectionState({
        status: 'connected',
        lastConnected: new Date(),
        reconnectAttempts: 0,
      });
    }
  }, [isOnline, handleConnectionStateChange, handleUpdate, fallbackToMock]);

  const disconnect = useCallback(() => {
    // Unsubscribe from all updates
    if (connectionStateUnsubscribeRef.current) {
      connectionStateUnsubscribeRef.current();
      connectionStateUnsubscribeRef.current = null;
    }
    
    if (wsUpdateUnsubscribeRef.current) {
      wsUpdateUnsubscribeRef.current();
      wsUpdateUnsubscribeRef.current = null;
    }
    
    if (mockUpdateUnsubscribeRef.current) {
      mockUpdateUnsubscribeRef.current();
      mockUpdateUnsubscribeRef.current = null;
    }

    // Disconnect WebSocket
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
    }

    // Stop mock provider
    if (mockProviderRef.current) {
      mockProviderRef.current.stop();
    }

    setIsUsingMockData(false);
    setConnectionState({
      status: 'disconnected',
      reconnectAttempts: 0,
    });
  }, []);

  const retry = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 1000);
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Reconnect when coming back online
  useEffect(() => {
    if (isOnline && reconnectOnMount && connectionState.status === 'disconnected') {
      connect();
    }
  }, [isOnline, reconnectOnMount, connectionState.status, connect]);

  // Event subscription method
  const onUpdate = useCallback((handler: (update: RealTimeUpdate) => void) => {
    updateHandlersRef.current.add(handler);
    return () => updateHandlersRef.current.delete(handler);
  }, []);

  // Send message (only works with WebSocket)
  const send = useCallback((message: any): boolean => {
    if (isUsingMockData || !wsManagerRef.current) {
      console.warn('Cannot send message: using mock data or no WebSocket connection');
      return false;
    }
    return wsManagerRef.current.send(message);
  }, [isUsingMockData]);

  // Get connection info
  const getConnectionInfo = useCallback(() => {
    if (!isOnline) {
      return {
        type: 'offline' as const,
        status: 'offline',
        reconnectAttempts: 0,
      };
    }

    if (isUsingMockData) {
      return {
        type: 'mock' as const,
        status: 'mock_data',
        lastConnected: connectionState.lastConnected,
        reconnectAttempts: connectionState.reconnectAttempts,
      };
    }

    return {
      type: 'websocket' as const,
      status: connectionState.status,
      lastConnected: connectionState.lastConnected,
      reconnectAttempts: connectionState.reconnectAttempts,
    };
  }, [isOnline, isUsingMockData, connectionState]);

  return {
    connectionState,
    isConnected: connectionState.status === 'connected',
    isUsingMockData,
    isOnline,
    connect,
    disconnect,
    retry,
    lastUpdate,
    updateCount,
    onUpdate,
    send,
    getConnectionInfo,
  };
}