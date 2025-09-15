import { NextRequest, NextResponse } from 'next/server';

export interface UsageStatistics {
  streams: {
    byRegion: Array<{ region: string; count: number; percentage: number }>;
    byTimeOfDay: Array<{ hour: number; count: number }>;
    byDayOfWeek: Array<{ day: string; count: number }>;
    byDuration: Array<{ range: string; count: number; percentage: number }>;
  };
  viewers: {
    byRegion: Array<{ region: string; count: number; percentage: number }>;
    byDevice: Array<{ device: string; count: number; percentage: number }>;
    byBrowser: Array<{ browser: string; count: number; percentage: number }>;
    concurrent: Array<{ timestamp: string; count: number }>;
  };
  proxies: {
    utilization: Array<{ proxyId: string; name: string; utilization: number; streams: number }>;
    performance: Array<{ proxyId: string; name: string; responseTime: number; errorRate: number; uptime: number }>;
    bandwidth: Array<{ proxyId: string; name: string; inbound: number; outbound: number }>;
  };
  content: {
    topStreams: Array<{ id: string; title: string; views: number; duration: number; engagement: number }>;
    categories: Array<{ category: string; count: number; percentage: number }>;
    quality: Array<{ resolution: string; count: number; percentage: number }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const category = searchParams.get('category'); // streams, viewers, proxies, content
    const region = searchParams.get('region');

    // In production, these would come from your database
    // This is enhanced mock data for usage statistics
    
    const regions = ['US-East-1', 'EU-West-1', 'Asia-Pacific-1', 'US-West-2', 'EU-Central-1'];
    const devices = ['Desktop', 'Mobile', 'Tablet', 'Smart TV', 'Gaming Console'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'];
    const categories = ['Worship', 'Teaching', 'Youth', 'Music', 'Prayer', 'Community'];
    const resolutions = ['1080p', '720p', '480p', '360p', '4K'];

    const generateUsageStats = (): UsageStatistics => {
      return {
        streams: {
          byRegion: regions.map(region => ({
            region,
            count: Math.floor(Math.random() * 200) + 50,
            percentage: Math.floor(Math.random() * 30) + 10
          })),
          byTimeOfDay: Array.from({ length: 24 }, (_, hour) => ({
            hour,
            count: Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 21 ? 20 : 5)
          })),
          byDayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
            day,
            count: Math.floor(Math.random() * 100) + (day === 'Sunday' ? 100 : 20)
          })),
          byDuration: [
            { range: '0-30 min', count: 234, percentage: 18.9 },
            { range: '30-60 min', count: 456, percentage: 36.9 },
            { range: '1-2 hours', count: 345, percentage: 27.9 },
            { range: '2+ hours', count: 199, percentage: 16.1 }
          ]
        },
        viewers: {
          byRegion: regions.map(region => ({
            region,
            count: Math.floor(Math.random() * 5000) + 1000,
            percentage: Math.floor(Math.random() * 25) + 15
          })),
          byDevice: devices.map(device => ({
            device,
            count: Math.floor(Math.random() * 3000) + 500,
            percentage: Math.floor(Math.random() * 25) + 10
          })),
          byBrowser: browsers.map(browser => ({
            browser,
            count: Math.floor(Math.random() * 2000) + 300,
            percentage: Math.floor(Math.random() * 30) + 10
          })),
          concurrent: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
            count: Math.floor(Math.random() * 500) + 100
          }))
        },
        proxies: {
          utilization: regions.map((region, index) => ({
            proxyId: `proxy-${index + 1}`,
            name: region,
            utilization: Math.floor(Math.random() * 40) + 60,
            streams: Math.floor(Math.random() * 50) + 20
          })),
          performance: regions.map((region, index) => ({
            proxyId: `proxy-${index + 1}`,
            name: region,
            responseTime: Math.floor(Math.random() * 50) + 20,
            errorRate: Math.random() * 0.05,
            uptime: 99.5 + Math.random() * 0.4
          })),
          bandwidth: regions.map((region, index) => ({
            proxyId: `proxy-${index + 1}`,
            name: region,
            inbound: Math.floor(Math.random() * 100) + 50,
            outbound: Math.floor(Math.random() * 500) + 200
          }))
        },
        content: {
          topStreams: Array.from({ length: 10 }, (_, i) => ({
            id: `stream-${i + 1}`,
            title: `Stream ${i + 1}`,
            views: Math.floor(Math.random() * 5000) + 1000,
            duration: Math.floor(Math.random() * 180) + 30,
            engagement: Math.floor(Math.random() * 40) + 60
          })),
          categories: categories.map(category => ({
            category,
            count: Math.floor(Math.random() * 200) + 50,
            percentage: Math.floor(Math.random() * 25) + 10
          })),
          quality: resolutions.map(resolution => ({
            resolution,
            count: Math.floor(Math.random() * 300) + 100,
            percentage: Math.floor(Math.random() * 30) + 15
          }))
        }
      };
    };

    const usageStats = generateUsageStats();

    // Filter by category if specified
    let filteredData = usageStats;
    if (category) {
      filteredData = {
        streams: category === 'streams' ? usageStats.streams : { byRegion: [], byTimeOfDay: [], byDayOfWeek: [], byDuration: [] },
        viewers: category === 'viewers' ? usageStats.viewers : { byRegion: [], byDevice: [], byBrowser: [], concurrent: [] },
        proxies: category === 'proxies' ? usageStats.proxies : { utilization: [], performance: [], bandwidth: [] },
        content: category === 'content' ? usageStats.content : { topStreams: [], categories: [], quality: [] }
      };
    }

    // Example of how you might fetch from database:
    /*
    const streamsByRegion = await db.streamingSession.groupBy({
      by: ['region'],
      where: {
        createdAt: {
          gte: getDateFromTimeRange(timeRange)
        },
        ...(region && { region })
      },
      _count: {
        id: true
      }
    });

    const viewersByDevice = await db.viewerSession.groupBy({
      by: ['deviceType'],
      where: {
        createdAt: {
          gte: getDateFromTimeRange(timeRange)
        }
      },
      _count: {
        id: true
      }
    });
    */

    return NextResponse.json({
      success: true,
      data: filteredData,
      metadata: {
        timeRange,
        category,
        region,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch usage statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch usage statistics' 
      },
      { status: 500 }
    );
  }
}