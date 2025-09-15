import { RealTimeUpdate } from './types/realtime';
import { config } from './config/production';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'disabled';

export interface ConnectionState {
  status: ConnectionStatus;
  error?: string;
  lastConnected?: Date;
  reconnectAttempts: number;
}

export interface WebSocketManagerConfig {
  url: string;
  enabled: boolean;
  reconnectAttempts: number;
  reconnectInterval: number;
  enableFallback: boolean;
  maxReconnectInterval: number;
  heartbeatInterval: number;
  // Batching configuration
  enableBatching: boolean;
  batchDelay: number;
  maxBatchSize: number;
  highFrequencyTypes: string[];
}

export type WebSocketEventHandler = (update: RealTimeUpdate) => void;
export type ConnectionStateHandler = (state: ConnectionState) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketManagerConfig;
  private connectionState: ConnectionState;
  private eventHandlers: Set<WebSocketEventHandler> = new Set();
  private stateHandlers: Set<ConnectionStateHandler> = new Set();
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private heartbeatIntervalId: NodeJS.Timeout | null = null;
  private isManuallyDisconnected = false;
  
  // Batching properties
  private messageBatch: RealTimeUpdate[] = [];
  private batchTimeoutId: NodeJS.Timeout | null = null;
  private lastMessageTime = 0;

  constructor(customConfig: Partial<WebSocketManagerConfig> = {}) {
    this.config = {
      url: customConfig.url || config.websocket.url,
      enabled: customConfig.enabled ?? config.websocket.enabled,
      reconnectAttempts: customConfig.reconnectAttempts || config.websocket.reconnectAttempts,
      reconnectInterval: customConfig.reconnectInterval || config.websocket.reconnectInterval,
      maxReconnectInterval: customConfig.maxReconnectInterval || config.websocket.maxReconnectInterval,
      enableFallback: customConfig.enableFallback ?? config.features.mockDataFallback,
      heartbeatInterval: customConfig.heartbeatInterval || config.websocket.heartbeatInterval,
      // Batching defaults
      enableBatching: customConfig.enableBatching ?? true,
      batchDelay: customConfig.batchDelay ?? 50,
      maxBatchSize: customConfig.maxBatchSize ?? 10,
      highFrequencyTypes: customConfig.highFrequencyTypes ?? ['stream_count', 'bandwidth_update', 'viewer_count'],
      ...customConfig,
    };

    this.connectionState = {
      status: this.config.enabled ? 'disconnected' : 'disabled',
      reconnectAttempts: 0,
    };
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (!this.config.enabled) {
      console.log('WebSocket is disabled in configuration');
      this.updateConnectionState({ status: 'disabled' });
      return;
    }

    if (this.ws?.readyState === WebSocket.CONNECTING || 
        this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isManuallyDisconnected = false;
    this.updateConnectionState({ status: 'connecting' });

    try {
      console.log(`Attempting to connect to WebSocket: ${this.config.url}`);
      this.ws = new WebSocket(this.config.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleConnectionError(error as Error);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.isManuallyDisconnected = true;
    this.clearReconnectTimeout();
    this.clearHeartbeat();
    this.clearBatchTimeout();

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.updateConnectionState({ 
      status: 'disconnected',
      reconnectAttempts: 0 
    });
  }

  /**
   * Send a message to the WebSocket server
   */
  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Add event handler for real-time updates
   */
  onUpdate(handler: WebSocketEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  /**
   * Add connection state handler
   */
  onConnectionStateChange(handler: ConnectionStateHandler): () => void {
    this.stateHandlers.add(handler);
    // Immediately call with current state
    handler(this.connectionState);
    return () => this.stateHandlers.delete(handler);
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionState.status === 'connected';
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.updateConnectionState({
        status: 'connected',
        lastConnected: new Date(),
        reconnectAttempts: 0,
        error: undefined,
      });
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle heartbeat/ping messages
        if (data.type === 'ping') {
          this.send({ type: 'pong' });
          return;
        }

        // Process real-time updates
        if (this.isValidRealTimeUpdate(data)) {
          this.handleRealTimeUpdate(data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      this.clearHeartbeat();
      
      if (this.isManuallyDisconnected) {
        this.updateConnectionState({ status: 'disconnected' });
        return;
      }

      // Handle unexpected disconnection
      if (event.code !== 1000) {
        this.handleConnectionError(new Error(`WebSocket closed with code ${event.code}: ${event.reason}`));
      } else {
        this.updateConnectionState({ status: 'disconnected' });
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleConnectionError(new Error('WebSocket connection error'));
    };
  }

  private handleConnectionError(error: Error): void {
    this.updateConnectionState({
      status: 'error',
      error: error.message,
    });

    if (!this.isManuallyDisconnected && 
        this.connectionState.reconnectAttempts < this.config.reconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimeout();
    
    const attempts = this.connectionState.reconnectAttempts;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, attempts),
      this.config.maxReconnectInterval
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.updateConnectionState({
        reconnectAttempts: attempts + 1,
      });
      this.connect();
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();
    
    this.heartbeatIntervalId = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    this.stateHandlers.forEach(handler => {
      try {
        handler(this.connectionState);
      } catch (error) {
        console.error('Error in connection state handler:', error);
      }
    });
  }

  private isValidRealTimeUpdate(data: any): data is RealTimeUpdate {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.type === 'string' &&
      data.data &&
      data.timestamp
    );
  }

  private handleRealTimeUpdate(update: RealTimeUpdate): void {
    if (!this.config.enableBatching || !this.isHighFrequencyUpdate(update)) {
      // Process immediately for non-high-frequency updates
      this.processUpdate(update);
      return;
    }

    // Add to batch for high-frequency updates
    this.messageBatch.push(update);
    const now = Date.now();

    // Flush immediately if batch is full
    if (this.messageBatch.length >= this.config.maxBatchSize) {
      this.flushBatch();
      return;
    }

    // Set timeout if not already set
    if (!this.batchTimeoutId) {
      this.batchTimeoutId = setTimeout(() => {
        this.flushBatch();
      }, this.config.batchDelay);
    }

    this.lastMessageTime = now;
  }

  private isHighFrequencyUpdate(update: RealTimeUpdate): boolean {
    return this.config.highFrequencyTypes.includes(update.type);
  }

  private flushBatch(): void {
    if (this.messageBatch.length === 0) return;

    // Group updates by type and entity to deduplicate
    const updateMap = new Map<string, RealTimeUpdate>();
    
    this.messageBatch.forEach(update => {
      const key = this.getUpdateKey(update);
      // Keep the latest update for each key
      updateMap.set(key, update);
    });

    // Process deduplicated updates
    updateMap.forEach(update => {
      this.processUpdate(update);
    });

    // Clear batch
    this.messageBatch = [];
    this.clearBatchTimeout();
  }

  private getUpdateKey(update: RealTimeUpdate): string {
    switch (update.type) {
      case 'stream_count':
        return `${update.type}:${update.data.proxyId}`;
      case 'proxy_status':
        return `${update.type}:${update.data.id}`;
      case 'health_check':
        return `${update.type}:${update.data.proxyId}`;
      case 'system_stats':
        return update.type; // Only one system stats update needed
    }
  }

  private processUpdate(update: RealTimeUpdate): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(update);
      } catch (error) {
        console.error('Error in WebSocket event handler:', error);
      }
    });
  }

  private clearBatchTimeout(): void {
    if (this.batchTimeoutId) {
      clearTimeout(this.batchTimeoutId);
      this.batchTimeoutId = null;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.disconnect();
    this.clearBatchTimeout();
    this.eventHandlers.clear();
    this.stateHandlers.clear();
  }
}

// Singleton instance for global use
let globalWebSocketManager: WebSocketManager | null = null;

export function getWebSocketManager(config?: Partial<WebSocketManagerConfig>): WebSocketManager {
  if (!globalWebSocketManager) {
    globalWebSocketManager = new WebSocketManager(config);
  }
  return globalWebSocketManager;
}

export function resetWebSocketManager(): void {
  if (globalWebSocketManager) {
    globalWebSocketManager.destroy();
    globalWebSocketManager = null;
  }
}