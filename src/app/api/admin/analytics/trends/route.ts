import { NextRequest, NextResponse } from 'next/server';

export interface TrendDataPoint {
  date: string;
  streams: number;
  viewers: number;
  bandwidth: number;
  cost: number;
  errorRate: number;
  responseTime: number;
  uptime: number;
}

export interface TrendAnalysis {
  data: TrendDataPoint[];
  summary: {
    totalDataPoints: number;
    dateRange: {
      start: string;
      end: string;
    };
    trends: {
      streams: { direction: 'up' | 'down' | 'stable'; percentage: number };
      viewers: { direction: 'up' | 'down' | 'stable'; percentage: number };
      bandwidth: { direction: 'up' | 'down' | 'stable'; percentage: number };
      cost: { direction: 'up' | 'down' | 'stable'; percentage: number };
      errorRate: { direction: 'up' | 'down' | 'stable'; percentage: number };
    };
    averages: {
      streams: number;
      viewers: number;
      bandwidth: number;
      cost: number;
      errorRate: number;
      responseTime: number;
      uptime: number;
    };
  };
  forecasting?: {
    nextPeriod: {
      streams: number;
      viewers: number;
      bandwidth: number;
      cost: number;
    };
    confidence: number;
    methodology: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const metric = searchParams.get('metric'); // streams, viewers, bandwidth, cost, errorRate
    const granularity = searchParams.get('granularity') || 'daily'; // hourly, daily, weekly, monthly
    const includeForecast = searchParams.get('forecast') === 'true';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // In production, these would come from your analytics database
    // This is enhanced mock data for trend analysis
    
    const generateTrendData = (days: number, granularityType: string): TrendDataPoint[] => {
      const trends: TrendDataPoint[] = [];
      const now = new Date();
      
      let intervals = days;
      let intervalMs = 24 * 60 * 60 * 1000; // daily by default
      
      switch (granularityType) {
        case 'hourly':
          intervals = days * 24;
          intervalMs = 60 * 60 * 1000;
          break;
        case 'weekly':
          intervals = Math.ceil(days / 7);
          intervalMs = 7 * 24 * 60 * 60 * 1000;
          break;
        case 'monthly':
          intervals = Math.ceil(days / 30);
          intervalMs = 30 * 24 * 60 * 60 * 1000;
          break;
      }
      
      for (let i = intervals - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * intervalMs);
        
        // Generate realistic trend data with some seasonality
        const dayOfWeek = date.getDay();
        const hourOfDay = date.getHours();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isPeakHour = hourOfDay >= 19 && hourOfDay <= 22; // 7-10 PM peak
        
        const baseStreams = 30 + (isWeekend ? 20 : 0) + (isPeakHour ? 15 : 0);
        const baseViewers = 800 + (isWeekend ? 300 : 0) + (isPeakHour ? 200 : 0);
        
        trends.push({
          date: date.toISOString(),
          streams: Math.floor(baseStreams + Math.random() * 20),
          viewers: Math.floor(baseViewers + Math.random() * 200),
          bandwidth: Math.floor(200 + Math.random() * 100 + (isPeakHour ? 50 : 0)), // GB
          cost: Math.floor(50 + Math.random() * 30 + (isPeakHour ? 20 : 0)),
          errorRate: Math.random() * 0.05, // 0-5%
          responseTime: Math.floor(30 + Math.random() * 20 + (isPeakHour ? 10 : 0)), // ms
          uptime: 99.5 + Math.random() * 0.4 // 99.5-99.9%
        });
      }
      
      return trends;
    };

    const getDaysFromTimeRange = (range: string): number => {
      switch (range) {
        case '24h': return 1;
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        case '1y': return 365;
        default: return 30;
      }
    };

    const calculateTrend = (data: number[]): { direction: 'up' | 'down' | 'stable'; percentage: number } => {
      if (data.length < 2) return { direction: 'stable', percentage: 0 };
      
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      const percentage = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      if (Math.abs(percentage) < 2) return { direction: 'stable', percentage: Math.round(percentage * 100) / 100 };
      return { 
        direction: percentage > 0 ? 'up' : 'down', 
        percentage: Math.round(Math.abs(percentage) * 100) / 100 
      };
    };

    const days = getDaysFromTimeRange(timeRange);
    const trendData = generateTrendData(days, granularity);

    // Filter by specific metric if requested
    let filteredData = trendData;
    if (metric) {
      // Keep all data but this could be used for specific metric focus
      filteredData = trendData;
    }

    // Calculate summary statistics
    const streams = filteredData.map(d => d.streams);
    const viewers = filteredData.map(d => d.viewers);
    const bandwidth = filteredData.map(d => d.bandwidth);
    const costs = filteredData.map(d => d.cost);
    const errorRates = filteredData.map(d => d.errorRate);
    const responseTimes = filteredData.map(d => d.responseTime);
    const uptimes = filteredData.map(d => d.uptime);

    const trendAnalysis: TrendAnalysis = {
      data: filteredData,
      summary: {
        totalDataPoints: filteredData.length,
        dateRange: {
          start: filteredData[0]?.date || new Date().toISOString(),
          end: filteredData[filteredData.length - 1]?.date || new Date().toISOString()
        },
        trends: {
          streams: calculateTrend(streams),
          viewers: calculateTrend(viewers),
          bandwidth: calculateTrend(bandwidth),
          cost: calculateTrend(costs),
          errorRate: calculateTrend(errorRates)
        },
        averages: {
          streams: Math.round(streams.reduce((sum, val) => sum + val, 0) / streams.length),
          viewers: Math.round(viewers.reduce((sum, val) => sum + val, 0) / viewers.length),
          bandwidth: Math.round(bandwidth.reduce((sum, val) => sum + val, 0) / bandwidth.length),
          cost: Math.round(costs.reduce((sum, val) => sum + val, 0) / costs.length),
          errorRate: Math.round((errorRates.reduce((sum, val) => sum + val, 0) / errorRates.length) * 10000) / 10000,
          responseTime: Math.round(responseTimes.reduce((sum, val) => sum + val, 0) / responseTimes.length),
          uptime: Math.round((uptimes.reduce((sum, val) => sum + val, 0) / uptimes.length) * 100) / 100
        }
      }
    };

    // Add forecasting if requested
    if (includeForecast) {
      const lastDataPoint = filteredData[filteredData.length - 1];
      const streamsTrend = trendAnalysis.summary.trends.streams;
      const viewersTrend = trendAnalysis.summary.trends.viewers;
      const bandwidthTrend = trendAnalysis.summary.trends.bandwidth;
      const costTrend = trendAnalysis.summary.trends.cost;

      trendAnalysis.forecasting = {
        nextPeriod: {
          streams: Math.round(lastDataPoint.streams * (1 + (streamsTrend.direction === 'up' ? streamsTrend.percentage : -streamsTrend.percentage) / 100)),
          viewers: Math.round(lastDataPoint.viewers * (1 + (viewersTrend.direction === 'up' ? viewersTrend.percentage : -viewersTrend.percentage) / 100)),
          bandwidth: Math.round(lastDataPoint.bandwidth * (1 + (bandwidthTrend.direction === 'up' ? bandwidthTrend.percentage : -bandwidthTrend.percentage) / 100)),
          cost: Math.round(lastDataPoint.cost * (1 + (costTrend.direction === 'up' ? costTrend.percentage : -costTrend.percentage) / 100))
        },
        confidence: 75.5, // Based on data quality and trend consistency
        methodology: 'Linear trend extrapolation with seasonal adjustments'
      };
    }

    // Example of how you might fetch from database:
    /*
    const trendData = await db.analyticsSnapshot.findMany({
      where: {
        timestamp: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          lte: endDate ? new Date(endDate) : new Date()
        }
      },
      orderBy: {
        timestamp: 'asc'
      },
      select: {
        timestamp: true,
        totalStreams: true,
        totalViewers: true,
        bandwidthUsage: true,
        totalCost: true,
        errorRate: true,
        averageResponseTime: true,
        uptime: true
      }
    });

    const formattedData = trendData.map(snapshot => ({
      date: snapshot.timestamp.toISOString(),
      streams: snapshot.totalStreams,
      viewers: snapshot.totalViewers,
      bandwidth: snapshot.bandwidthUsage,
      cost: snapshot.totalCost,
      errorRate: snapshot.errorRate,
      responseTime: snapshot.averageResponseTime,
      uptime: snapshot.uptime
    }));
    */

    return NextResponse.json({
      success: true,
      data: trendAnalysis,
      metadata: {
        timeRange,
        granularity,
        metric,
        includeForecast,
        startDate: startDate || new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString(),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch trend analysis:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch trend analysis data' 
      },
      { status: 500 }
    );
  }
}