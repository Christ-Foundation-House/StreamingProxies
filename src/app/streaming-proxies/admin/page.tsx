'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Server, Users, Activity, BarChart3 } from 'lucide-react';
import AdminNavigation from './_components/AdminNavigation';
import AdminErrorBoundary from './_components/AdminErrorBoundary';

export default function AdminPanel() {
  const router = useRouter();

  // Mock user permissions - will be replaced with real data in later tasks
  const userPermissions = ['manage_users', 'manage_settings', 'view_analytics'];

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
    <AdminErrorBoundary pageName="Admin Overview" showAdminActions={true}>
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

          {/* Enhanced Admin Navigation */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Admin Actions</h2>
            <AdminNavigation userPermissions={userPermissions} />
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
    </AdminErrorBoundary>
  );
}