import { NextResponse } from 'next/server';
import { config } from '@/lib/streaming-proxies/config/production';

export async function GET() {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      features: {
        realTimeEnabled: config.websocket.enabled,
        mockDataEnabled: config.features.mockDataFallback,
        apiBaseUrl: config.api.baseUrl,
      },
      services: {
        api: 'operational',
        websocket: config.websocket.enabled ? 'configured' : 'disabled',
        database: 'not_configured', // Would check actual DB connection in production
      }
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}