import { NextRequest, NextResponse } from 'next/server';

interface UpdateStatusRequest {
  status: 'active' | 'inactive' | 'suspended';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status }: UpdateStatusRequest = await request.json();
    const { id: userId } = await params;

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // In production, this would update the database:
    // const updatedUser = await db.user.update({
    //   where: { id: userId },
    //   data: { status },
    //   include: {
    //     role: {
    //       include: {
    //         permissions: true
    //       }
    //     }
    //   }
    // });

    // Mock response for development
    const updatedUser = {
      id: userId,
      email: 'user@example.com',
      name: 'Updated User',
      role: 'operator',
      permissions: ['view_analytics'],
      status,
      lastLogin: new Date(),
      createdAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Failed to update user status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user status' 
      },
      { status: 500 }
    );
  }
}