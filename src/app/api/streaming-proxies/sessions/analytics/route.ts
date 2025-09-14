import { NextRequest, NextResponse } from 'next/server';

// Mock analytics data
const mockAnalytics = {
  totalSessions: 45,
  totalViewers: 1250,
  totalDataTransferred: 125000000000, // 125GB
  averageSessionDuration: 3600000, // 1 hour in ms
  peakConcurrentViewers: 85,
  sessionsOverTime: [
    { date: '2024-01-01', sessions: 5, viewers: 120 },
    { date: '2024-01-02', sessions: 8, viewers: 180 },
    { date: '2024-01-03', sessions: 6, viewers: 150 },
    { date: '2024-01-04', sessions: 12, viewers: 220 },
    { date: '2024-01-05', sessions: 14, viewers: 280 },
  ],
  topProxies: [
    { proxyId: '1', proxyName: 'Main Campus RTMP', sessions: 20, viewers: 600 },
    { proxyId: '3', proxyName: 'Online Campus RTMP', sessions: 15, viewers: 450 },
    { proxyId: '2', proxyName: 'Youth Campus RTMP', sessions: 10, viewers: 200 },
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const churchBranchId = searchParams.get('churchBranchId');

    // In a real implementation, you would filter data based on timeRange and churchBranchId
    let analytics = { ...mockAnalytics };

    // Simulate filtering by time range
    if (timeRange === '7d') {
      analytics.totalSessions = Math.floor(analytics.totalSessions * 0.25);
      analytics.totalViewers = Math.floor(analytics.totalViewers * 0.25);
      analytics.sessionsOverTime = analytics.sessionsOverTime.slice(-7);
    } else if (timeRange === '24h') {
      analytics.totalSessions = Math.floor(analytics.totalSessions * 0.1);
      analytics.totalViewers = Math.floor(analytics.totalViewers * 0.1);
      analytics.sessionsOverTime = analytics.sessionsOverTime.slice(-1);
    }

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}