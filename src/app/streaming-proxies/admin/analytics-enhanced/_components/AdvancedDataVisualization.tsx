'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Activity, 
  Maximize2,
  Download,
  Settings,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';

interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  category?: string;
}

interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  description?: string;
  xAxis: string;
  yAxis: string;
  color: string;
  data: ChartDataPoint[];
  aggregation?: 'sum' | 'avg' | 'max' | 'min' | 'count';
}

interface AdvancedDataVisualizationProps {
  activeCategory: 'performance' | 'usage' | 'costs' | 'trends';
  timeRange: string;
  onExport?: (chartId: string, format: 'png' | 'svg' | 'csv') => void;
}

export default function AdvancedDataVisualization({ 
  activeCategory, 
  timeRange, 
  onExport 
}: AdvancedDataVisualizationProps) {
  const [selectedChart, setSelectedChart] = useState<string>('primary');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'area'>('line');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate mock time series data
  const generateTimeSeriesData = (points: number, baseValue: number, variance: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * (24 * 60 * 60 * 1000 / points));
      const value = baseValue + (Math.random() - 0.5) * variance;
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.max(0, value),
        label: timestamp.toLocaleDateString()
      });
    }
    return data;
  };

  // Chart configurations based on category
  const chartConfigs: Record<string, ChartConfig[]> = {
    performance: [
      {
        type: 'line',
        title: 'Response Time Trends',
        description: 'Average API response time over time',
        xAxis: 'Time',
        yAxis: 'Response Time (ms)',
        color: '#3B82F6',
        data: generateTimeSeriesData(24, 45, 20)
      },
      {
        type: 'area',
        title: 'System Uptime',
        description: 'System availability percentage',
        xAxis: 'Time',
        yAxis: 'Uptime (%)',
        color: '#10B981',
        data: generateTimeSeriesData(24, 99.5, 1)
      },
      {
        type: 'bar',
        title: 'Error Rate Distribution',
        description: 'Error rates by endpoint',
        xAxis: 'Endpoint',
        yAxis: 'Error Rate (%)',
        color: '#EF4444',
        data: [
          { timestamp: '2024-01-01', value: 0.02, label: '/api/streams', category: 'API' },
          { timestamp: '2024-01-01', value: 0.01, label: '/api/users', category: 'API' },
          { timestamp: '2024-01-01', value: 0.05, label: '/api/analytics', category: 'API' },
          { timestamp: '2024-01-01', value: 0.03, label: '/api/settings', category: 'API' }
        ]
      },
      {
        type: 'line',
        title: 'Throughput Analysis',
        description: 'Data processing throughput over time',
        xAxis: 'Time',
        yAxis: 'Throughput (Gbps)',
        color: '#8B5CF6',
        data: generateTimeSeriesData(24, 2.4, 0.8)
      }
    ],
    usage: [
      {
        type: 'line',
        title: 'Stream Count Trends',
        description: 'Active streams over time',
        xAxis: 'Time',
        yAxis: 'Active Streams',
        color: '#3B82F6',
        data: generateTimeSeriesData(24, 1200, 400)
      },
      {
        type: 'area',
        title: 'Viewer Engagement',
        description: 'Unique viewers and concurrent sessions',
        xAxis: 'Time',
        yAxis: 'Viewers',
        color: '#10B981',
        data: generateTimeSeriesData(24, 45000, 15000)
      },
      {
        type: 'pie',
        title: 'Regional Distribution',
        description: 'Stream distribution by region',
        xAxis: 'Region',
        yAxis: 'Streams',
        color: '#F59E0B',
        data: [
          { timestamp: '2024-01-01', value: 456, label: 'North America', category: 'Region' },
          { timestamp: '2024-01-01', value: 234, label: 'Europe', category: 'Region' },
          { timestamp: '2024-01-01', value: 189, label: 'Asia Pacific', category: 'Region' },
          { timestamp: '2024-01-01', value: 123, label: 'South America', category: 'Region' },
          { timestamp: '2024-01-01', value: 67, label: 'Africa', category: 'Region' }
        ]
      },
      {
        type: 'bar',
        title: 'Data Transfer Patterns',
        description: 'Data transfer by time of day',
        xAxis: 'Hour',
        yAxis: 'Data Transfer (TB)',
        color: '#EC4899',
        data: Array.from({ length: 24 }, (_, i) => ({
          timestamp: `2024-01-01T${i.toString().padStart(2, '0')}:00:00Z`,
          value: Math.random() * 5 + 1,
          label: `${i}:00`
        }))
      }
    ],
    costs: [
      {
        type: 'line',
        title: 'Cost Trends',
        description: 'Monthly cost evolution',
        xAxis: 'Time',
        yAxis: 'Cost ($)',
        color: '#DC2626',
        data: generateTimeSeriesData(12, 1200, 200)
      },
      {
        type: 'pie',
        title: 'Cost Breakdown',
        description: 'Cost distribution by category',
        xAxis: 'Category',
        yAxis: 'Cost ($)',
        color: '#7C3AED',
        data: [
          { timestamp: '2024-01-01', value: 778, label: 'Infrastructure', category: 'Cost' },
          { timestamp: '2024-01-01', value: 456, label: 'Bandwidth', category: 'Cost' },
          { timestamp: '2024-01-01', value: 234, label: 'Storage', category: 'Cost' },
          { timestamp: '2024-01-01', value: 123, label: 'Support', category: 'Cost' }
        ]
      },
      {
        type: 'bar',
        title: 'Cost per Stream Analysis',
        description: 'Cost efficiency by stream type',
        xAxis: 'Stream Type',
        yAxis: 'Cost per Stream ($)',
        color: '#059669',
        data: [
          { timestamp: '2024-01-01', value: 0.89, label: 'HD Streams', category: 'Type' },
          { timestamp: '2024-01-01', value: 1.45, label: '4K Streams', category: 'Type' },
          { timestamp: '2024-01-01', value: 0.56, label: 'SD Streams', category: 'Type' },
          { timestamp: '2024-01-01', value: 2.34, label: '8K Streams', category: 'Type' }
        ]
      },
      {
        type: 'area',
        title: 'ROI Analysis',
        description: 'Return on investment over time',
        xAxis: 'Time',
        yAxis: 'ROI (%)',
        color: '#0891B2',
        data: generateTimeSeriesData(12, 15, 5)
      }
    ],
    trends: [
      {
        type: 'line',
        title: 'Performance Trends',
        description: 'Long-term performance indicators',
        xAxis: 'Time',
        yAxis: 'Performance Score',
        color: '#3B82F6',
        data: generateTimeSeriesData(30, 85, 10)
      },
      {
        type: 'area',
        title: 'Growth Projections',
        description: 'Predicted growth patterns',
        xAxis: 'Time',
        yAxis: 'Growth Rate (%)',
        color: '#10B981',
        data: generateTimeSeriesData(12, 12, 4)
      },
      {
        type: 'bar',
        title: 'Seasonal Patterns',
        description: 'Usage patterns by season',
        xAxis: 'Season',
        yAxis: 'Usage Index',
        color: '#F59E0B',
        data: [
          { timestamp: '2024-01-01', value: 85, label: 'Spring', category: 'Season' },
          { timestamp: '2024-01-01', value: 120, label: 'Summer', category: 'Season' },
          { timestamp: '2024-01-01', value: 95, label: 'Fall', category: 'Season' },
          { timestamp: '2024-01-01', value: 110, label: 'Winter', category: 'Season' }
        ]
      },
      {
        type: 'line',
        title: 'Predictive Analytics',
        description: 'AI-powered trend predictions',
        xAxis: 'Time',
        yAxis: 'Predicted Value',
        color: '#8B5CF6',
        data: generateTimeSeriesData(24, 100, 20)
      }
    ]
  };

  const currentCharts = chartConfigs[activeCategory] || [];
  const selectedChartConfig = currentCharts.find((_, index) => 
    selectedChart === 'primary' ? index === 0 : selectedChart === index.toString()
  ) || currentCharts[0];

  // Mock chart rendering component
  const ChartRenderer = ({ config, type }: { config: ChartConfig; type: string }) => {
    const getChartIcon = () => {
      switch (type) {
        case 'line':
          return <LineChart className="h-8 w-8" />;
        case 'bar':
          return <BarChart3 className="h-8 w-8" />;
        case 'pie':
          return <PieChart className="h-8 w-8" />;
        case 'area':
          return <Activity className="h-8 w-8" />;
        default:
          return <TrendingUp className="h-8 w-8" />;
      }
    };

    return (
      <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-gray-400 mb-4">
          {getChartIcon()}
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{config.title}</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">{config.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {config.data.length} data points
          </Badge>
          <Badge variant="outline" className="text-xs">
            {type.toUpperCase()} Chart
          </Badge>
        </div>
        
        {/* Mock data visualization */}
        <div className="mt-4 w-full max-w-sm">
          <div className="flex items-end justify-center gap-1 h-16">
            {config.data.slice(0, 12).map((_, index) => (
              <div
                key={index}
                className="bg-blue-400 rounded-t"
                style={{
                  height: `${Math.random() * 60 + 10}px`,
                  width: '8px',
                  opacity: 0.7
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ChartControls = () => (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        {['line', 'bar', 'pie', 'area'].map((type) => (
          <Button
            key={type}
            variant={chartType === type ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType(type as any)}
            className="h-8 px-3 capitalize"
          >
            {type === 'line' && <LineChart className="h-4 w-4" />}
            {type === 'bar' && <BarChart3 className="h-4 w-4" />}
            {type === 'pie' && <PieChart className="h-4 w-4" />}
            {type === 'area' && <Activity className="h-4 w-4" />}
          </Button>
        ))}
      </div>
      
      <Button variant="outline" size="sm" className="gap-2">
        <Filter className="h-4 w-4" />
        Filter
      </Button>
      
      <Button variant="outline" size="sm" className="gap-2">
        <Settings className="h-4 w-4" />
        Configure
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={() => setIsFullscreen(!isFullscreen)}
      >
        <Maximize2 className="h-4 w-4" />
        {isFullscreen ? 'Exit' : 'Fullscreen'}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={() => onExport?.(selectedChart, 'png')}
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Chart Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Data Visualization</h2>
          <p className="text-sm text-gray-500">
            Interactive charts and analytics for {activeCategory} data
          </p>
        </div>
        <ChartControls />
      </div>

      {/* Chart Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {currentCharts.map((chart, index) => (
            <button
              key={index}
              onClick={() => setSelectedChart(index === 0 ? 'primary' : index.toString())}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                (selectedChart === 'primary' && index === 0) || selectedChart === index.toString()
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {chart.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Chart Display */}
      <Card className={`p-6 ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''}`}>
        {selectedChartConfig && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedChartConfig.title}
                </h3>
                <p className="text-sm text-gray-500">{selectedChartConfig.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Updated {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            <ChartRenderer config={selectedChartConfig} type={chartType} />
            
            {/* Chart Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedChartConfig.data.length}
                </div>
                <p className="text-sm text-gray-600">Data Points</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...selectedChartConfig.data.map(d => d.value)).toFixed(1)}
                </div>
                <p className="text-sm text-gray-600">Peak Value</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(selectedChartConfig.data.reduce((sum, d) => sum + d.value, 0) / selectedChartConfig.data.length).toFixed(1)}
                </div>
                <p className="text-sm text-gray-600">Average</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {((Math.max(...selectedChartConfig.data.map(d => d.value)) - Math.min(...selectedChartConfig.data.map(d => d.value))) / Math.min(...selectedChartConfig.data.map(d => d.value)) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Variance</p>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Chart Grid - Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentCharts.slice(1, 3).map((chart, index) => (
          <Card key={index + 1} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">{chart.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedChart((index + 1).toString())}
                className="gap-1"
              >
                <Maximize2 className="h-3 w-3" />
                View
              </Button>
            </div>
            <div className="h-48">
              <ChartRenderer config={chart} type={chart.type} />
            </div>
          </Card>
        ))}
      </div>

      {/* Real-time Data Indicator */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-gray-900">Real-time Data</p>
              <p className="text-sm text-gray-500">Charts update automatically every 30 seconds</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Time Range: {timeRange}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}