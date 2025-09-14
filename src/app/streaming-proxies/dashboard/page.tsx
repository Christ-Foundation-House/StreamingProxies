'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStreamingProxies } from '@/lib/streaming-proxies/hooks/useStreamingProxies';
import { useStreamingStats } from '@/lib/streaming-proxies/hooks/useStreamingStats';
import { useRealTimeProxyUpdates, useRealTimeStatsUpdates } from '@/lib/streaming-proxies/hooks/useRealTime';
import { LAYOUT_STYLES } from '@/lib/streaming-proxies/utils/constants';
import { cn } from '@/lib/utils';

import SystemOverview from './_components/SystemOverview';
import ActiveStreams from './_components/ActiveStreams';
import QuickActions from './_components/QuickActions';
import { CompactProxyCard } from '../_components/ProxyCard';
import { CardLoadingSkeleton } from '../_components/LoadingStates';
import { StreamingSession, SessionStatus } from '@/lib/streaming-proxies/types';

export default function StreamingProxyDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Hooks for data management
  const {
    proxies,
    loading: proxiesLoading,
    error: proxiesError,
    refresh: refreshProxies,
    updateProxyInState,
  } = useStreamingProxies();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
    updateStats,
  } = useStreamingStats();

  // Real-time updates
  useRealTimeProxyUpdates(updateProxyInState);
  useRealTimeStatsUpdates(updateStats);

  // Mock sessions data - in real app, this would come from a hook
  const [sessions] = useState<StreamingSession[]>([
    {
      id: 'session-1',
      proxyId: 'proxy-1',
      fellowshipId: 'fellowship-1',
      streamKey: 'main-service-stream',
      startedAt: new Date(Date.now() - 1800000), // 30 minutes ago
      peakViewers: 150,
      totalDataTransferred: 2500000000, // 2.5GB
      status: SessionStatus.ACTIVE,
    },
    {
      id: 'session-2',
      proxyId: 'proxy-2',
      fellowshipId: 'fellowship-2',
      streamKey: 'youth-event-stream',
      startedAt: new Date(Date.now() - 900000), // 15 minutes ago
      peakViewers: 75,
      totalDataTransferred: 1200000000, // 1.2GB
      status: SessionStatus.ACTIVE,
    },
  ]);

  // Handlers
  const handleStartStream = () => {
    router.push('/streaming-proxies/dashboard/start-stream');
  };

  const handleKillAllStreams = async () => {
    // Implementation would go here
    console.log('Killing all streams...');
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProxies(), refreshStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateProxy = () => {
    router.push('/streaming-proxies/admin/create');
  };

  const handleViewAnalytics = () => {
    router.push('/streaming-proxies/admin/analytics');
  };

  const handleViewProxyDetails = (proxy: { id: string }) => {
    router.push(`/streaming-proxies/dashboard/${proxy.id}`);
  };

  const handleEndStream = async (sessionId: string) => {
    // Implementation would go here
    console.log('Ending stream:', sessionId);
  };

  // Filter active proxies for display
  const activeProxies = proxies.filter(proxy => proxy.status === 'active');
  const availableProxies = proxies.filter(proxy => 
    proxy.status === 'active' && proxy.currentActiveStreams < proxy.maxConcurrentStreams
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Streaming Dashboard</h1>
              <p className="text-sm text-gray-500">Monitor and manage your streaming proxies</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {availableProxies.length} of {proxies.length} proxies available
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  proxiesError || statsError ? 'bg-red-500' : 'bg-green-500'
                )} />
                <span className="text-xs text-gray-500">
                  {proxiesError || statsError ? 'Error' : 'Connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={LAYOUT_STYLES.SECTION_SPACING}>
          {/* System Overview */}
          <SystemOverview 
            stats={stats} 
            loading={statsLoading || refreshing}
          />

          {/* Quick Actions */}
          <QuickActions
            onStartStream={handleStartStream}
            onKillAllStreams={handleKillAllStreams}
            onRefreshData={handleRefreshData}
            onCreateProxy={handleCreateProxy}
            onViewAnalytics={handleViewAnalytics}
            loading={refreshing}
          />

          {/* Active Streams */}
          <ActiveStreams
            sessions={sessions}
            loading={false}
            onEndStream={handleEndStream}
          />

          {/* Proxy Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Streaming Proxies</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {activeProxies.length} active
                </span>
                <button
                  onClick={() => router.push('/streaming-proxies/admin')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage All →
                </button>
              </div>
            </div>

            {proxiesLoading ? (
              <CardLoadingSkeleton count={6} />
            ) : proxiesError ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">Failed to load proxies</div>
                <button
                  onClick={handleRefreshData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : proxies.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Streaming Proxies</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first streaming proxy</p>
                <button
                  onClick={handleCreateProxy}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Proxy
                </button>
              </div>
            ) : (
              <div className={LAYOUT_STYLES.DASHBOARD_GRID}>
                {proxies.map((proxy) => (
                  <div key={proxy.id}>
                    <CompactProxyCard 
                      proxy={proxy}
                      selected={false}
                      onSelect={handleViewProxyDetails}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-4">
                <span>Auto-refresh: On</span>
                <span>•</span>
                <span>Real-time updates: Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}