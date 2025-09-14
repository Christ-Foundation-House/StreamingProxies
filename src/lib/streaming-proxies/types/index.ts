export enum ProxyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum SessionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  FAILED = 'failed',
}

export interface StreamingProxy {
  id: string;
  name: string;
  description?: string;
  rtmpUrl: string;
  rtmpKey?: string;
  serverLocation: string;
  maxConcurrentStreams: number;
  currentActiveStreams: number;
  status: ProxyStatus;
  bandwidthLimit?: number; // in Mbps
  bandwidthUsed?: number; // in Mbps - added for monitoring
  churchBranchId: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastHealthCheck?: Date | string;
  healthStatus: HealthStatus;
  lastActiveAt?: Date | string; // Added for monitoring
}

export interface StreamingSession {
  id: string;
  proxyId: string;
  streamKey: string;
  status: SessionStatus;
  startTime: Date | string;
  endTime?: Date | string;
  duration?: number; // in seconds
  bytesTransferred?: number;
  errorMessage?: string;
  clientIp?: string;
  userAgent?: string;
}

export interface ProxyStats {
  proxyId: string;
  timestamp: Date | string;
  activeStreams: number;
  cpuUsage: number;
  memoryUsage: number;
  bandwidthIn: number; // in bps
  bandwidthOut: number; // in bps
  totalConnections: number;
  failedConnections: number;
}

export interface BandwidthDataPoint {
  timestamp: number;
  bytesTransferred: number;
}

export interface ProxyHealthCheck {
  timestamp: Date | string;
  status: HealthStatus;
  responseTime: number; // in ms
  error?: string;
}

export interface ProxyWithHealth extends StreamingProxy {
  healthChecks: ProxyHealthCheck[];
  stats: ProxyStats[];
  sessions: StreamingSession[];
}

export interface CreateProxyInput {
  name: string;
  description?: string;
  rtmpUrl: string;
  rtmpKey?: string;
  serverLocation: string;
  maxConcurrentStreams: number;
  bandwidthLimit?: number;
  churchBranchId: string;
}

export interface UpdateProxyInput extends Partial<CreateProxyInput> {
  status?: ProxyStatus;
  healthStatus?: HealthStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimeRange {
  start: Date | string;
  end: Date | string;
}
