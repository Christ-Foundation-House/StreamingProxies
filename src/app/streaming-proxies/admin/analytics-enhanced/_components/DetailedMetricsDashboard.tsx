'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Clock, 
  Zap, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export interface MetricData {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  status?: 'healthy' | 'warning' | 'critical';
  description?: string;
  target?: string | number;
  unit?: string;
}

export interface MetricsCategory {
  id: string;
  name: string;
  metrics: MetricData[];
  color: string;
}

interface DetailedMetricsDashboardProps {
  categories: MetricsCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  timeRange: string;
}

export default function DetailedMetricsDashboard({
  categories,
  activeCategory,
  onCategoryChange,
  timeRange
}: DetailedMetricsDashboardProps) {
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());

  const toggleMetricExpansion = (metricTitle: string) => {
    const newExpanded = new Set(expandedMetrics);
    if (newExpanded.has(metricTitle)) {
      newExpanded.delete(metricTitle);
    } else {
      newExpanded.add(metricTitle);
    }
    setExpandedMetrics(newExpanded);
  };

  const getMetricIcon = (title: string, status?: string) => {
    const iconClass = "h-5 w-5";
    
    if (status) {
      switch (status) {
        case 'healthy':
          return <CheckCircle className={`${iconClass} text-green-500`} />;
        case 'warning':
          return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
        case 'critical':
          return <XCircle className={`${iconClass} text-red-500`} />;
      }
    }

    // Default icons based on metric title
    if (title.toLowerCase().includes('response') || title.toLowerCase().includes('time')) {
      return <Clock className={iconClass} />;
    }
    if (title.toLowerCase().includes('user') || title.toLowerCase().includes('viewer')) {
      return <Users className={iconClass} />;
    }
    if (title.toLowerCase().includes('cost') || title.toLowerCase().includes('$')) {
      return <DollarSign className={iconClass} />;
    }
    if (title.toLowerCase().includes('error') || title.toLowerCase().includes('fail')) {
      return <AlertTriangle className={iconClass} />;
    }
    if (title.toLowerCase().includes('throughput') || title.toLowerCase().includes('bandwidth')) {
      return <Zap className={iconClass} />;
    }
    
    return <Activity className={iconClass} />;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const activeData = categories.find(cat => cat.id === activeCategory);

  if (!activeData) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No metrics data available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            onClick={() => onCategoryChange(category.id)}
            className="gap-2"
            style={{
              backgroundColor: activeCategory === category.id ? category.color : undefined,
              borderColor: category.color
            }}
          >
            {category.name}
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
              {category.metrics.length}
            </span>
          </Button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeData.metrics.map((metric, index) => (
          <Card 
            key={index} 
            className={`p-6 border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer ${getStatusColor(metric.status)}`}
            onClick={() => toggleMetricExpansion(metric.title)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getMetricIcon(metric.title, metric.status)}
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{metric.title}</h3>
                  {metric.unit && (
                    <p className="text-xs text-gray-500">in {metric.unit}</p>
                  )}
                </div>
              </div>
              {getTrendIcon(metric.trend)}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </span>
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change}
                </span>
              </div>

              {metric.target && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Target:</span>
                  <span className="font-medium">{metric.target}</span>
                </div>
              )}

              {expandedMetrics.has(metric.title) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {metric.description && (
                    <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                  )}
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time Range:</span>
                      <span className="font-medium">{timeRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="font-medium">2 min ago</span>
                    </div>
                    {metric.status && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`font-medium capitalize ${
                          metric.status === 'healthy' ? 'text-green-600' :
                          metric.status === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {metric.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {activeData.name} Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {activeData.metrics.filter(m => m.status === 'healthy').length}
            </div>
            <p className="text-sm text-gray-600">Healthy</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {activeData.metrics.filter(m => m.status === 'warning').length}
            </div>
            <p className="text-sm text-gray-600">Warning</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {activeData.metrics.filter(m => m.status === 'critical').length}
            </div>
            <p className="text-sm text-gray-600">Critical</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {activeData.metrics.filter(m => m.trend === 'up').length}
            </div>
            <p className="text-sm text-gray-600">Improving</p>
          </div>
        </div>
      </Card>
    </div>
  );
}