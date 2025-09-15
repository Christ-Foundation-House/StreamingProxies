'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStreamingProxies } from '@/lib/streaming-proxies/hooks/useStreamingProxies';
import { useStreamingStats } from '@/lib/streaming-proxies/hooks/useStreamingStats';
import { useStreamingSessions } from '@/lib/streaming-proxies/hooks/useStreamingSessions';
import { useRealTimeData } from '@/lib/streaming-proxies/hooks/useRealTimeData';
import { LAYOUT_STYLES } from '@/lib/streaming-proxies/utils/constants';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/ClientOnly';
import { LastUpdated } from '@/components/ui/TimeDisplay';

import SystemOverview from './_components/SystemOverview';
import ActiveStreams from './_components/ActiveStreams';
import QuickActions from './_components/QuickActions';
import { CompactProxyCard } from '../_components/ProxyCard';
import { ProxyGridSkeleton } from '@/components/ui/loading-skeletons';
import { 
  SystemOverviewErrorBoundary,
  QuickActionsErrorBoundary,
  ActiveStreamsErrorBoundary,
  ProxyGridErrorBoundary,
  ProxyCardErrorBoundary
} from './_components/ErrorBoundaryWrappers';

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

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    refresh: refreshSessions,
    endSession,
    updateSession,
  } = useStreamingSessions({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    includeInactive: false,
  });

  // Real-time updates (only enabled if configured)
  const realTimeData = useRealTimeData({
    enableProxyUpdates: true,
    enableStatsUpdates: true,
    enableHealthUpdates: true,
    initialData: {
      proxies,
      stats: stats || undefined,
    },
  });

  // Update local state when real-time data changes
  useEffect(() => {
    if (realTimeData.proxies.length > 0) {
      // Only update if we have real-time data
      realTimeData.proxies.forEach(proxy => {
        updateProxyInState(proxy);
      });
    }
  }, [realTimeData.proxies, updateProxyInState]);

  useEffect(() => {
    if (realTimeData.stats) {
      updateStats(realTimeData.stats);
    }
  }, [realTimeData.stats, updateStats]);

  // Memoize filtered proxy lists to prevent unnecessary recalculations
  const filteredProxies = useMemo(() => {
    const activeProxies = proxies.filter(proxy => proxy.status === 'active');
    const availableProxies = proxies.filter(proxy => 
      proxy.status === 'active' && proxy.currentActiveStreams < proxy.maxConcurrentStreams
    );
    
    return {
      active: activeProxies,
      available: availableProxies,
      total: proxies.length
    };
  }, [proxies]);

  // Memoize event handlers to prevent child re-renders
  const handleStartStream = useCallback(() => {
    router.push('/streaming-proxies/dashboard/start-stream');
  }, [router]);

  const handleKillAllStreams = useCallback(async () => {
    // Implementation would go here
    console.log('Killing all streams...');
  }, []);

  const handleRefreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshProxies(), 
        refreshStats(), 
        refreshSessions()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProxies, refreshStats, refreshSessions]);

  const handleCreateProxy = useCallback(() => {
    router.push('/streaming-proxies/admin/create');
  }, [router]);

  const handleViewAnalytics = useCallback(() => {
    router.push('/streaming-proxies/admin/analytics');
  }, [router]);

  const handleViewProxyDetails = useCallback((proxy: { id: string }) => {
    router.push(`/streaming-proxies/dashboard/${proxy.id}`);
  }, [router]);

  const handleEndStream = useCallback(async (sessionId: string) => {
    try {
      await endSession(sessionId);
    } catch (error) {
      console.error('Failed to end stream:', error);
      // You could show a toast notification here
      alert('Failed to end stream. Please try again.');
    }
  }, [endSession]);

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
                {filteredProxies.available.length} of {filteredProxies.total} proxies available
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  proxiesError || statsError ? 'bg-red-500' : 
                  realTimeData.isConnected ? 'bg-green-500' : 'bg-yellow-500'
                )} />
                <span className="text-xs text-gray-500">
                  {proxiesError || statsError ? 'Error' : 
                   realTimeData.isConnected ? 'Live' : 
                   realTimeData.isUsingMockData ? 'Mock' : 'API Only'}
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
          <SystemOverviewErrorBoundary>
            <SystemOverview 
              stats={stats} 
              loading={statsLoading || refreshing}
            />
          </SystemOverviewErrorBoundary>

          {/* Quick Actions */}
          <QuickActionsErrorBoundary>
            <QuickActions
              onStartStream={handleStartStream}
              onKillAllStreams={handleKillAllStreams}
              onRefreshData={handleRefreshData}
              onCreateProxy={handleCreateProxy}
              onViewAnalytics={handleViewAnalytics}
              loading={refreshing}
            />
          </QuickActionsErrorBoundary>

          {/* Active Streams */}
          <ActiveStreamsErrorBoundary>
            <ActiveStreams
              sessions={sessions}
              loading={sessionsLoading || refreshing}
              onEndStream={handleEndStream}
            />
          </ActiveStreamsErrorBoundary>

          {/* Proxy Grid */}
          <ProxyGridErrorBoundary
            onCreateProxy={handleCreateProxy}
            onViewAllProxies={() => router.push('/streaming-proxies/admin')}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Streaming Proxies</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {filteredProxies.active.length} active
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
                <ProxyGridSkeleton count={6} />
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
                    <ProxyCardErrorBoundary
                      key={proxy.id}
                      proxyId={proxy.id}
                      proxyName={proxy.name}
                      onViewDetails={() => handleViewProxyDetails(proxy)}
                      onRemoveFromGrid={() => {
                        // Could implement logic to hide failed cards
                        console.log('Remove proxy card from grid:', proxy.id);
                      }}
                    >
                      <CompactProxyCard 
                        proxy={proxy}
                        selected={false}
                        onSelect={handleViewProxyDetails}
                      />
                    </ProxyCardErrorBoundary>
                  ))}
                </div>
              )}
            </div>
          </ProxyGridErrorBoundary>

          {/* Footer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <ClientOnly fallback={<div>Last updated: --:--</div>}>
                <LastUpdated className="text-sm text-gray-500" />
              </ClientOnly>
              <div className="flex items-center gap-4">
                <span>Auto-refresh: On</span>
                <span>•</span>
                <span>Real-time updates: {realTimeData.isConnected ? 'Active' : 'Disabled'}</span>
                {realTimeData.isUsingMockData && (
                  <>
                    <span>•</span>
                    <span className="text-orange-600">Using mock data</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}