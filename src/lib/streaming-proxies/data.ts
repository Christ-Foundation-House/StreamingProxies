import { StreamingProxy, ProxyStatus, HealthStatus } from './types';
import { apiClient, ApiClientError } from './api-client';

// Extend the StreamingProxy interface to include bandwidthUsed
interface ExtendedStreamingProxy extends Omit<StreamingProxy, 'healthStatus'> {
  bandwidthUsed?: number;
  healthStatus: HealthStatus;
}

// Mock data for development fallback
const MOCK_PROXIES: ExtendedStreamingProxy[] = [
  {
    id: '1',
    name: 'US East Proxy',
    description: 'Primary proxy for US East region',
    rtmpUrl: 'rtmp://us-east.streaming-proxy.com/live',
    serverLocation: 'New York, US',
    maxConcurrentStreams: 10,
    currentActiveStreams: 3,
    status: ProxyStatus.ACTIVE,
    bandwidthLimit: 1000, // 1Gbps
    bandwidthUsed: 450, // 450Mbps
    churchBranchId: 'church-1',
    createdBy: 'admin@example.com',
    createdAt: new Date('2023-01-15T10:00:00Z'),
    updatedAt: new Date('2023-10-05T14:30:00Z'),
    lastHealthCheck: new Date('2023-10-05T14:28:00Z'),
    healthStatus: HealthStatus.HEALTHY,
  },
  // Add more mock proxies as needed
];

// Get proxy by ID
export async function getProxyById(id: string): Promise<StreamingProxy | undefined> {
  try {
    const response = await apiClient.getProxy(id);
    
    if (response.success && response.data) {
      // Transform the API response to match the StreamingProxy type
      const proxyData = response.data;
      return {
        ...proxyData,
        createdAt: new Date(proxyData.createdAt),
        updatedAt: new Date(proxyData.updatedAt),
        lastHealthCheck: proxyData.lastHealthCheck ? new Date(proxyData.lastHealthCheck) : undefined,
      };
    }
    
    return undefined;
  } catch (error) {
    console.error('Error fetching proxy:', error);
    
    // Handle specific API errors
    if (error instanceof ApiClientError && error.statusCode === 404) {
      return undefined; // Proxy not found
    }
    
    // Fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data as fallback');
      return MOCK_PROXIES.find(proxy => proxy.id === id);
    }
    
    throw error; // Re-throw to be handled by the calling component
  }
}

// Get bandwidth data for a proxy
export async function getProxyBandwidthData(
  proxyId: string, 
  timeRange: '1h' | '24h' | '7d' | '30d'
): Promise<Array<{ timestamp: number; bytesTransferred: number }>> {
  try {
    // Use the API client to fetch bandwidth data
    const response = await apiClient.get<{ success: boolean; data: Array<{ timestamp: string; bytesTransferred: number }> }>(
      `/streaming-proxies/${proxyId}/bandwidth?range=${timeRange}`
    );
    
    if (response.success && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        timestamp: new Date(item.timestamp).getTime(),
        bytesTransferred: Number(item.bytesTransferred),
      }));
    } else {
      throw new Error('Invalid data format received from API');
    }
  } catch (error) {
    console.error('Error fetching bandwidth data:', error);
    
    // Fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock bandwidth data as fallback');
      const now = Date.now();
      let points = 24; // Default to 24 points (1 per hour)
      let interval = 3600000; // 1 hour in ms
      
      if (timeRange === '1h') {
        points = 12; // 5-minute intervals for 1 hour
        interval = 300000; // 5 minutes in ms
      } else if (timeRange === '7d') {
        points = 28; // 6-hour intervals for 7 days
        interval = 6 * 3600000; // 6 hours in ms
      } else if (timeRange === '30d') {
        points = 30; // 1 day intervals for 30 days
        interval = 24 * 3600000; // 24 hours in ms
      }

      // Generate mock data points
      return Array.from({ length: points }, (_, i) => ({
        timestamp: now - (interval * (points - i - 1)),
        bytesTransferred: Math.floor(Math.random() * 1000000000), // Random value up to 1GB
      }));
    }
    
    throw error; // Re-throw to be handled by the calling component
  }
}

// Get all proxies
export async function getAllProxies(): Promise<StreamingProxy[]> {
  try {
    const response = await apiClient.getProxies();
    
    if (response.success && Array.isArray(response.data)) {
      // Transform the API response to match the StreamingProxy type
      return response.data.map((proxyData: any) => ({
        ...proxyData,
        createdAt: new Date(proxyData.createdAt),
        updatedAt: new Date(proxyData.updatedAt),
        lastHealthCheck: proxyData.lastHealthCheck ? new Date(proxyData.lastHealthCheck) : undefined,
      }));
    } else {
      throw new Error('Invalid data format received from API');
    }
  } catch (error) {
    console.error('Error fetching proxies:', error);
    
    // Fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data as fallback');
      return MOCK_PROXIES;
    }
    
    throw error; // Re-throw to be handled by the calling component
  }
}

// Update proxy
export async function updateProxy(
  id: string, 
  updates: Partial<StreamingProxy>
): Promise<StreamingProxy> {
  try {
    const response = await apiClient.updateProxy(id, updates);
    
    if (response.success && response.data) {
      // Transform the API response to match the StreamingProxy type
      const proxyData = response.data;
      return {
        ...proxyData,
        createdAt: new Date(proxyData.createdAt),
        updatedAt: new Date(proxyData.updatedAt),
        lastHealthCheck: proxyData.lastHealthCheck ? new Date(proxyData.lastHealthCheck) : undefined,
      };
    } else {
      throw new Error('Failed to update proxy');
    }
  } catch (error) {
    console.error('Error updating proxy:', error);
    
    // Fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data as fallback');
      const index = MOCK_PROXIES.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error(`Proxy with id ${id} not found`);
      }
      
      const updatedProxy = { 
        ...MOCK_PROXIES[index], 
        ...updates, 
        updatedAt: new Date() 
      };
      MOCK_PROXIES[index] = updatedProxy;
      
      return updatedProxy;
    }
    
    throw error; // Re-throw to be handled by the calling component
  }
}
