'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Users, Activity, Clock, Download } from 'lucide-react';

export default function Analytics() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const metrics = [
    {
      title: 'Total Streams',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: <Activity className="h-6 w-6" />
    },
    {
      title: 'Total Viewers',
      value: '45,678',
      change: '+8%',
      trend: 'up',
      icon: <Users className="h-6 w-6" />
    },
    {
      title: 'Avg Stream Duration',
      value: '2h 34m',
      change: '+5%',
      trend: 'up',
      icon: <Clock className="h-6 w-6" />
    },
    {
      title: 'Peak Concurrent',
      value: '892',
      change: '-3%',
      trend: 'down',
      icon: <TrendingUp className="h-6 w-6" />
    }
  ];

  const topProxies = [
    { name: 'US-East-1', streams: 156, viewers: 12450, uptime: '99.9%' },
    { name: 'EU-West-1', streams: 134, viewers: 9876, uptime: '99.7%' },
    { name: 'Asia-Pacific-1', streams: 98, viewers: 7654, uptime: '99.8%' },
    { name: 'US-West-2', streams: 87, viewers: 6543, uptime: '99.5%' },
    { name: 'EU-Central-1', streams: 76, viewers: 5432, uptime: '99.6%' }
  ];

  const recentStreams = [
    { id: 1, title: 'Sunday Service', proxy: 'US-East-1', viewers: 1234, duration: '2h 15m', status: 'completed' },
    { id: 2, title: 'Youth Meeting', proxy: 'EU-West-1', viewers: 567, duration: '1h 45m', status: 'completed' },
    { id: 3, title: 'Bible Study', proxy: 'Asia-Pacific-1', viewers: 234, duration: '1h 30m', status: 'active' },
    { id: 4, title: 'Prayer Meeting', proxy: 'US-West-2', viewers: 123, duration: '45m', status: 'active' }
  ];

  return (
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
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Monitor streaming performance and usage</p>
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
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
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
          {/* Usage Chart Placeholder */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stream Activity</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization would go here</p>
                <p className="text-sm text-gray-400">Shows stream activity over time</p>
              </div>
            </div>
          </Card>

          {/* Viewer Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Viewer Distribution</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Pie chart would go here</p>
                <p className="text-sm text-gray-400">Shows viewer distribution by region</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Proxies */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Proxies</h3>
            <div className="space-y-4">
              {topProxies.map((proxy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{proxy.name}</h4>
                    <p className="text-sm text-gray-500">{proxy.streams} streams • {proxy.viewers.toLocaleString()} viewers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{proxy.uptime}</p>
                    <p className="text-xs text-gray-500">uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Streams */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Streams</h3>
            <div className="space-y-4">
              {recentStreams.map((stream) => (
                <div key={stream.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{stream.title}</h4>
                    <p className="text-sm text-gray-500">{stream.proxy} • {stream.viewers} viewers</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stream.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {stream.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stream.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Additional Analytics Sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bandwidth Usage</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Peak Usage:</span>
                <span className="font-medium">2.4 Gbps</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average:</span>
                <span className="font-medium">1.2 Gbps</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Transfer:</span>
                <span className="font-medium">45.6 TB</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Healthy Proxies:</span>
                <span className="font-medium text-green-600">12/12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Response Time:</span>
                <span className="font-medium">45ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Error Rate:</span>
                <span className="font-medium text-green-600">0.02%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This Month:</span>
                <span className="font-medium">$1,234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Month:</span>
                <span className="font-medium">$1,156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cost per Stream:</span>
                <span className="font-medium">$0.89</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}