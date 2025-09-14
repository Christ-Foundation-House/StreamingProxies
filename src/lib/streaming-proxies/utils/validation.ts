import { z } from 'zod';
import { ProxyStatus, HealthStatus, SessionStatus } from '../types';

// Proxy validation schemas
export const CreateProxySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  rtmpUrl: z.string().url('Must be a valid URL').refine(
    (url) => url.startsWith('rtmp://') || url.startsWith('rtmps://'),
    'Must be a valid RTMP URL (rtmp:// or rtmps://)'
  ),
  rtmpKey: z.string().max(255, 'RTMP key must be less than 255 characters').optional(),
  serverLocation: z.string().min(1, 'Server location is required').max(100, 'Server location must be less than 100 characters'),
  maxConcurrentStreams: z.number().min(1, 'Must allow at least 1 stream').max(10, 'Cannot exceed 10 concurrent streams'),
  bandwidthLimit: z.number().min(1, 'Bandwidth limit must be at least 1 Mbps').max(1000, 'Bandwidth limit cannot exceed 1000 Mbps').optional(),
  churchBranchId: z.string().uuid('Must be a valid church branch ID'),
});

export const UpdateProxySchema = CreateProxySchema.partial().extend({
  status: z.nativeEnum(ProxyStatus).optional(),
});

// Session validation schemas
export const CreateSessionSchema = z.object({
  proxyId: z.string().uuid('Must be a valid proxy ID'),
  fellowshipId: z.string().uuid('Must be a valid fellowship ID'),
  streamKey: z.string().min(1, 'Stream key is required').max(255, 'Stream key must be less than 255 characters'),
});

export const EndSessionSchema = z.object({
  sessionId: z.string().uuid('Must be a valid session ID'),
});

// Query parameter validation schemas
export const ProxyFiltersSchema = z.object({
  status: z.nativeEnum(ProxyStatus).optional(),
  healthStatus: z.nativeEnum(HealthStatus).optional(),
  churchBranchId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const SessionFiltersSchema = z.object({
  proxyId: z.string().uuid().optional(),
  fellowshipId: z.string().uuid().optional(),
  status: z.nativeEnum(SessionStatus).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const AnalyticsFiltersSchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d']).default('30d'),
  churchBranchId: z.string().uuid().optional(),
});

// Health check validation
export const HealthCheckSchema = z.object({
  proxyId: z.string().uuid('Must be a valid proxy ID'),
});

// Bulk operations validation
export const BulkUpdateStatusSchema = z.object({
  proxyIds: z.array(z.string().uuid()).min(1, 'Must select at least one proxy'),
  status: z.nativeEnum(ProxyStatus),
});

// Form validation helpers
export const validateProxyForm = (data: unknown) => {
  return CreateProxySchema.safeParse(data);
};

export const validateSessionForm = (data: unknown) => {
  return CreateSessionSchema.safeParse(data);
};

export const validateProxyFilters = (data: unknown) => {
  return ProxyFiltersSchema.safeParse(data);
};

export const validateSessionFilters = (data: unknown) => {
  return SessionFiltersSchema.safeParse(data);
};

// Custom validation functions
export const isValidRtmpUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'rtmp:' || parsed.protocol === 'rtmps:';
  } catch {
    return false;
  }
};

export const isValidStreamKey = (key: string): boolean => {
  return key.length > 0 && key.length <= 255 && !/[<>:"\\|?*]/.test(key);
};

export const validateBandwidthLimit = (limit: number): boolean => {
  return limit >= 1 && limit <= 1000;
};

export const validateConcurrentStreams = (streams: number): boolean => {
  return streams >= 1 && streams <= 10;
};

// Error message helpers
export const getValidationErrorMessage = (error: z.ZodError): string => {
  const firstError = error.issues[0];
  return firstError?.message || 'Validation failed';
};

export const getValidationErrors = (error: z.ZodError): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  return errors;
};

// Type guards
export const isProxyStatus = (value: string): value is ProxyStatus => {
  return Object.values(ProxyStatus).includes(value as ProxyStatus);
};

export const isHealthStatus = (value: string): value is HealthStatus => {
  return Object.values(HealthStatus).includes(value as HealthStatus);
};

export const isSessionStatus = (value: string): value is SessionStatus => {
  return Object.values(SessionStatus).includes(value as SessionStatus);
};