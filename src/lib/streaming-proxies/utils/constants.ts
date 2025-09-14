import { ProxyStatus, HealthStatus, SessionStatus } from '../types';

// System configuration constants
export const SYSTEM_CONFIG = {
  MAX_CONCURRENT_STREAMS_PER_PROXY: 10,
  MIN_CONCURRENT_STREAMS_PER_PROXY: 1,
  MAX_BANDWIDTH_LIMIT_MBPS: 1000,
  MIN_BANDWIDTH_LIMIT_MBPS: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  HEALTH_CHECK_INTERVAL_MS: 30000, // 30 seconds
  HEALTH_CHECK_TIMEOUT_MS: 5000, // 5 seconds
  WEBSOCKET_RECONNECT_INTERVAL_MS: 3000, // 3 seconds
  MAX_WEBSOCKET_RECONNECT_ATTEMPTS: 5,
} as const;

// Status styling constants
export const STATUS_STYLES = {
  [ProxyStatus.ACTIVE]: "bg-green-100 text-green-800 border-green-200",
  [ProxyStatus.INACTIVE]: "bg-red-100 text-red-800 border-red-200",
  [ProxyStatus.MAINTENANCE]: "bg-yellow-100 text-yellow-800 border-yellow-200"
} as const;

export const HEALTH_STYLES = {
  [HealthStatus.HEALTHY]: "bg-green-500",
  [HealthStatus.WARNING]: "bg-yellow-500", 
  [HealthStatus.ERROR]: "bg-red-500"
} as const;

export const SESSION_STATUS_STYLES = {
  [SessionStatus.ACTIVE]: "bg-blue-100 text-blue-800 border-blue-200",
  [SessionStatus.ENDED]: "bg-gray-100 text-gray-800 border-gray-200",
  [SessionStatus.FAILED]: "bg-red-100 text-red-800 border-red-200"
} as const;

// Component styling constants
export const COMPONENT_STYLES = {
  CARD_BASE: "bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow",
  CARD_DARK: "bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 hover:shadow-md transition-shadow",
  BUTTON_PRIMARY: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  BUTTON_SECONDARY: "bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  BUTTON_DANGER: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  BUTTON_SUCCESS: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  INPUT_BASE: "block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
  INPUT_ERROR: "block w-full rounded-lg border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm",
  LABEL_BASE: "block text-sm font-medium text-gray-700 mb-1",
  ERROR_TEXT: "text-sm text-red-600 mt-1",
} as const;

// Layout styling constants
export const LAYOUT_STYLES = {
  DASHBOARD_GRID: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6",
  STATS_GRID: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  ADMIN_TABLE: "overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 md:rounded-lg",
  FORM_LAYOUT: "space-y-6 max-w-2xl",
  PAGE_HEADER: "border-b border-gray-200 pb-4 mb-6",
  SECTION_SPACING: "space-y-6",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  PROXIES: '/api/streaming-proxies',
  PROXY_BY_ID: (id: string) => `/api/streaming-proxies/${id}`,
  PROXY_HEALTH_CHECK: (id: string) => `/api/streaming-proxies/${id}/health-check`,
  PROXY_STATS: '/api/streaming-proxies/stats',
  SESSIONS: '/api/streaming-proxies/sessions',
  SESSION_BY_ID: (id: string) => `/api/streaming-proxies/sessions/${id}`,
  SESSION_END: (id: string) => `/api/streaming-proxies/sessions/${id}/end`,
  SESSIONS_ANALYTICS: '/api/streaming-proxies/sessions/analytics',
} as const;

// WebSocket events
export const WEBSOCKET_EVENTS = {
  PROXY_STATUS_UPDATE: 'proxy_status_update',
  STREAM_COUNT_UPDATE: 'stream_count_update',
  HEALTH_CHECK_UPDATE: 'health_check_update',
  SYSTEM_STATS_UPDATE: 'system_stats_update',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  CONNECTION_ESTABLISHED: 'connection_established',
  CONNECTION_LOST: 'connection_lost',
} as const;

// Default values
export const DEFAULT_VALUES = {
  PROXY: {
    maxConcurrentStreams: 1,
    bandwidthLimit: 50,
    status: ProxyStatus.INACTIVE,
    healthStatus: HealthStatus.HEALTHY,
  },
  SESSION: {
    peakViewers: 0,
    totalDataTransferred: 0,
    status: SessionStatus.ACTIVE,
  },
  PAGINATION: {
    page: 1,
    limit: 20,
  },
  ANALYTICS: {
    timeRange: '30d' as const,
  },
} as const;

// Server locations (predefined options)
export const SERVER_LOCATIONS = [
  { value: 'us-east-1', label: 'US East (Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
  { value: 'ca-central-1', label: 'Canada (Central)' },
  { value: 'sa-east-1', label: 'South America (São Paulo)' },
] as const;

// Time range options for analytics
export const TIME_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
] as const;

// Status display labels
export const STATUS_LABELS = {
  [ProxyStatus.ACTIVE]: 'Active',
  [ProxyStatus.INACTIVE]: 'Inactive',
  [ProxyStatus.MAINTENANCE]: 'Maintenance',
} as const;

export const HEALTH_STATUS_LABELS = {
  [HealthStatus.HEALTHY]: 'Healthy',
  [HealthStatus.WARNING]: 'Warning',
  [HealthStatus.ERROR]: 'Error',
} as const;

export const SESSION_STATUS_LABELS = {
  [SessionStatus.ACTIVE]: 'Active',
  [SessionStatus.ENDED]: 'Ended',
  [SessionStatus.FAILED]: 'Failed',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  PROXY_NOT_FOUND: 'Streaming proxy not found.',
  SESSION_NOT_FOUND: 'Streaming session not found.',
  PROXY_IN_USE: 'Cannot delete proxy while streams are active.',
  MAX_STREAMS_REACHED: 'Maximum concurrent streams reached for this proxy.',
  HEALTH_CHECK_FAILED: 'Health check failed. Please verify proxy configuration.',
  WEBSOCKET_CONNECTION_FAILED: 'Failed to establish real-time connection.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROXY_CREATED: 'Streaming proxy created successfully.',
  PROXY_UPDATED: 'Streaming proxy updated successfully.',
  PROXY_DELETED: 'Streaming proxy deleted successfully.',
  SESSION_STARTED: 'Streaming session started successfully.',
  SESSION_ENDED: 'Streaming session ended successfully.',
  HEALTH_CHECK_COMPLETED: 'Health check completed successfully.',
  BULK_UPDATE_COMPLETED: 'Bulk update completed successfully.',
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  LOADING_PROXIES: 'Loading streaming proxies...',
  LOADING_SESSIONS: 'Loading streaming sessions...',
  LOADING_STATS: 'Loading statistics...',
  LOADING_ANALYTICS: 'Loading analytics data...',
  CREATING_PROXY: 'Creating streaming proxy...',
  UPDATING_PROXY: 'Updating streaming proxy...',
  DELETING_PROXY: 'Deleting streaming proxy...',
  STARTING_SESSION: 'Starting streaming session...',
  ENDING_SESSION: 'Ending streaming session...',
  RUNNING_HEALTH_CHECK: 'Running health check...',
} as const;

// Chart colors for analytics
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#6366F1',
  SECONDARY: '#6B7280',
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;