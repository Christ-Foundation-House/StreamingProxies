import { RealTimeUpdate } from './types/realtime';
import { StreamingProxy, SystemStats, HealthCheckResult, ProxyStatus, HealthStatus } from './types';

export interface MockDataProviderConfig {
  updateInterval: number;
  enableRandomUpdates: boolean;
  simulateNetworkDelay: boolean;
  networkDelayRange: [number, number];
}

export class MockDataProvider {
  private config: MockDataProviderConfig;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(update: RealTimeUpdate) => void> = new Set();
  private isActive = false;
  private mockProxies: StreamingProxy[] = [];
  private mockStats: SystemStats = {
    totalProxies: 0,
    activeProxies: 0,
    totalActiveStreams: 0,
    totalBandwidthUsage: 0,
    healthyProxies: 0,
    warningProxies: 0,
    errorProxies: 0
  };

  constructor(config: Partial<MockDataProviderConfig> = {}) {
    this.config = {
      updateInterval: config.updateInterval || 5000,
      enableRandomUpdates: config.enableRandomUpdates ?? true,
      simulateNetworkDelay: config.simulateNetworkDelay ?? true,
      networkDelayRange: config.networkDelayRange || [100, 500],
      ...config,
    };

    this.initializeMockData();
  }

  /**
   * Start providing mock real-time updates
   */
  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.scheduleNextUpdate();
  }

  /**
   * Stop providing mock updates
   */
  stop(): void {
    this.isActive = false;
    if (this.updateInterval) {
      clearTimeout(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Subscribe to mock real-time updates
   */
  subscribe(callback: (update: RealTimeUpdate) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Get current mock proxies
   */
  getMockProxies(): StreamingProxy[] {
    return [...this.mockProxies];
  }

  /**
   * Get current mock system stats
   */
  getMockStats(): SystemStats {
    return { ...this.mockStats };
  }

  /**
   * Simulate a specific update type
   */
  simulateUpdate(type: RealTimeUpdate['type']): void {
    const update = this.generateUpdate(type);
    if (update) {
      this.broadcastUpdate(update);
    }
  }

  private initializeMockData(): void {
    // Initialize mock proxies
    this.mockProxies = [
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

    // Initialize mock system stats
    this.updateMockStats();
  }

  private updateMockStats(): void {
    const activeProxies = this.mockProxies.filter(p => p.status === ProxyStatus.ACTIVE);
    const totalActiveStreams = this.mockProxies.reduce((sum, p) => sum + p.currentActiveStreams, 0);
    
    this.mockStats = {
      totalProxies: this.mockProxies.length,
      activeProxies: activeProxies.length,
      totalActiveStreams,
      totalBandwidthUsage: totalActiveStreams * 50, // Mock: 50 Mbps per stream
      healthyProxies: this.mockProxies.filter(p => p.healthStatus === HealthStatus.HEALTHY).length,
      warningProxies: this.mockProxies.filter(p => p.healthStatus === HealthStatus.WARNING).length,
      errorProxies: this.mockProxies.filter(p => p.healthStatus === HealthStatus.ERROR).length,
    };
  }

  private scheduleNextUpdate(): void {
    if (!this.isActive) return;

    const delay = this.config.enableRandomUpdates 
      ? this.config.updateInterval + (Math.random() - 0.5) * 2000
      : this.config.updateInterval;

    this.updateInterval = setTimeout(() => {
      this.generateRandomUpdate();
      this.scheduleNextUpdate();
    }, Math.max(1000, delay));
  }

  private generateRandomUpdate(): void {
    const updateTypes: RealTimeUpdate['type'][] = [
      'proxy_status',
      'stream_count',
      'health_check',
      'system_stats',
    ];

    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    const update = this.generateUpdate(randomType);
    
    if (update) {
      this.broadcastUpdate(update);
    }
  }

  private generateUpdate(type: RealTimeUpdate['type']): RealTimeUpdate | null {
    const timestamp = new Date();

    switch (type) {
      case 'proxy_status': {
        const proxy = this.getRandomProxy();
        if (!proxy) return null;

        // Randomly change proxy status
        const statuses = [ProxyStatus.ACTIVE, ProxyStatus.INACTIVE, ProxyStatus.MAINTENANCE];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const updatedProxy = { ...proxy, status: newStatus, updatedAt: timestamp };
        this.updateProxyInMockData(updatedProxy);

        return {
          type: 'proxy_status',
          data: updatedProxy,
          timestamp,
        };
      }

      case 'stream_count': {
        const proxy = this.getRandomProxy();
        if (!proxy) return null;

        // Randomly change stream count
        const maxChange = Math.min(3, proxy.maxConcurrentStreams - proxy.currentActiveStreams);
        const change = Math.floor(Math.random() * (maxChange + 3)) - 1; // -1 to +maxChange+1
        const newCount = Math.max(0, Math.min(proxy.maxConcurrentStreams, proxy.currentActiveStreams + change));
        
        const updatedProxy = { ...proxy, currentActiveStreams: newCount, updatedAt: timestamp };
        this.updateProxyInMockData(updatedProxy);
        this.updateMockStats();

        return {
          type: 'stream_count',
          data: { proxyId: proxy.id, count: newCount },
          timestamp,
        };
      }

      case 'health_check': {
        const proxy = this.getRandomProxy();
        if (!proxy) return null;

        // Randomly change health status
        const healthStatuses = [HealthStatus.HEALTHY, HealthStatus.WARNING, HealthStatus.ERROR];
        const newHealthStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
        
        const healthCheckResult: HealthCheckResult = {
          proxyId: proxy.id,
          status: newHealthStatus,
          responseTime: Math.floor(Math.random() * 500) + 50, // 50-550ms
          lastChecked: timestamp,
          errorMessage: newHealthStatus === HealthStatus.ERROR ? 'Connection timeout' : undefined,
        };

        const updatedProxy = { 
          ...proxy, 
          healthStatus: newHealthStatus, 
          lastHealthCheck: timestamp,
          updatedAt: timestamp 
        };
        this.updateProxyInMockData(updatedProxy);
        this.updateMockStats();

        return {
          type: 'health_check',
          data: healthCheckResult,
          timestamp,
        };
      }

      case 'system_stats': {
        // Add some random variation to stats
        const variation = () => Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        
        this.mockStats = {
          ...this.mockStats,
          totalBandwidthUsage: Math.max(0, this.mockStats.totalBandwidthUsage + variation() * 10),
        };

        return {
          type: 'system_stats',
          data: this.mockStats,
          timestamp,
        };
      }

      default:
        return null;
    }
  }

  private getRandomProxy(): StreamingProxy | null {
    if (this.mockProxies.length === 0) return null;
    return this.mockProxies[Math.floor(Math.random() * this.mockProxies.length)];
  }

  private updateProxyInMockData(updatedProxy: StreamingProxy): void {
    const index = this.mockProxies.findIndex(p => p.id === updatedProxy.id);
    if (index !== -1) {
      this.mockProxies[index] = updatedProxy;
    }
  }

  private async broadcastUpdate(update: RealTimeUpdate): Promise<void> {
    // Simulate network delay if enabled
    if (this.config.simulateNetworkDelay) {
      const [min, max] = this.config.networkDelayRange;
      const delay = Math.floor(Math.random() * (max - min + 1)) + min;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Broadcast to all subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in mock data subscriber:', error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stop();
    this.subscribers.clear();
  }
}

import { config as productionConfig } from './config/production';

// Environment-based factory function
export function createDataProvider(config?: Partial<MockDataProviderConfig>): MockDataProvider | null {
  // Only create mock data provider when explicitly enabled
  if (productionConfig.features.mockDataFallback) {
    console.log('Mock data provider enabled for fallback');
    return new MockDataProvider(config);
  }
  
  console.log('Mock data provider disabled in production');
  return null;
}

// Singleton instance for global use
let globalMockDataProvider: MockDataProvider | null = null;

export function getMockDataProvider(config?: Partial<MockDataProviderConfig>): MockDataProvider | null {
  if (!globalMockDataProvider) {
    globalMockDataProvider = createDataProvider(config);
  }
  return globalMockDataProvider;
}

export function resetMockDataProvider(): void {
  if (globalMockDataProvider) {
    globalMockDataProvider.destroy();
    globalMockDataProvider = null;
  }
}