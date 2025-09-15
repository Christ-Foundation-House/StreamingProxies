'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Users, 
  Zap, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  category: 'performance' | 'usage' | 'costs' | 'trends';
  description?: string;
  target?: string | number;
  status: 'healthy' | 'warning' | 'critical' | 'info';
  lastUpdated: Date;
  unit?: string;
  format?: 'number' | 'percentage' | 'currency' | 'duration' | 'bytes';
}

interface DetailedMetricsDashboardProps {
  activeCategory: 'performance' | 'usage' | 'costs' | 'trends';
  timeRange: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function DetailedMetricsDashboard({ 
  activeCategory, 
  timeRange, 
  onRefresh,
  isLoading = false 
}: DetailedMetricsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enhanced mock data with more detailed metrics
  const allMetrics: MetricData[] = [
    // Performance Metrics
    {
      id: 'response-time',
      title: 'Average Response Time',
      value: 45,
      previousValue: 52,
      change: '-13.5%',
      changeType: 'decrease',
      trend: 'up',
      icon: <Clock className="h-5 w-5" />,
      category: 'performance',
      description: 'Average API response time across all endpoints',
      target: 50,
      status: 'healthy',
      lastUpdated: new Date(),
      unit: 'ms',
      format: 'number'
    },
    {
      id: 'uptime',
      title: 'System Uptime',
      value: 99.95,
      previousValue: 99.85,
      change: '+0.1%',
      changeType: 'increase',
      trend: 'up',
      icon: <Activity className="h-5 w-5" />,
      category: 'performance',
      description: 'System availability percentage',
      target: 99.9,
      status: 'healthy',
      lastUpdated: new Date(),
      unit: '%',
      format: 'percentage'
    },
    {
      id: 'error-rate',
      title: 'Error Rate',
      value: 0.02,
      previousValue: 0.03,
      change: '-33.3%',
      changeType: 'decrease',
      trend: 'up',
      icon: <AlertTriangle className="h-5 w-5" />,
      category: 'performance',
      description: 'Percentage of failed requests',
      target: 0.05,
      status: 'healthy',
      lastUpdated: new Date(),
      unit: '%',
      format: 'percentage'
    },
    {
      id: 'throughput',
      title: 'Throughput',
      value: 2.4,
      previousValue: 2.1,
      change: '+14.3%',
      changeType: 'increase',
      trend: 'up',
      icon: <Zap className="h-5 w-5" />,
      category: 'performance',
      description: 'Data processing throughput',
      target: 2.0,
      status: 'healthy',
      lastUpdated: new Date(),
      unit: 'Gbps',
      format: 'number'
    },
    // Usage Metrics
    {
      id: 'total-streams',
      title: 'Total Streams',
      value: 1234,
      previousValue: 1100,
      change: '+12.2%',
      changeType: 'increase',
      trend: 'up',
      icon: <Activity className="h-5 w-5" />,
      category: 'usage',
      description: 'Total number of active streams',
      status: 'healthy',
      lastUpdated: new Date(),
      format: 'number'
    },
    {
      id: 'unique-viewers',
      title: 'Unique Viewers',
      value: 45678,
      previousValue: 42300,
      change: '+8.0%',
      changeType: 'increase',
      trend: 'up',
      icon: <Users className="h-5 w-5" />,
      category: 'usage',
      description: 'Number of unique viewers',
      status: 'healthy',
      lastUpdated: new Date(),
      format: 'number'
    },
    {
      id: 'peak-concurrent',
      title: 'Peak Concurrent',
      value: 892,
      previousValue: 920,
      change: '-3.0%',
      changeType: 'decrease',
      trend: 'down',
      icon: <TrendingUp className="h-5 w-5" />,
      category: 'usage',
      description: 'Peak concurrent viewers',
      status: 'warning',
      lastUpdated: new Date(),
      format: 'number'
    },
    {
      id: 'data-transfer',
      title: 'Data Transfer',
      value: 45.6,
      previousValue: 37.4,
      change: '+21.9%',
      changeType: 'increase',
      trend: 'up',
      icon: <Activity className="h-5 w-5" />,
      category: 'usage',
      description: 'Total data transferred',
      status: 'info',
      lastUpdated: new Date(),
      unit: 'TB',
      format: 'bytes'
    },
    // Cost Metrics
    {
      id: 'monthly-cost',
      title: 'Monthly Cost',
      value: 1234,
      previousValue: 1175,
      change: '+5.0%',
      changeType: 'increase',
      trend: 'down',
      icon: <DollarSign className="h-5 w-5" />,
      category: 'costs',
      description: 'Total monthly operational cost',
      target: 1200,
      status: 'warning',
      lastUpdated: new Date(),
      unit: '$',
      format: 'currency'
    },
    {
      id: 'cost-per-stream',
      title: 'Cost per Stream',
      value: 0.89,
      previousValue: 0.97,
      change: '-8.2%',
      changeType: 'decrease',
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      category: 'costs',
      description: 'Average cost per stream',
      status: 'healthy',
      lastUpdated: new Date(),
      unit: '$',
      format: 'currency'
    },
    {
      id: 'bandwidth-cost',
      title: 'Bandwidth Cost',
      value: 456,
      previousValue: 407,
      change: '+12.0%',
      changeType: 'increase',
      trend: 'down',
      icon: <DollarSign className="h-5 w-5" />,
      category: 'costs',
      description: 'Bandwidth usage cost',
      status: 'warning',
      lastUpdated: new Date(),
      unit: '$',
      format: 'currency'
    },
    {
      id: 'infrastructure-cost',
      title: 'Infrastructure Cost',
      value: 778,
      previousValue: 762,
      change: '+2.1%',
      changeType: 'increase',
      trend: 'down',
      icon: <DollarSign className="h-5 w-5" />,
      category: 'costs',
      description: 'Infrastructure and hosting cost',
      status: 'info',
      lastUpdated: new Date(),
      unit: '$',
      format: 'currency'
    }
  ];

  const filteredMetrics = useMemo(() => {
    return allMetrics.filter(metric => metric.category === activeCategory);
  }, [activeCategory]);

  const formatValue = (metric: MetricData): string => {
    const { value, format, unit } = metric;
    
    switch (format) {
      case 'currency':
        return `${unit}${typeof value === 'number' ? value.toLocaleString() : value}`;
      case 'percentage':
        return `${value}${unit || '%'}`;
      case 'duration':
        return `${value}${unit || 'ms'}`;
      case 'bytes':
        return `${value} ${unit || 'B'}`;
      default:
        return `${typeof value === 'number' ? value.toLocaleString() : value}${unit ? ` ${unit}` : ''}`;
    }
  };

  const getStatusColor = (status: MetricData['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: MetricData['trend'], changeType: MetricData['changeType']) => {
    if (trend === 'up' && changeType === 'increase') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'up' && changeType === 'decrease') {
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down' && changeType === 'increase') {
      return <TrendingUp className="h-4 w-4 text-red-600" />;
    } else if (trend === 'down' && changeType === 'decrease') {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const MetricCard = ({ metric }: { metric: MetricData }) => (
    <Card 
      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        selectedMetric === metric.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              {metric.icon}
            </div>
            <Badge className={getStatusColor(metric.status)}>
              {metric.status}
            </Badge>
          </div>
          
          <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatValue(metric)}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon(metric.trend, metric.changeType)}
            <span className={`text-sm font-medium ${
              metric.changeType === 'increase' 
                ? metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                : metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change}
            </span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>

          {metric.target && (
            <div className="text-xs text-gray-500">
              Target: {formatValue({ ...metric, value: metric.target })}
            </div>
          )}
        </div>
      </div>

      {selectedMetric === metric.id && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last updated: {metric.lastUpdated.toLocaleTimeString()}</span>
            {metric.previousValue && (
              <span>Previous: {formatValue({ ...metric, value: metric.previousValue })}</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );

  const MetricListItem = ({ metric }: { metric: MetricData }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            {metric.icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{metric.title}</h3>
            <p className="text-sm text-gray-500">{metric.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">
            {formatValue(metric)}
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon(metric.trend, metric.changeType)}
            <span className={`text-sm font-medium ${
              metric.changeType === 'increase' 
                ? metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                : metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change}
            </span>
          </div>
        </div>
        
        <Badge className={getStatusColor(metric.status)}>
          {metric.status}
        </Badge>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {activeCategory} Metrics
          </h2>
          <p className="text-sm text-gray-500">
            Detailed analytics for {timeRange} period
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <LineChart className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMetrics.map((metric) => (
            <MetricListItem key={metric.id} metric={metric} />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {filteredMetrics.filter(m => m.status === 'healthy').length}
            </div>
            <p className="text-sm text-gray-600">Healthy Metrics</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {filteredMetrics.filter(m => m.status === 'warning').length}
            </div>
            <p className="text-sm text-gray-600">Warning Metrics</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {filteredMetrics.filter(m => m.status === 'critical').length}
            </div>
            <p className="text-sm text-gray-600">Critical Metrics</p>
          </div>
        </div>
      </Card>
    </div>
  );
}