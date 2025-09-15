/**
 * Production configuration for streaming proxies
 */

export interface ProductionConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  websocket: {
    url: string;
    enabled: boolean;
    reconnectAttempts: number;
    reconnectInterval: number;
    maxReconnectInterval: number;
    heartbeatInterval: number;
  };
  features: {
    realTimeUpdates: boolean;
    mockDataFallback: boolean;
    errorReporting: boolean;
  };
  monitoring: {
    sentryDsn?: string;
    analyticsId?: string;
  };
}

export const getProductionConfig = (): ProductionConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';

  return {
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 
        (isProduction ? 'https://api.streaming-proxies.com' : 'http://localhost:3000/api'),
      timeout: parseInt(process.env.API_TIMEOUT || '30000'),
      retryAttempts: isProduction ? 3 : 1,
      retryDelay: isProduction ? 1000 : 500,
    },
    websocket: {
      url: process.env.NEXT_PUBLIC_WS_URL || 
        (isProduction ? 'wss://ws.streaming-proxies.com/ws' : 'ws://localhost:8080/ws'),
      enabled: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true',
      reconnectAttempts: isProduction ? 10 : 3,
      reconnectInterval: 2000,
      maxReconnectInterval: isProduction ? 60000 : 10000,
      heartbeatInterval: 30000,
    },
    features: {
      realTimeUpdates: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true',
      mockDataFallback: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
      errorReporting: isProduction && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
    monitoring: {
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    },
  };
};

export const config = getProductionConfig();