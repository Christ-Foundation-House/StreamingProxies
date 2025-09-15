'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { StreamingProxy } from '@/lib/streaming-proxies/types';
import { getProxyBandwidthData } from '@/lib/streaming-proxies/data';
import { formatBytes, formatLastUpdated } from '@/lib/streaming-proxies/utils/formatters';
import { cn } from '@/lib/utils';
import { RefreshCw, AlertTriangle, BarChart2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { BandwidthChartSkeleton } from '@/components/ui/loading-skeletons';

interface BandwidthDataPoint {
  timestamp: number;
  bytesTransferred: number;
}

interface BandwidthChartProps {
  proxy: StreamingProxy;
  timeRange?: '1h' | '24h' | '7d' | '30d';
  className?: string;
  onRefresh?: () => void;
}

// Helper function to generate mock data for demonstration
// Uses seeded random generation to prevent hydration mismatches
function generateMockBandwidthData(timeRange: string, seed?: string): BandwidthDataPoint[] {
  const now = Date.now();
  let points = 24; // Default to 24 points (1 per hour)
  let interval = 3600000; // 1 hour in ms
  
  if (timeRange === '1h') {
    points = 12; // 5-minute intervals for 1 hour
    interval = 300000; // 5 minutes in ms
  } else if (timeRange === '7d') {
    points = 28; // 6-hour intervals for 7 days
    interval = 6 * 3600000; // 6 hours in ms
  }

  // Simple seeded random function to ensure consistent data
  const seededRandom = (seed: string, index: number) => {
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const x = Math.sin(hash + index) * 10000;
    return x - Math.floor(x);
  };

  const seedValue = seed || 'default-seed';

  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (interval * (points - i - 1)),
    bytesTransferred: Math.floor(seededRandom(seedValue, i) * 1000000000), // Up to 1GB
  }));
}

function BandwidthChartContent({ 
  proxy, 
  timeRange = '24h',
  className,
  onRefresh
}: BandwidthChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<BandwidthDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch bandwidth data
  const fetchBandwidthData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch real bandwidth data from the API
      const bandwidthData = await getProxyBandwidthData(proxy.id, timeRange);
      setData(bandwidthData);
      setLastUpdated(new Date());
      
      // Call the refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error fetching bandwidth data:', err);
      setError('Failed to load bandwidth data');
      
      // In development, fall back to mock data
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock bandwidth data as fallback');
        const mockData = generateMockBandwidthData(timeRange, proxy.id);
        setData(mockData);
        setLastUpdated(new Date());
        setError(null); // Clear error since we're using mock data
      }
    } finally {
      setIsLoading(false);
    }
  }, [proxy.id, timeRange, onRefresh]);

  // Initial data fetch
  useEffect(() => {
    fetchBandwidthData();
    
    // Set up polling
    const intervalId = setInterval(fetchBandwidthData, 30000); // Poll every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchBandwidthData]);

  // Draw the chart when data changes
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    drawChart(ctx, data, timeRange);
  }, [data, timeRange]);

  // Calculate metrics
  const totalBandwidth = data.reduce((sum, point) => sum + point.bytesTransferred, 0);
  const avgBytes = data.length > 0 ? totalBandwidth / data.length : 0;
  const peakBandwidth = data.length > 0 ? Math.max(...data.map(point => point.bytesTransferred)) : 0;

  // Render loading state
  if (isLoading && data.length === 0) {
    return <BandwidthChartSkeleton className={className} />;
  }

  // Render error state
  if (error) {
    return (
      <Card className={cn('border-red-200', className)}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-red-600">Bandwidth Usage</CardTitle>
              <CardDescription>Error loading data</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={fetchBandwidthData}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', { 'animate-spin': isLoading })} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center bg-red-50 rounded-md p-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-600 font-medium mb-2">Failed to load bandwidth data</p>
            <p className="text-sm text-red-500 text-center mb-4">
              {error}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchBandwidthData}
              disabled={isLoading}
            >
              {isLoading ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Bandwidth Usage</CardTitle>
            <CardDescription>
              {lastUpdated && `Last updated: ${formatLastUpdated(lastUpdated)}`}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchBandwidthData}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className={cn('h-4 w-4', { 'animate-spin': isLoading })} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-700">Total</p>
              <p className="text-2xl font-bold text-blue-900">{formatBytes(totalBandwidth)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-700">Average</p>
              <p className="text-2xl font-bold text-green-900">{formatBytes(avgBytes)}/s</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-700">Peak</p>
              <p className="text-2xl font-bold text-purple-900">{formatBytes(peakBandwidth)}/s</p>
            </div>
          </div>
          
          <div className="relative">
            <canvas 
              ref={canvasRef} 
              className="w-full h-64 bg-gray-50 rounded-md p-2"
              aria-label="Bandwidth usage chart"
            />
            {isLoading && data.length > 0 && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 text-right">
            Data updates every 30 seconds
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Define the BandwidthChart component with proper typing
const BandwidthChart: React.FC<BandwidthChartProps> = (props) => {
  return <BandwidthChartContent {...props} />;
};

// Export the BandwidthChart component as default
export default BandwidthChart;

// Draw the chart on the canvas
function drawChart(
  ctx: CanvasRenderingContext2D, 
  data: BandwidthDataPoint[],
  timeRange: string
) {
  const width = ctx.canvas.width = ctx.canvas.offsetWidth;
  const height = ctx.canvas.height = ctx.canvas.offsetHeight;
  const padding = 20;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const y = padding + (chartHeight * (1 - i / yTicks));
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    
    // Y-axis labels
    if (i < yTicks) {
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const maxValue = Math.max(...data.map(d => d.bytesTransferred), 1);
      const value = (maxValue * i) / (yTicks - 1);
      ctx.fillText(formatBytes(value), padding - 5, y);
    }
  }
  
  // Vertical grid lines and X-axis labels
  const xTicks = Math.min(data.length, 6);
  for (let i = 0; i < xTicks; i++) {
    const x = padding + (chartWidth * i) / (xTicks - 1);
    
    // X-axis labels
    if (i > 0 && i < xTicks - 1) {
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const date = new Date(data[Math.floor((i / (xTicks - 1)) * (data.length - 1))].timestamp);
      let label = '';
      
      if (timeRange === '1h') {
        label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeRange === '24h') {
        label = date.toLocaleTimeString([], { hour: '2-digit' });
      } else {
        label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      
      ctx.fillText(label, x, height - padding + 5);
    }
  }
  
  // Draw area chart
  if (data.length < 2) return;
  
  const maxY = Math.max(...data.map(d => d.bytesTransferred), 1);
  
  // Area gradient
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
  
  // Area path
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  
  data.forEach((point, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + (1 - point.bytesTransferred / maxY) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.lineTo(padding + chartWidth, height - padding);
  ctx.closePath();
  
  // Fill area
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Line path
  ctx.beginPath();
  data.forEach((point, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + (1 - point.bytesTransferred / maxY) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  // Draw line
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw points
  data.forEach((point, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + (1 - point.bytesTransferred / maxY) * chartHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
  });
}
