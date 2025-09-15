import { 
  StreamingProxy, 
  StreamingSession, 
  SystemStats, 
  HealthCheckResult,
  CreateProxyRequest,
  UpdateProxyRequest,
  CreateSessionRequest,
  ApiResponse,
  ApiError,
  ProxyFilters,
  SessionFilters,
  AnalyticsData
} from './types';

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRetry: boolean;
}

export interface RequestOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableRetry?: boolean;
  signal?: AbortSignal;
}

export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class ApiClientError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode?: number;
  public readonly details?: Record<string, string[]>;
  public readonly originalError?: Error;

  constructor(
    message: string,
    type: ApiErrorType,
    statusCode?: number,
    details?: Record<string, string[]>,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.originalError = originalError;
  }

  static fromResponse(response: Response, data?: any): ApiClientError {
    const statusCode = response.status;
    let type: ApiErrorType;
    let message = data?.error || data?.message || response.statusText || 'Unknown error';
    
    if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 401) {
        type = ApiErrorType.AUTHENTICATION_ERROR;
        message = 'Authentication required';
      } else if (statusCode === 403) {
        type = ApiErrorType.AUTHORIZATION_ERROR;
        message = 'Access denied';
      } else if (statusCode === 404) {
        type = ApiErrorType.NOT_FOUND_ERROR;
        message = 'Resource not found';
      } else if (statusCode === 422) {
        type = ApiErrorType.VALIDATION_ERROR;
        message = 'Validation failed';
      } else {
        type = ApiErrorType.CLIENT_ERROR;
      }
    } else if (statusCode >= 500) {
      type = ApiErrorType.SERVER_ERROR;
      message = 'Server error occurred';
    } else {
      type = ApiErrorType.UNKNOWN_ERROR;
    }

    return new ApiClientError(message, type, statusCode, data?.details);
  }

  static fromNetworkError(error: Error): ApiClientError {
    if (error.name === 'AbortError') {
      return new ApiClientError('Request timeout', ApiErrorType.TIMEOUT_ERROR, undefined, undefined, error);
    }
    return new ApiClientError('Network error', ApiErrorType.NETWORK_ERROR, undefined, undefined, error);
  }
}

export class ApiClient {
  private config: ApiClientConfig;
  private requestInterceptors: Array<(request: RequestInit) => RequestInit | Promise<RequestInit>> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      enableRetry: config.enableRetry ?? true,
      ...config,
    };
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: (request: RequestInit) => RequestInit | Promise<RequestInit>): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Make HTTP request with retry logic and error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = this.config.timeout,
      retryAttempts = this.config.retryAttempts,
      retryDelay = this.config.retryDelay,
      enableRetry = this.config.enableRetry,
      signal,
      ...requestOptions
    } = options;

    const url = `${this.config.baseUrl}${endpoint}`;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Use provided signal or our timeout signal
    const requestSignal = signal || controller.signal;

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= retryAttempts) {
      try {
        // Apply request interceptors
        let finalRequestOptions: RequestInit = {
          ...requestOptions,
          signal: requestSignal || undefined,
          headers: {
            'Content-Type': 'application/json',
            ...requestOptions.headers,
          },
        };

        for (const interceptor of this.requestInterceptors) {
          finalRequestOptions = await interceptor(finalRequestOptions);
        }

        // Make the request
        let response = await fetch(url, finalRequestOptions);

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          response = await interceptor(response);
        }

        clearTimeout(timeoutId);

        // Handle non-ok responses
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            // Response might not be JSON
          }
          throw ApiClientError.fromResponse(response, errorData);
        }

        // Parse response
        const data = await response.json();
        return data;

      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        // Don't retry on client errors (4xx) or if retry is disabled
        if (
          !enableRetry ||
          attempt >= retryAttempts ||
          (error instanceof ApiClientError && 
           (error.type === ApiErrorType.CLIENT_ERROR ||
            error.type === ApiErrorType.AUTHENTICATION_ERROR ||
            error.type === ApiErrorType.AUTHORIZATION_ERROR ||
            error.type === ApiErrorType.NOT_FOUND_ERROR ||
            error.type === ApiErrorType.VALIDATION_ERROR))
        ) {
          break;
        }

        // Wait before retry with exponential backoff
        if (attempt < retryAttempts) {
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        attempt++;
      }
    }

    // Convert non-ApiClientError to ApiClientError
    if (lastError) {
      if (!(lastError instanceof ApiClientError)) {
        throw ApiClientError.fromNetworkError(lastError);
      }
      throw lastError;
    }

    // This should never happen, but just in case
    throw new ApiClientError('Unknown error occurred', ApiErrorType.UNKNOWN_ERROR);
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Streaming Proxy API methods

  /**
   * Get all streaming proxies with optional filters
   */
  async getProxies(filters?: ProxyFilters): Promise<ApiResponse<StreamingProxy[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.healthStatus) params.append('healthStatus', filters.healthStatus);
    if (filters?.churchBranchId) params.append('churchBranchId', filters.churchBranchId);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/streaming-proxies${queryString ? `?${queryString}` : ''}`;
    
    return this.get<ApiResponse<StreamingProxy[]>>(endpoint);
  }

  /**
   * Get a single streaming proxy by ID
   */
  async getProxy(id: string): Promise<ApiResponse<StreamingProxy>> {
    return this.get<ApiResponse<StreamingProxy>>(`/streaming-proxies/${id}`);
  }

  /**
   * Create a new streaming proxy
   */
  async createProxy(data: CreateProxyRequest): Promise<ApiResponse<StreamingProxy>> {
    return this.post<ApiResponse<StreamingProxy>>('/streaming-proxies', data);
  }

  /**
   * Update an existing streaming proxy
   */
  async updateProxy(id: string, data: UpdateProxyRequest): Promise<ApiResponse<StreamingProxy>> {
    return this.patch<ApiResponse<StreamingProxy>>(`/streaming-proxies/${id}`, data);
  }

  /**
   * Delete a streaming proxy
   */
  async deleteProxy(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/streaming-proxies/${id}`);
  }

  /**
   * Run health check for a specific proxy
   */
  async runHealthCheck(id: string): Promise<ApiResponse<HealthCheckResult>> {
    return this.post<ApiResponse<HealthCheckResult>>(`/streaming-proxies/${id}/health-check`);
  }

  /**
   * Run health checks for all proxies
   */
  async runAllHealthChecks(): Promise<ApiResponse<HealthCheckResult[]>> {
    return this.post<ApiResponse<HealthCheckResult[]>>('/streaming-proxies/health-check');
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return this.get<ApiResponse<SystemStats>>('/streaming-proxies/stats');
  }

  /**
   * Get analytics data
   */
  async getAnalytics(timeRange: '7d' | '30d' | '90d' = '7d'): Promise<ApiResponse<AnalyticsData>> {
    return this.get<ApiResponse<AnalyticsData>>(`/streaming-proxies/analytics?timeRange=${timeRange}`);
  }

  // Streaming Session API methods

  /**
   * Get all streaming sessions with optional filters
   */
  async getSessions(filters?: SessionFilters): Promise<ApiResponse<StreamingSession[]>> {
    const params = new URLSearchParams();
    if (filters?.proxyId) params.append('proxyId', filters.proxyId);
    if (filters?.fellowshipId) params.append('fellowshipId', filters.fellowshipId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());

    const queryString = params.toString();
    const endpoint = `/streaming-sessions${queryString ? `?${queryString}` : ''}`;
    
    return this.get<ApiResponse<StreamingSession[]>>(endpoint);
  }

  /**
   * Get a single streaming session by ID
   */
  async getSession(id: string): Promise<ApiResponse<StreamingSession>> {
    return this.get<ApiResponse<StreamingSession>>(`/streaming-sessions/${id}`);
  }

  /**
   * Create a new streaming session
   */
  async createSession(data: CreateSessionRequest): Promise<ApiResponse<StreamingSession>> {
    return this.post<ApiResponse<StreamingSession>>('/streaming-sessions', data);
  }

  /**
   * End a streaming session
   */
  async endSession(id: string): Promise<ApiResponse<StreamingSession>> {
    return this.patch<ApiResponse<StreamingSession>>(`/streaming-sessions/${id}/end`);
  }

  /**
   * Get active sessions for a specific proxy
   */
  async getActiveSessions(proxyId: string): Promise<ApiResponse<StreamingSession[]>> {
    return this.get<ApiResponse<StreamingSession[]>>(`/streaming-proxies/${proxyId}/sessions/active`);
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Add default request interceptor for authentication
apiClient.addRequestInterceptor(async (request) => {
  // Add authentication headers if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    request.headers = {
      ...request.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  return request;
});

// Add default response interceptor for logging
apiClient.addResponseInterceptor(async (response) => {
  // Log API calls in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`API ${response.status}: ${response.url}`);
  }
  return response;
});