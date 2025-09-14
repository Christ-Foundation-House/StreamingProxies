import { NextRequest, NextResponse } from 'next/server';
import { ProxyStatus, HealthStatus, type SystemStats, type ApiResponse, type StreamingProxy } from '@/lib/streaming-proxies/types';

// Mock database - replace with actual database implementation
const mockProxies: StreamingProxy[] = [
  {
    id: '1',
    name: 'Main Campus RTMP',
    description: 'Primary streaming proxy for main campus services',
    rtmpUrl: 'rtmp://stream.example.com/live',
    rtmpKey: 'main-campus-key',
    serverLocation: 'us-east-1',
    maxConcurrentStreams: 3,
    currentActiveStreams: 1,
    status: ProxyStatus.ACTIVE,
    bandwidthLimit: 100,
    churchBranchId: 'branch-1',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    lastHealthCheck: new Date(),
    healthStatus: HealthStatus.HEALTHY,
  },
  {
    id: '2',
    name: 'Youth Campus RTMP',
    description: 'Streaming proxy for youth services and events',
    rtmpUrl: 'rtmp://youth.example.com/live',
    serverLocation: 'us-west-2',
    maxConcurrentStreams: 2,
    currentActiveStreams: 0,
    status: ProxyStatus.INACTIVE,
    bandwidthLimit: 50,
    churchBranchId: 'branch-1',
    createdBy: 'user-2',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10'),
    lastHealthCheck: new Date(Date.now() - 300000), // 5 minutes ago
    healthStatus: HealthStatus.WARNING,
  },
  {
    id: '3',
    name: 'Online Campus RTMP',
    description: 'Streaming proxy for online services',
    rtmpUrl: 'rtmp://online.example.com/live',
    serverLocation: 'us-central-1',
    maxConcurrentStreams: 5,
    currentActiveStreams: 2,
    status: ProxyStatus.ACTIVE,
    bandwidthLimit: 200,
    churchBranchId: 'branch-2',
    createdBy: 'user-3',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    lastHealthCheck: new Date(),
    healthStatus: HealthStatus.HEALTHY,
  },
];

// GET /api/streaming-proxies/stats - Get system statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const churchBranchId = searchParams.get('churchBranchId');

    // Filter proxies by church branch if specified
    let filteredProxies = mockProxies;
    if (churchBranchId) {
      filteredProxies = mockProxies.filter(proxy => proxy.churchBranchId === churchBranchId);
    }

    // Calculate statistics
    const totalProxies = filteredProxies.length;
    const activeProxies = filteredProxies.filter(proxy => proxy.status === ProxyStatus.ACTIVE).length;
    const totalActiveStreams = filteredProxies.reduce((sum, proxy) => sum + proxy.currentActiveStreams, 0);
    const totalBandwidthUsage = filteredProxies.reduce((sum, proxy) => {
      if (proxy.status === ProxyStatus.ACTIVE && proxy.bandwidthLimit) {
        // Calculate estimated usage based on active streams
        const utilizationRatio = proxy.currentActiveStreams / proxy.maxConcurrentStreams;
        return sum + (proxy.bandwidthLimit * utilizationRatio);
      }
      return sum;
    }, 0);

    const healthyProxies = filteredProxies.filter(proxy => proxy.healthStatus === HealthStatus.HEALTHY).length;
    const warningProxies = filteredProxies.filter(proxy => proxy.healthStatus === HealthStatus.WARNING).length;
    const errorProxies = filteredProxies.filter(proxy => proxy.healthStatus === HealthStatus.ERROR).length;

    const stats: SystemStats = {
      totalProxies,
      activeProxies,
      totalActiveStreams,
      totalBandwidthUsage: Math.round(totalBandwidthUsage * 100) / 100, // Round to 2 decimal places
      healthyProxies,
      warningProxies,
      errorProxies,
    };

    const response: ApiResponse<SystemStats> = {
      data: stats,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}