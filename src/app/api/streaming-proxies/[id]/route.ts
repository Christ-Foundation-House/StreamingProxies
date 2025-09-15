import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UpdateProxySchema } from '@/lib/streaming-proxies/utils/validation';
import { type StreamingProxy, type ApiResponse, ProxyStatus, HealthStatus } from '@/lib/streaming-proxies/types';
import { parseRequestBody } from '@/lib/api-utils';
import { handleApiError } from '@/lib/error-handler';

// Extend the StreamingProxy type to include our custom fields
type ExtendedStreamingProxy = StreamingProxy & {
  updatedBy?: string;
};

// Mock database - replace with actual database implementation
let mockProxies: ExtendedStreamingProxy[] = [
  // This would be imported from a shared mock data file in a real implementation
];

// GET /api/streaming-proxies/[id] - Get specific proxy details
const getProxy = async (
  req: NextRequest, 
  { params, user }: { params: { id: string }, user: any }
) => {
  const { id } = params;

  const proxy = mockProxies.find(p => p.id === id);
  if (!proxy) {
    return NextResponse.json({
      success: false,
      error: 'Streaming proxy not found',
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: proxy,
    requestedBy: user?.id || 'system',
    timestamp: new Date().toISOString(),
  });
};

// PUT /api/streaming-proxies/[id] - Update proxy
const updateProxy = async (
  req: NextRequest, 
  { params, user }: { params: { id: string }, user: any }
) => {
  const { id } = params;
  
  const { data: body, error: validationError } = await parseRequestBody(req, UpdateProxySchema);
  
  if (validationError) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: validationError,
    }, { status: 400 });
  }
  
  // Type assertion for the parsed body
  const updateData = body as z.infer<typeof UpdateProxySchema>;

  const proxy = mockProxies.find(p => p.id === id);
  if (!proxy) {
    return NextResponse.json({
      success: false,
      error: 'Streaming proxy not found',
    }, { status: 404 });
  }

  // Check for duplicate names if name is being updated
  if (updateData.name !== undefined && updateData.name !== proxy.name) {
    const existingProxy = mockProxies.find(p => 
      p.id !== id &&
      p.name.toLowerCase() === updateData.name?.toLowerCase() &&
      p.churchBranchId === proxy.churchBranchId
    );

    if (existingProxy) {
      return NextResponse.json({
        success: false,
        error: 'A proxy with this name already exists in this church branch',
      }, { status: 409 });
    }
  }

  // Update proxy with explicit fields
  const updatedProxy: ExtendedStreamingProxy = {
    ...proxy,
    name: updateData.name !== undefined ? updateData.name : proxy.name,
    description: updateData.description !== undefined ? updateData.description : proxy.description,
    rtmpUrl: updateData.rtmpUrl !== undefined ? updateData.rtmpUrl : proxy.rtmpUrl,
    rtmpKey: updateData.rtmpKey !== undefined ? updateData.rtmpKey : proxy.rtmpKey,
    serverLocation: updateData.serverLocation !== undefined 
      ? updateData.serverLocation 
      : proxy.serverLocation,
    maxConcurrentStreams: updateData.maxConcurrentStreams !== undefined 
      ? updateData.maxConcurrentStreams 
      : proxy.maxConcurrentStreams,
    bandwidthLimit: updateData.bandwidthLimit !== undefined 
      ? updateData.bandwidthLimit 
      : proxy.bandwidthLimit,
    churchBranchId: updateData.churchBranchId !== undefined 
      ? updateData.churchBranchId 
      : proxy.churchBranchId,
    status: updateData.status !== undefined ? updateData.status : proxy.status,
    updatedAt: new Date(),
    updatedBy: user?.id || 'system',
  };

  const proxyIndex = mockProxies.findIndex(p => p.id === id);
  mockProxies[proxyIndex] = updatedProxy;

  return NextResponse.json({
    success: true,
    data: updatedProxy,
    message: 'Streaming proxy updated successfully',
  });
};

// DELETE /api/streaming-proxies/[id] - Delete proxy
const deleteProxy = async (
  req: NextRequest, 
  { params, user }: { params: { id: string }, user: any }
) => {
  const { id } = params;

  const proxyIndex = mockProxies.findIndex(p => p.id === id);
  if (proxyIndex === -1) {
    return NextResponse.json({
      success: false,
      error: 'Streaming proxy not found',
    }, { status: 404 });
  }

  // Check if proxy is in use
  const proxy = mockProxies[proxyIndex];
  if (proxy.currentActiveStreams > 0) {
    return NextResponse.json({
      success: false,
      error: 'Cannot delete proxy with active streams',
    }, { status: 400 });
  }

  // Soft delete by updating status
  mockProxies[proxyIndex] = {
    ...proxy,
    status: ProxyStatus.INACTIVE,
    updatedAt: new Date(),
    updatedBy: user?.id || 'system',
  };

  return NextResponse.json({
    success: true,
    message: 'Streaming proxy marked as inactive',
  });
};

// Define params type for the route handler
interface RouteParams {
  id: string;
  [key: string]: string | string[];
}

// Create the API handler with authentication and rate limiting
const handler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const user = { id: 'system' }; // Replace with actual user from auth
    
    switch (req.method) {
      case 'GET':
        return await getProxy(req, { params: resolvedParams, user });
      case 'PUT':
        return await updateProxy(req, { params: resolvedParams, user });
      case 'DELETE':
        return await deleteProxy(req, { params: resolvedParams, user });
      default:
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: 'Method not allowed' 
          }), 
          { status: 405 }
        );
    }
  } catch (error) {
    const errorWithMessage = handleApiError(error, {
      context: { 
        endpoint: `/api/streaming-proxies/[id] [${req.method}]`,
        method: req.method
      }
    });
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: errorWithMessage.message,
        ...(process.env.NODE_ENV === 'development' && {
          details: errorWithMessage.details
        })
      }),
      { status: errorWithMessage.status || 500 }
    );
  }
};

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };