import { NextRequest, NextResponse } from 'next/server';

// Mock roles data for development - in production this would come from database
const mockRoles = [
  {
    id: '1',
    name: 'admin',
    description: 'Full system administrator with all permissions',
    permissions: ['manage_users', 'manage_settings', 'view_analytics', 'manage_proxies', 'create_proxies', 'delete_proxies']
  },
  {
    id: '2',
    name: 'operator',
    description: 'System operator with proxy management and analytics access',
    permissions: ['view_analytics', 'manage_proxies', 'create_proxies']
  },
  {
    id: '3',
    name: 'viewer',
    description: 'Read-only access to analytics and system information',
    permissions: ['view_analytics']
  }
];

export async function GET(request: NextRequest) {
  try {
    // In production, this would query the database:
    // const roles = await db.role.findMany({
    //   include: {
    //     permissions: true
    //   }
    // });

    return NextResponse.json({
      success: true,
      data: mockRoles
    });
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch roles' 
      },
      { status: 500 }
    );
  }
}