import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError } from '@/lib/error-handler';
import { StreamingProxy } from '@/lib/streaming-proxies/types';

// Define schemas
const TimeRangeSchema = z.enum(['1h', '24h', '7d', '30d']);
type TimeRange = z.infer<typeof TimeRangeSchema>;

const BandwidthQueryParams = z.object({
  range: TimeRangeSchema.default('24h')
});

// Mock data for demonstration
const generateMockBandwidthData = (timeRange: TimeRange) => {
  const now = Date.now();
  let points = 24; // Default to 24 points (1 per hour)
  let interval = 3600000; // 1 hour in ms
  
  if (timeRange === '1h') {
    points = 12; // 5-minute intervals for 1 hour
    interval = 300000; // 5 minutes in ms
  } else if (timeRange === '7d') {
    points = 28; // 6-hour intervals for 7 days
    interval = 6 * 3600000; // 6 hours in ms
  } else if (timeRange === '30d') {
    points = 30; // 1 day intervals for 30 days
    interval = 24 * 3600000; // 24 hours in ms
  }

  // Generate mock data points with realistic patterns
  return Array.from({ length: points }, (_, i) => {
    const timestamp = now - (interval * (points - i - 1));
    const timeOfDay = new Date(timestamp).getHours();
    const dayOfWeek = new Date(timestamp).getDay();
    
    // Base value with some randomness
    let baseValue = Math.random() * 500000000; // Up to 500MB
    
    // Add time-of-day pattern (higher during business hours)
    const timeFactor = 0.5 + 0.5 * Math.sin((timeOfDay / 24) * Math.PI * 2 - Math.PI/2);
    
    // Add day-of-week pattern (higher on weekdays)
    const dayFactor = dayOfWeek >= 1 && dayOfWeek <= 5 ? 1.5 : 0.8;
    
    // Add some noise
    const noise = 0.8 + Math.random() * 0.4;
    
    // Calculate final value
    const bytesTransferred = Math.floor(baseValue * timeFactor * dayFactor * noise);
    
    return {
      timestamp,
      bytesTransferred,
    };
  });
};

// Define the params type for the route
interface BandwidthRouteParams {
  id: string;
  [key: string]: string | string[];
}

// Handler function for GET requests
const getBandwidthData = async (
  req: NextRequest, 
  { params, user }: { params: BandwidthRouteParams, user: any }
) => {
  // Validate the proxy ID
  const proxyId = z.string().uuid().safeParse(params.id);
  if (!proxyId.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid proxy ID format',
        details: proxyId.error.format()
      },
      { status: 400 }
    );
  }

  // Validate query parameters
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const queryResult = BandwidthQueryParams.safeParse(searchParams);
  
  if (!queryResult.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid query parameters',
        details: queryResult.error.format(),
        validRanges: ['1h', '24h', '7d', '30d']
      },
      { status: 400 }
    );
  }
  
  // In a real app, you would fetch this data from your database
  // For now, we'll use mock data
  const data = generateMockBandwidthData(queryResult.data.range);
  
  return NextResponse.json({
    success: true,
    data: {
      ...data,
      // Add metadata
      proxyId: params.id,
      requestedBy: user?.id || 'system',
      timestamp: new Date().toISOString(),
    },
  });
};

// Create the API handler with authentication and rate limiting
const handler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const user = { id: 'system' }; // Replace with actual user from auth
    const typedParams = resolvedParams as BandwidthRouteParams;
    
    if (req.method === 'GET') {
      return await getBandwidthData(req, { params: typedParams, user });
    }
    
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed' 
      }), 
      { status: 405 }
    );
  } catch (error) {
    const errorWithMessage = handleApiError(error, {
      context: { 
        endpoint: `/api/streaming-proxies/[id]/bandwidth [${req.method}]`,
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
