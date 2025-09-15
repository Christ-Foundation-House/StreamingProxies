import { NextRequest, NextResponse } from 'next/server';

// Mock data for development - in production this would come from database
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    permissions: ['manage_users', 'manage_settings', 'view_analytics', 'manage_proxies'],
    status: 'active' as const,
    lastLogin: new Date('2024-01-15T10:30:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: '2',
    email: 'operator@example.com',
    name: 'Operator User',
    role: 'operator',
    permissions: ['view_analytics', 'manage_proxies'],
    status: 'active' as const,
    lastLogin: new Date('2024-01-14T15:45:00Z'),
    createdAt: new Date('2024-01-05T00:00:00Z'),
  },
  {
    id: '3',
    email: 'viewer@example.com',
    name: 'Viewer User',
    role: 'viewer',
    permissions: ['view_analytics'],
    status: 'inactive' as const,
    lastLogin: new Date('2024-01-10T09:15:00Z'),
    createdAt: new Date('2024-01-08T00:00:00Z'),
  },
];

export async function GET(request: NextRequest) {
  try {
    // In production, this would query the database:
    // const users = await db.user.findMany({
    //   include: {
    //     role: {
    //       include: {
    //         permissions: true
    //       }
    //     }
    //   }
    // });

    return NextResponse.json({
      success: true,
      data: mockUsers
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}