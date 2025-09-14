import { 
  StreamingProxy, 
  StreamingSession, 
  SystemStats, 
  CreateProxyRequest, 
  UpdateProxyRequest,
  CreateSessionRequest,
  ApiResponse,
  ProxyFilters,
  SessionFilters,
  AnalyticsData,
  HealthCheckResult
} from './types';
import { API_ENDPOINTS } from './utils/constants';

// Base API client
class ApiClient {
  private baseUrl = '';

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json() as ApiResponse<T>;
      
      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  // Proxy endpoints
  async getProxies(filters?: ProxyFilters): Promise<ApiResponse<StreamingProxy[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = params.toString() 
      ? `${API_ENDPOINTS.PROXIES}?${params.toString()}`
      : API_ENDPOINTS.PROXIES;
    
    return this.request<StreamingProxy[]>(endpoint);
  }

  async getProxy(id: string): Promise<ApiResponse<StreamingProxy>> {
    return this.request<StreamingProxy>(API_ENDPOINTS.PROXY_BY_ID(id));
  }

  async createProxy(data: CreateProxyRequest): Promise<ApiResponse<StreamingProxy>> {
    return this.request<StreamingProxy>(API_ENDPOINTS.PROXIES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProxy(id: string, data: UpdateProxyRequest): Promise<ApiResponse<StreamingProxy>> {
    return this.request<StreamingProxy>(API_ENDPOINTS.PROXY_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProxy(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.PROXY_BY_ID(id), {
      method: 'DELETE',
    });
  }

  async runHealthCheck(id: string): Promise<ApiResponse<HealthCheckResult>> {
    return this.request<HealthCheckResult>(API_ENDPOINTS.PROXY_HEALTH_CHECK(id), {
      method: 'POST',
    });
  }

  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return this.request<SystemStats>(API_ENDPOINTS.PROXY_STATS);
  }

  // Session endpoints
  async getSessions(filters?: SessionFilters): Promise<ApiResponse<StreamingSession[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = params.toString() 
      ? `${API_ENDPOINTS.SESSIONS}?${params.toString()}`
      : API_ENDPOINTS.SESSIONS;
    
    return this.request<StreamingSession[]>(endpoint);
  }

  async createSession(data: CreateSessionRequest): Promise<ApiResponse<StreamingSession>> {
    return this.request<StreamingSession>(API_ENDPOINTS.SESSIONS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async endSession(id: string): Promise<ApiResponse<StreamingSession>> {
    return this.request<StreamingSession>(API_ENDPOINTS.SESSION_END(id), {
      method: 'PUT',
    });
  }

  async getAnalytics(timeRange: string): Promise<ApiResponse<AnalyticsData>> {
    return this.request<AnalyticsData>(`${API_ENDPOINTS.SESSIONS_ANALYTICS}?timeRange=${timeRange}`);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility functions
export const apiUtils = {
  async testRtmpConnection(url: string): Promise<{ success: boolean; message: string }> {
    try {
      // Mock implementation - in real app, this would test the RTMP connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (url.includes('invalid')) {
        return { success: false, message: 'Connection failed: Invalid RTMP server' };
      }
      
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: 'Connection test failed' };
    }
  },

  async bulkUpdateProxyStatus(ids: string[], status: string): Promise<void> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};

// Export individual functions for convenience
export const {
  getProxies,
  getProxy,
  createProxy,
  updateProxy,
  deleteProxy,
  runHealthCheck,
  getSystemStats,
  getSessions,
  createSession,
  endSession,
  getAnalytics,
} = apiClient;