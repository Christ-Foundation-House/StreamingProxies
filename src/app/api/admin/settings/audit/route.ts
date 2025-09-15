import { NextRequest, NextResponse } from 'next/server';

// Mock audit data - in production this would come from database
const mockSettingsAudit = [
  {
    id: '1',
    settingKey: 'performance.max_concurrent_streams',
    oldValue: 50,
    newValue: 100,
    changedBy: 'admin@example.com',
    changedAt: new Date('2024-01-15T10:30:00Z'),
    reason: 'Increased capacity for peak hours'
  },
  {
    id: '2',
    settingKey: 'security.session_timeout',
    oldValue: 7200,
    newValue: 3600,
    changedBy: 'admin@example.com',
    changedAt: new Date('2024-01-14T15:45:00Z'),
    reason: 'Enhanced security policy'
  },
  {
    id: '3',
    settingKey: 'monitoring.log_level',
    oldValue: 'debug',
    newValue: 'info',
    changedBy: 'operator@example.com',
    changedAt: new Date('2024-01-13T09:15:00Z'),
    reason: 'Reduced log verbosity for production'
  },
  {
    id: '4',
    settingKey: 'system.maintenance_mode',
    oldValue: true,
    newValue: false,
    changedBy: 'admin@example.com',
    changedAt: new Date('2024-01-12T08:00:00Z'),
    reason: 'Maintenance completed'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const settingKey = searchParams.get('settingKey');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let auditEntries = mockSettingsAudit;

    // Filter by setting key if specified
    if (settingKey) {
      auditEntries = auditEntries.filter(entry => entry.settingKey === settingKey);
    }

    // Sort by most recent first
    auditEntries.sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());

    // Apply pagination
    const paginatedEntries = auditEntries.slice(offset, offset + limit);
    const total = auditEntries.length;

    return NextResponse.json({
      success: true,
      data: {
        entries: paginatedEntries,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch settings audit:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings audit' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settingKey, oldValue, newValue, changedBy, reason } = body;

    if (!settingKey || !changedBy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Setting key and changed by are required' 
        },
        { status: 400 }
      );
    }

    const auditEntry = {
      id: Date.now().toString(),
      settingKey,
      oldValue,
      newValue,
      changedBy,
      changedAt: new Date(),
      reason: reason || 'No reason provided'
    };

    // In production, this would save to database:
    // await db.settingsAudit.create({
    //   data: auditEntry
    // });

    // Add to mock data
    mockSettingsAudit.unshift(auditEntry);

    return NextResponse.json({
      success: true,
      data: auditEntry
    });
  } catch (error) {
    console.error('Failed to create audit entry:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create audit entry' 
      },
      { status: 500 }
    );
  }
}