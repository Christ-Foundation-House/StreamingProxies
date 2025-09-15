import { NextRequest, NextResponse } from 'next/server';

// Mock permissions data for development - in production this would come from database
const mockPermissions = [
  {
    id: '1',
    name: 'manage_users',
    description: 'Create, update, and delete user accounts and permissions',
    category: 'User Management'
  },
  {
    id: '2',
    name: 'manage_settings',
    description: 'Modify system settings and configuration',
    category: 'System Administration'
  },
  {
    id: '3',
    name: 'view_analytics',
    description: 'View system analytics and performance metrics',
    category: 'Analytics'
  },
  {
    id: '4',
    name: 'manage_proxies',
    description: 'Manage existing streaming proxy configurations',
    category: 'Proxy Management'
  },
  {
    id: '5',
    name: 'create_proxies',
    description: 'Create new streaming proxy instances',
    category: 'Proxy Management'
  },
  {
    id: '6',
    name: 'delete_proxies',
    description: 'Delete streaming proxy instances',
    category: 'Proxy Management'
  }
];

export async function GET(request: NextRequest) {
  try {
    // In production, this would query the database:
    // const permissions = await db.permission.findMany({
    //   orderBy: [
    //     { category: 'asc' },
    //     { name: 'asc' }
    //   ]
    // });

    return NextResponse.json({
      success: true,
      data: mockPermissions
    });
  } catch (error) {
    console.error('Failed to fetch permissions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch permissions' 
      },
      { status: 500 }
    );
  }
}