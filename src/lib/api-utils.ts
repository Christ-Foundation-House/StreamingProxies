import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from './auth';
import { defaultRateLimiter } from './rate-limit';

export type ApiHandler = (
  req: NextRequest,
  context: {
    params: Record<string, string>;
    user: any;
  }
) => Promise<NextResponse | Response>;

export function createApiHandler(handler: ApiHandler, options?: {
  requireAuth?: boolean;
  rateLimit?: {
    limit: number;
    key?: string;
  };
}) {
  const { requireAuth = true, rateLimit } = options || {};
  
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    // Apply rate limiting if configured
    if (rateLimit) {
      const ip = req.headers.get('x-real-ip') || 
                req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                'anonymous';
      const rateLimitKey = rateLimit.key ? `${ip}:${rateLimit.key}` : ip;
      
      try {
        await defaultRateLimiter.check(req, rateLimit.limit, rateLimitKey);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    }

    // Apply authentication if required
    if (requireAuth) {
      const authResult = await withAuth(async (req, user) => {
        try {
          const result = await handler(req, { ...context, user });
          // Ensure the result is a NextResponse
          return result instanceof NextResponse 
            ? result 
            : NextResponse.json(result);
        } catch (error) {
          console.error('API Error:', error);
          return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
          );
        }
      })(req);
      
      return authResult;
    }

    // No authentication required, just call the handler
    try {
      return await handler(req, { ...context, user: null });
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Helper function to parse and validate request body
export async function parseRequestBody<T>(req: NextRequest, schema?: any): Promise<{ data: T | null; error: string | null }> {
  try {
    const body = await req.json();
    
    if (schema) {
      const result = schema.safeParse(body);
      if (!result.success) {
        return { 
          data: null, 
          error: result.error.errors.map((e: any) => e.message).join(', ') 
        };
      }
      return { data: result.data, error: null };
    }
    
    return { data: body, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: 'Invalid request body' 
    };
  }
}

// Helper function to create standardized API responses
export function createApiResponse(
  data: any = null, 
  options: { 
    status?: number; 
    headers?: Record<string, string>;
  } = {}
) {
  const { status = 200, headers = {} } = options;
  const response = { success: status < 400, data };
  
  return new NextResponse(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// Helper function to create error responses
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: any
) {
  return createApiResponse(
    { 
      error: message,
      ...(details && { details })
    },
    { status }
  );
}
