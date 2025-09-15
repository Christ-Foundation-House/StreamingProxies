'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Filter,
  Download,
  Maximize2,
  RefreshCw
} from 'lucide-react';

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  color?: string;
  description?: string;
}

export interface VisualizationProps {
  charts: ChartData[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onExport: (chartId: string, format: string) => void;
  onRefresh: () => void;
}

export default function AdvancedDataVisualization({
  charts,
  timeRange,
  onTimeRangeChange,
  onExport,
  onRefresh
}: VisualizationProps) {
  const [selectedChart, setSelectedChart] = useState<string>(charts[0]?.id || '');
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const timeRanges = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
        return <LineChart className="h-5 w-5" />;
      case 'bar':
        return <BarChart3 className="h-5 w-5" />;
      case 'pie':
        return <PieChart className="h-5 w-5" />;
      case 'area':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const renderChartPlaceholder = (chart: ChartData) => {
    return (
      <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            {getChartIcon(chart.type)}
            <span className="ml-2 text-lg font-medium text-gray-600 capitalize">
              {chart.type} Chart
            </span>
          </div>
          <p className="text-gray-500 mb-2">{chart.title}</p>
          <p className="text-sm text-gray-400">
            {chart.description || `Interactive ${chart.type} visualization`}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>Data for {timeRange}</span>
          </div>
        </div>
      </div>
    );
  };

  const selectedChartData = charts.find(chart => chart.id === selectedChart);

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </Button>
            <Button
              variant={viewMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('single')}
            >
              Single View
            </Button>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => selectedChartData && onExport(selectedChartData.id, 'png')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart) => (
            <Card key={chart.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getChartIcon(chart.type)}
                  <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedChart(chart.id);
                      setViewMode('single');
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExport(chart.id, 'png')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {renderChartPlaceholder(chart)}
            </Card>
          ))}
        </div>
      ) : (
        /* Single View */
        <div className="space-y-6">
          {/* Chart Selector */}
          <div className="flex flex-wrap gap-2">
            {charts.map((chart) => (
              <Button
                key={chart.id}
                variant={selectedChart === chart.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart(chart.id)}
                className="gap-2"
              >
                {getChartIcon(chart.type)}
                {chart.title}
              </Button>
            ))}
          </div>

          {/* Selected Chart */}
          {selectedChartData && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedChartData.title}</h2>
                  {selectedChartData.description && (
                    <p className="text-gray-600 mt-1">{selectedChartData.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onExport(selectedChartData.id, 'csv')}>
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onExport(selectedChartData.id, 'png')}>
                    Export PNG
                  </Button>
                </div>
              </div>
              
              <div className="h-96">
                {renderChartPlaceholder(selectedChartData)}
              </div>

              {/* Chart Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedChartData.data?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Data Points</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {timeRange}
                  </div>
                  <p className="text-sm text-gray-600">Time Range</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedChartData.type.toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-600">Chart Type</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Chart Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Trending Up</span>
            </div>
            <p className="text-sm text-blue-700">
              Stream quality metrics show consistent improvement over the selected time period.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Peak Performance</span>
            </div>
            <p className="text-sm text-green-700">
              Highest activity recorded during weekend hours with 95% success rate.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Distribution</span>
            </div>
            <p className="text-sm text-purple-700">
              North America accounts for 45% of total streaming activity.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}