// Core TypeScript interfaces and enums for Streaming Proxy Management System
import { RealTimeUpdate } from './types/realtime';

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
  churchBranchId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastHealthCheck?: Date;
  healthStatus: HealthStatus;
}

export interface StreamingSession {
  id: string;
  proxyId: string;
  fellowshipId: string;
  streamKey: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes?: number;
  peakViewers: number;
  totalDataTransferred: number; // bytes
  status: SessionStatus;
}

export enum ProxyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum SessionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  FAILED = 'failed'
}

export interface SystemStats {
  totalProxies: number;
  activeProxies: number;
  totalActiveStreams: number;
  totalBandwidthUsage: number;
  healthyProxies: number;
  warningProxies: number;
  errorProxies: number;
}

export interface CreateProxyRequest {
  name: string;
  description?: string;
  rtmpUrl: string;
  rtmpKey?: string;
  serverLocation: string;
  maxConcurrentStreams: number;
  bandwidthLimit?: number;
  churchBranchId: string;
}

export interface UpdateProxyRequest extends Partial<CreateProxyRequest> {
  status?: ProxyStatus;
}

export interface CreateSessionRequest {
  proxyId: string;
  fellowshipId: string;
  streamKey: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export interface ProxyFilters {
  status?: ProxyStatus;
  healthStatus?: HealthStatus;
  churchBranchId?: string;
  search?: string;
}

export interface SessionFilters {
  proxyId?: string;
  fellowshipId?: string;
  status?: SessionStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AnalyticsData {
  usageByDay: Array<{
    date: string;
    totalStreams: number;
    totalDataTransferred: number;
    peakViewers: number;
  }>;
  topProxies: Array<{
    proxyId: string;
    proxyName: string;
    totalStreams: number;
    totalDataTransferred: number;
  }>;
  peakHours: Array<{
    hour: number;
    averageStreams: number;
  }>;
}

export interface HealthCheckResult {
  proxyId: string;
  status: HealthStatus;
  responseTime: number;
  lastChecked: Date;
  errorMessage?: string;
}

// Real-time update types are now in ./types/realtime.ts

// Form data types
export interface ProxyFormData {
  name: string;
  description: string;
  rtmpUrl: string;
  rtmpKey: string;
  serverLocation: string;
  maxConcurrentStreams: number;
  bandwidthLimit: number;
}

export interface SessionFormData {
  proxyId: string;
  fellowshipId: string;
  streamKey: string;
}

// Component prop types
export interface ProxyCardProps {
  proxy: StreamingProxy;
  showActions?: boolean;
  onStartStream?: (proxyId: string) => void;
  onViewDetails?: (proxyId: string) => void;
}

export interface SystemOverviewProps {
  stats: SystemStats;
  loading?: boolean;
}

export interface ProxyTableProps {
  proxies: StreamingProxy[];
  loading?: boolean;
  onEdit?: (proxy: StreamingProxy) => void;
  onDelete?: (proxyId: string) => void;
  onBulkAction?: (action: string, proxyIds: string[]) => void;
}

export interface ProxyFormProps {
  initialData?: Partial<StreamingProxy>;
  onSubmit: (data: ProxyFormData) => Promise<void>;
  mode: 'create' | 'edit';
  loading?: boolean;
}

export interface ActiveStreamsProps {
  sessions: StreamingSession[];
  loading?: boolean;
  onEndStream?: (sessionId: string) => void;
}

export interface UsageChartProps {
  data: AnalyticsData;
  timeRange: '7d' | '30d' | '90d';
  loading?: boolean;
}

export interface HealthMonitorProps {
  proxies: StreamingProxy[];
  healthChecks: HealthCheckResult[];
  onManualCheck?: (proxyId: string) => void;
}

export interface QuickActionsProps {
  onStartStream: () => void;
  onKillAllStreams: () => void;
  onRefreshData: () => void;
  loading?: boolean;
}

export interface BulkActionsProps {
  selectedIds: string[];
  onAction: (action: string, ids: string[]) => void;
  loading?: boolean;
}

export interface StatusIndicatorProps {
  status: ProxyStatus | HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export interface LoadingStateProps {
  type: 'card' | 'table' | 'chart' | 'list';
  count?: number;
}

// Hook return types
export interface UseStreamingProxiesReturn {
  proxies: StreamingProxy[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProxy: (data: CreateProxyRequest) => Promise<StreamingProxy>;
  updateProxy: (id: string, data: UpdateProxyRequest) => Promise<StreamingProxy>;
  deleteProxy: (id: string) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: ProxyStatus) => Promise<void>;
  runHealthCheck: (id: string) => Promise<HealthCheckResult>;
  updateProxyInState: (proxy: StreamingProxy) => void;
  filterProxies: (filters: ProxyFilters) => StreamingProxy[];
  getProxyById: (id: string) => StreamingProxy | undefined;
  getProxiesByStatus: (status: ProxyStatus) => StreamingProxy[];
  getAvailableProxies: () => StreamingProxy[];
  fetchProxies: (filters?: ProxyFilters) => Promise<void>;
}

export interface SystemStats {
  totalProxies: number;
  activeProxies: number;
  totalActiveStreams: number;
  totalBandwidthUsage: number;
  healthyProxies: number;
  warningProxies: number;
  errorProxies: number;
}

export interface CreateProxyRequest {
  name: string;
  description?: string;
  rtmpUrl: string;
  rtmpKey?: string;
  serverLocation: string;
  maxConcurrentStreams: number;
  bandwidthLimit?: number;
  churchBranchId: string;
}

export interface UpdateProxyRequest extends Partial<CreateProxyRequest> {
  status?: ProxyStatus;
}

export interface CreateSessionRequest {
  proxyId: string;
  fellowshipId: string;
  streamKey: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export interface ProxyFilters {
  status?: ProxyStatus;
  healthStatus?: HealthStatus;
  churchBranchId?: string;
  search?: string;
}

export interface SessionFilters {
  proxyId?: string;
  fellowshipId?: string;
  status?: SessionStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AnalyticsData {
  usageByDay: Array<{
    date: string;
    totalStreams: number;
    totalDataTransferred: number;
    peakViewers: number;
  }>;
  topProxies: Array<{
    proxyId: string;
    proxyName: string;
    totalStreams: number;
    totalDataTransferred: number;
  }>;
  peakHours: Array<{
    hour: number;
    averageStreams: number;
  }>;
}

export interface HealthCheckResult {
  proxyId: string;
  status: HealthStatus;
  responseTime: number;
  lastChecked: Date;
  errorMessage?: string;
}

// Real-time update types are now in ./types/realtime.ts

// Form data types
export interface ProxyFormData {
  name: string;
  description: string;
  rtmpUrl: string;
  rtmpKey: string;
  serverLocation: string;
  maxConcurrentStreams: number;
  bandwidthLimit: number;
}

export interface SessionFormData {
  proxyId: string;
  fellowshipId: string;
  streamKey: string;
}

// Component prop types
export interface ProxyCardProps {
  proxy: StreamingProxy;
  showActions?: boolean;
  onStartStream?: (proxyId: string) => void;
  onViewDetails?: (proxyId: string) => void;
}

export interface SystemOverviewProps {
  stats: SystemStats;
  loading?: boolean;
}

export interface ProxyTableProps {
  proxies: StreamingProxy[];
  loading?: boolean;
  onEdit?: (proxy: StreamingProxy) => void;
  onDelete?: (proxyId: string) => void;
  onBulkAction?: (action: string, proxyIds: string[]) => void;
}

export interface ProxyFormProps {
  initialData?: Partial<StreamingProxy>;
  onSubmit: (data: ProxyFormData) => Promise<void>;
  mode: 'create' | 'edit';
  loading?: boolean;
}

export interface ActiveStreamsProps {
  sessions: StreamingSession[];
  loading?: boolean;
  onEndStream?: (sessionId: string) => void;
}

export interface UsageChartProps {
  data: AnalyticsData;
  timeRange: '7d' | '30d' | '90d';
  loading?: boolean;
}

export interface HealthMonitorProps {
  proxies: StreamingProxy[];
  healthChecks: HealthCheckResult[];
  onManualCheck?: (proxyId: string) => void;
}

export interface QuickActionsProps {
  onStartStream: () => void;
  onKillAllStreams: () => void;
  onRefreshData: () => void;
  loading?: boolean;
}

export interface BulkActionsProps {
  selectedIds: string[];
  onAction: (action: string, ids: string[]) => void;
  loading?: boolean;
}

export interface StatusIndicatorProps {
  status: ProxyStatus | HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export interface LoadingStateProps {
  type: 'card' | 'table' | 'chart' | 'list';
  count?: number;
}


export interface UseStreamingStatsReturn {
  stats: SystemStats | null;
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateStats: (newStats: SystemStats) => void;
}

export interface UseHealthMonitoringReturn {
  healthChecks: HealthCheckResult[];
  loading: boolean;
  error: string | null;
  runHealthCheck: (proxyId: string) => Promise<HealthCheckResult>;
  runAllHealthChecks: () => Promise<HealthCheckResult[]>;
  getHealthCheck: (proxyId: string) => HealthCheckResult | undefined;
  getHealthChecksByStatus: (status: HealthStatus) => HealthCheckResult[];
  getHealthSummary: () => {
    total: number;
    healthy: number;
    warning: number;
    error: number;
    healthyPercentage: number;
    averageResponseTime: number;
  };
  needsHealthCheck: (proxyId: string, maxAge?: number) => boolean;
  getStaleHealthChecks: (maxAge?: number) => HealthCheckResult[];
  updateHealthCheck: (result: HealthCheckResult) => void;
}

export interface UseRealTimeReturn {
  connected: boolean;
  lastUpdate: RealTimeUpdate | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
}

// Context types
export interface StreamingProxyContextType {
  proxies: StreamingProxy[];
  sessions: StreamingSession[];
  stats: SystemStats | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createProxy: (data: CreateProxyRequest) => Promise<StreamingProxy>;
  updateProxy: (id: string, data: UpdateProxyRequest) => Promise<StreamingProxy>;
  deleteProxy: (id: string) => Promise<void>;
  startSession: (data: CreateSessionRequest) => Promise<StreamingSession>;
  endSession: (sessionId: string) => Promise<void>;
}