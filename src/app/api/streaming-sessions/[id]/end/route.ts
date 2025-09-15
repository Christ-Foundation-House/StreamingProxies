import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session ID is required' 
        },
        { status: 400 }
      );
    }

    // In production, this would update the session in your database
    // and stop the actual streaming process
    
    // Example of what the database update might look like:
    // const session = await db.streamingSession.update({
    //   where: { id: sessionId },
    //   data: {
    //     status: 'ENDED',
    //     endedAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    // });

    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, error: 'Session not found' },
    //     { status: 404 }
    //   );
    // }

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: `Session ${sessionId} ended successfully`
    });
  } catch (error) {
    console.error('Failed to end streaming session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to end streaming session' 
      },
      { status: 500 }
    );
  }
}