import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function authenticateRequest(req: NextRequest) {
  // Get the token from the request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Check if token has expired
  if (token.exp && typeof token.exp === 'number' && Date.now() >= token.exp * 1000) {
    return NextResponse.json(
      { success: false, error: 'Session expired. Please log in again.' },
      { status: 401 }
    );
  }
  
  // Return the authenticated user
  return { user: token };
}

export function withAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authResult = await authenticateRequest(req);
    
    // If authResult is a response, return it (error response)
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Otherwise, proceed with the handler
    return handler(req, authResult.user);
  };
}
