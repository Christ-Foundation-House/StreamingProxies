import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler, parseRequestBody } from '@/lib/api-utils';

// Define request schema using Zod
const createExampleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  count: z.number().int().positive().optional().default(1),
});

// Example GET handler
const getHandler = async (req: NextRequest, { user }: { user: any }) => {
  // User is already authenticated and rate limited at this point
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('query');
  
  // Your business logic here
  const data = {
    message: 'This is a protected endpoint',
    query,
    userId: user?.id,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json({ success: true, data });
};

// Example POST handler
const postHandler = async (req: NextRequest, { user }: { user: any }) => {
  // Parse and validate request body
  const { data: requestData, error } = await parseRequestBody(req, createExampleSchema);
  
  if (error) {
    return NextResponse.json({ success: false, error }, { status: 400 });
  }
  
  // Your business logic here
  const result = {
    ...requestData,
    userId: user.id,
    createdAt: new Date().toISOString(),
  };
  
  return NextResponse.json({ success: true, data: result }, { status: 201 });
};

// Export the handler with authentication and rate limiting
const handler = createApiHandler(
  async (req, context) => {
    switch (req.method) {
      case 'GET':
        return getHandler(req, context);
      case 'POST':
        return postHandler(req, context);
      default:
        return new Response(null, { status: 405 });
    }
  },
  {
    requireAuth: true,
    rateLimit: {
      limit: 100, // 100 requests per minute per IP
      key: 'example-api', // Shared rate limit key for all requests to this endpoint
    },
  }
);

export { handler as GET, handler as POST };
