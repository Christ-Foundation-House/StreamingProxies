import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateProxySchema, ProxyFiltersSchema } from '@/lib/streaming-proxies/utils/validation';
import { ProxyStatus, HealthStatus, type StreamingProxy } from '@/lib/streaming-proxies/types';
import { createApiHandler as createErrorHandledApiHandler, handleApiError, withErrorHandling } from '@/lib/error-handler';
import { parseRequestBody } from '@/lib/api-utils';

// Mock database - replace with actual database implementation
let mockProxies: StreamingProxy[] = [
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
];

// GET /api/streaming-proxies - List all proxies with filtering
const getProxies = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  
  // Validate query parameters
  const filters = ProxyFiltersSchema.safeParse(queryParams);
  if (!filters.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid filters',
        details: filters.error.format() 
      },
      { status: 400 }
    );
  }
  // Filter proxies based on query parameters
  let filteredProxies = [...mockProxies];
  
  if (filters.data.status) {
    filteredProxies = filteredProxies.filter(proxy => proxy.status === filters.data.status);
  }
  
  if (filters.data.healthStatus) {
    filteredProxies = filteredProxies.filter(proxy => proxy.healthStatus === filters.data.healthStatus);
  }
  
  if (filters.data.churchBranchId) {
    filteredProxies = filteredProxies.filter(proxy => proxy.churchBranchId === filters.data.churchBranchId);
  }
  
  if (filters.data.search) {
    const searchLower = filters.data.search.toLowerCase();
    filteredProxies = filteredProxies.filter(proxy => 
      proxy.name.toLowerCase().includes(searchLower) ||
      proxy.description?.toLowerCase().includes(searchLower) ||
      proxy.rtmpUrl.toLowerCase().includes(searchLower)
    );
  }
  
  // Pagination
  const { page, limit } = filters.data;
  const total = filteredProxies.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProxies = filteredProxies.slice(startIndex, endIndex);

  const response = {
    success: true,
    data: paginatedProxies,
    meta: {
      total,
      page,
      pageSize: limit,
      hasMore: endIndex < total,
    }
  };

  return NextResponse.json(response);
};

// POST /api/streaming-proxies - Create new proxy
const createProxy = async (req: NextRequest) => {
  const { data: body, error: validationError } = await parseRequestBody(req, CreateProxySchema);
  
  if (validationError) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Validation error',
        details: validationError
      },
      { status: 400 }
    );
  }
  
  // Type assertion for the parsed body
  const proxyData = body as z.infer<typeof CreateProxySchema>;
  
  // Check if proxy with the same RTMP URL already exists
  const existingProxy = mockProxies.find(
    p => p.rtmpUrl === proxyData.rtmpUrl && p.rtmpKey === proxyData.rtmpKey
  );
  
  if (existingProxy) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'A proxy with this RTMP URL and key already exists',
        existingProxyId: existingProxy.id
      },
      { status: 409 }
    );
  }
  
  // Create new proxy
  const newProxy: StreamingProxy = {
    id: (mockProxies.length + 1).toString(),
    name: proxyData.name,
    description: proxyData.description,
    rtmpUrl: proxyData.rtmpUrl,
    rtmpKey: proxyData.rtmpKey,
    serverLocation: proxyData.serverLocation,
    maxConcurrentStreams: proxyData.maxConcurrentStreams,
    bandwidthLimit: proxyData.bandwidthLimit,
    churchBranchId: proxyData.churchBranchId,
    currentActiveStreams: 0,
    status: ProxyStatus.ACTIVE,
    healthStatus: HealthStatus.HEALTHY,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastHealthCheck: new Date(),
  };
  
  mockProxies.push(newProxy);
  
  return NextResponse.json(
    { 
      success: true, 
      data: newProxy,
      message: 'Streaming proxy created successfully'
    },
    { status: 201 }
  );
};

// Export the handlers directly
export async function GET(req: NextRequest) {
  try {
    return await getProxies(req);
  } catch (error) {
    console.error('Error in GET /api/streaming-proxies:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await createProxy(req);
  } catch (error) {
    console.error('Error in POST /api/streaming-proxies:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}