'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Users, Activity, Clock, Download, DollarSign, Zap, AlertTriangle } from 'lucide-react';

import AdminErrorBoundary from '../_components/AdminErrorBoundary';

export default function EnhancedAnalytics() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('performance');

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const tabs = [
    { id: 'performance', name: 'Performance', icon: <Zap className="h-4 w-4" /> },
    { id: 'usage', name: 'Usage', icon: <Activity className="h-4 w-4" /> },
    { id: 'costs', name: 'Costs', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'trends', name: 'Trends', icon: <TrendingUp className="h-4 w-4" /> }
  ];

  // Mock enhanced analytics data - will be replaced with real data in later tasks
  const performanceMetrics = [
    {
      title: 'Average Response Time',
      value: '45ms',
      change: '-12%',
      trend: 'up',
      icon: <Clock className="h-6 w-6" />
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      icon: <Activity className="h-6 w-6" />
    },
    {
      title: 'Error Rate',
      value: '0.02%',
      change: '-0.01%',
      trend: 'up',
      icon: <AlertTriangle className="h-6 w-6" />
    },
    {
      title: 'Throughput',
      value: '2.4 Gbps',
      change: '+15%',
      trend: 'up',
      icon: <TrendingUp className="h-6 w-6" />
    }
  ];

  const usageMetrics = [
    {
      title: 'Total Streams',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: <Activity className="h-6 w-6" />
    },
    {
      title: 'Unique Viewers',
      value: '45,678',
      change: '+8%',
      trend: 'up',
      icon: <Users className="h-6 w-6" />
    },
    {
      title: 'Peak Concurrent',
      value: '892',
      change: '-3%',
      trend: 'down',
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: 'Data Transfer',
      value: '45.6 TB',
      change: '+22%',
      trend: 'up',
      icon: <Activity className="h-6 w-6" />
    }
  ];

  const costMetrics = [
    {
      title: 'Monthly Cost',
      value: '$1,234',
      change: '+5%',
      trend: 'down',
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: 'Cost per Stream',
      value: '$0.89',
      change: '-8%',
      trend: 'up',
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: 'Bandwidth Cost',
      value: '$456',
      change: '+12%',
      trend: 'down',
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: 'Infrastructure Cost',
      value: '$778',
      change: '+2%',
      trend: 'down',
      icon: <DollarSign className="h-6 w-6" />
    }
  ];

  const getCurrentMetrics = () => {
    switch (activeTab) {
      case 'performance':
        return performanceMetrics;
      case 'usage':
        return usageMetrics;
      case 'costs':
        return costMetrics;
      case 'trends':
        return performanceMetrics; // For demo, using performance metrics
      default:
        return performanceMetrics;
    }
  };

  const detailedReports = [
    {
      title: 'Stream Quality Analysis',
      description: 'Detailed analysis of stream quality metrics',
      lastGenerated: '2 hours ago',
      size: '2.4 MB'
    },
    {
      title: 'User Engagement Report',
      description: 'User behavior and engagement patterns',
      lastGenerated: '1 day ago',
      size: '1.8 MB'
    },
    {
      title: 'Performance Benchmark',
      description: 'System performance vs industry benchmarks',
      lastGenerated: '3 days ago',
      size: '3.2 MB'
    },
    {
      title: 'Cost Optimization Report',
      description: 'Recommendations for cost optimization',
      lastGenerated: '1 week ago',
      size: '1.5 MB'
    }
  ];

  const regionalData = [
    { region: 'North America', streams: 456, viewers: 18234, avgDuration: '2h 15m' },
    { region: 'Europe', streams: 234, viewers: 12456, avgDuration: '1h 45m' },
    { region: 'Asia Pacific', streams: 189, viewers: 8976, avgDuration: '2h 30m' },
    { region: 'South America', streams: 123, viewers: 4567, avgDuration: '1h 30m' },
    { region: 'Africa', streams: 67, viewers: 2345, avgDuration: '1h 15m' }
  ];

  return (
    <AdminErrorBoundary pageName="Enhanced Analytics" showAdminActions={true}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/streaming-proxies/admin')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enhanced Analytics</h1>
                <p className="text-sm text-gray-500">Comprehensive performance and usage analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getCurrentMetrics().map((metric, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <div className="text-blue-600">
                    {metric.icon}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Detailed Chart Placeholder */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {activeTab === 'performance' && 'Performance Metrics Over Time'}
              {activeTab === 'usage' && 'Usage Statistics'}
              {activeTab === 'costs' && 'Cost Analysis'}
              {activeTab === 'trends' && 'Trend Analysis'}
            </h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Advanced chart visualization</p>
                <p className="text-sm text-gray-400">
                  {activeTab === 'performance' && 'Response time, uptime, and error rates'}
                  {activeTab === 'usage' && 'Stream counts, viewer metrics, and engagement'}
                  {activeTab === 'costs' && 'Cost breakdown and optimization opportunities'}
                  {activeTab === 'trends' && 'Historical trends and predictions'}
                </p>
              </div>
            </div>
          </Card>

          {/* Regional Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
            <div className="space-y-4">
              {regionalData.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{region.region}</h4>
                    <p className="text-sm text-gray-500">
                      {region.streams} streams • {region.viewers.toLocaleString()} viewers
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{region.avgDuration}</p>
                    <p className="text-xs text-gray-500">avg duration</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Advanced Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Detailed Reports */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Reports</h3>
              <Button variant="outline" size="sm">Generate New</Button>
            </div>
            <div className="space-y-4">
              {detailedReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                    <p className="text-sm text-gray-500">{report.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-400">Generated {report.lastGenerated}</span>
                      <span className="text-xs text-gray-400">{report.size}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Real-time Alerts */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">All systems operational</p>
                  <p className="text-xs text-green-600">Last checked: 2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">High bandwidth usage detected</p>
                  <p className="text-xs text-yellow-600">EU-West-1 proxy at 85% capacity</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Scheduled maintenance reminder</p>
                  <p className="text-xs text-blue-600">Asia-Pacific-1 maintenance in 2 hours</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
              <p className="text-sm text-gray-600">Stream Success Rate</p>
              <p className="text-xs text-gray-500 mt-1">+2.1% from last month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1.2s</div>
              <p className="text-sm text-gray-600">Avg Connection Time</p>
              <p className="text-xs text-gray-500 mt-1">-0.3s from last month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <p className="text-sm text-gray-600">Service Availability</p>
              <p className="text-xs text-gray-500 mt-1">Maintained SLA target</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </AdminErrorBoundary>
  );
}