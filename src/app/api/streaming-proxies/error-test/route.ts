import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/error-handler';

export async function GET() {
  try {
    // Simulate an error
    throw new Error('This is a test error for error handling');
    
    // This code will never be reached
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorWithMessage = handleApiError(error, {
      context: { 
        endpoint: '/api/streaming-proxies/error-test',
        method: 'GET'
      }
    });
    
    return NextResponse.json(
      {
        success: false,
        error: errorWithMessage.message,
        ...(process.env.NODE_ENV === 'development' && {
          details: errorWithMessage.details
        })
      },
      { status: errorWithMessage.status || 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
