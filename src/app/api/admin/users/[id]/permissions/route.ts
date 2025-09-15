import { NextRequest, NextResponse } from 'next/server';

interface UpdatePermissionsRequest {
  permissions: string[];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { permissions }: UpdatePermissionsRequest = await request.json();
    const { id: userId } = await params;

    // Validate permissions array
    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Permissions must be an array' 
        },
        { status: 400 }
      );
    }

    // Validate that all permissions are valid
    const validPermissions = [
      'manage_users',
      'manage_settings', 
      'view_analytics',
      'manage_proxies',
      'create_proxies',
      'delete_proxies'
    ];

    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid permissions: ${invalidPermissions.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // In production, this would update the database:
    // const updatedUser = await db.user.update({
    //   where: { id: userId },
    //   data: {
    //     permissions: {
    //       set: permissions.map(p => ({ permission: p }))
    //     }
    //   },
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
      permissions,
      status: 'active' as const,
      lastLogin: new Date(),
      createdAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Failed to update user permissions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user permissions' 
      },
      { status: 500 }
    );
  }
}