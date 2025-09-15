'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Settings, BarChart3, Server, Users, Activity } from 'lucide-react';

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const adminActions = [
    {
      title: 'Create New Proxy',
      description: 'Set up a new streaming proxy server',
      icon: <Plus className="h-6 w-6" />,
      action: () => router.push('/streaming-proxies/admin/create'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Analytics',
      description: 'Monitor performance and usage statistics',
      icon: <BarChart3 className="h-6 w-6" />,
      action: () => router.push('/streaming-proxies/admin/analytics'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'System Settings',
      description: 'Configure global system settings',
      icon: <Settings className="h-6 w-6" />,
      action: () => alert('System settings coming soon'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'User Management',
      description: 'Manage user access and permissions',
      icon: <Users className="h-6 w-6" />,
      action: () => alert('User management coming soon'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  // These would come from API calls in production
  const [quickStats, setQuickStats] = useState([
    { label: 'Total Proxies', value: '--', icon: <Server className="h-5 w-5" /> },
    { label: 'Active Streams', value: '--', icon: <Activity className="h-5 w-5" /> },
    { label: 'Total Users', value: '--', icon: <Users className="h-5 w-5" /> },
    { label: 'System Health', value: '--', icon: <BarChart3 className="h-5 w-5" /> }
  ]);

  // Load real stats in production
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Replace with actual API calls
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setQuickStats([
            { label: 'Total Proxies', value: data.totalProxies?.toString() || '--', icon: <Server className="h-5 w-5" /> },
            { label: 'Active Streams', value: data.activeStreams?.toString() || '--', icon: <Activity className="h-5 w-5" /> },
            { label: 'Total Users', value: data.totalUsers?.toString() || '--', icon: <Users className="h-5 w-5" /> },
            { label: 'System Health', value: data.systemHealth || '--', icon: <BarChart3 className="h-5 w-5" /> }
          ]);
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Manage your streaming proxy infrastructure</p>
            </div>
            <Button
              onClick={() => router.push('/streaming-proxies/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Admin Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminActions.map((action, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg text-white ${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900">New proxy "US-East-1" created</span>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900">Stream started on proxy "EU-West-1"</span>
              </div>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900">System maintenance completed</span>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900">User permissions updated</span>
              </div>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}