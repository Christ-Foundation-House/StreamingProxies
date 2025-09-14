'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStreamingProxies } from '@/lib/streaming-proxies/hooks/useStreamingProxies';
import { useHealthMonitoring } from '@/lib/streaming-proxies/hooks/useHealthMonitoring';
import { StreamingProxy, ProxyStatus } from '@/lib/streaming-proxies/types';
import { COMPONENT_STYLES } from '@/lib/streaming-proxies/utils/constants';
import { cn } from '@/lib/utils';

import ProxyTable from './_components/ProxyTable';
import { CompactSystemOverview } from '../dashboard/_components/SystemOverview';
import { useStreamingStats } from '@/lib/streaming-proxies/hooks/useStreamingStats';

export default function StreamingProxyAdmin() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Data hooks
  const {
    proxies,
    loading: proxiesLoading,
    error: proxiesError,
    refresh: refreshProxies,
    updateProxy,
    deleteProxy,
    bulkUpdateStatus,
  } = useStreamingProxies();

  const { stats, loading: statsLoading } = useStreamingStats();

  const { runHealthCheck } = useHealthMonitoring(proxies);

  // Handlers
  const handleCreateProxy = () => {
    router.push('/streaming-proxies/admin/create');
  };

  const handleEditProxy = (proxy: StreamingProxy) => {
    router.push(`/streaming-proxies/admin/edit/${proxy.id}`);
  };

  const handleDeleteProxy = async (proxyId: string) => {
    const proxy = proxies.find(p => p.id === proxyId);
    if (!proxy) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${proxy.name}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await deleteProxy(proxyId);
      } catch (error) {
        console.error('Failed to delete proxy:', error);
        alert('Failed to delete proxy. Please try again.');
      }
    }
  };

  const handleBulkAction = async (action: string, proxyIds: string[]) => {
    let status: ProxyStatus;
    let confirmMessage: string;

    switch (action) {
      case 'activate':
        status = ProxyStatus.ACTIVE;
        confirmMessage = `Activate ${proxyIds.length} proxy(ies)?`;
        break;
      case 'deactivate':
        status = ProxyStatus.INACTIVE;
        confirmMessage = `Deactivate ${proxyIds.length} proxy(ies)?`;
        break;
      case 'maintenance':
        status = ProxyStatus.MAINTENANCE;
        confirmMessage = `Set ${proxyIds.length} proxy(ies) to maintenance mode?`;
        break;
      default:
        return;
    }

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      await bulkUpdateStatus(proxyIds, status);
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Bulk action failed. Please try again.');
    }
  };

  const handleHealthCheck = async (proxyId: string) => {
    try {
      await runHealthCheck(proxyId);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await refreshProxies();
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewAnalytics = () => {
    router.push('/streaming-proxies/admin/analytics');
  };

  const handleBackToDashboard = () => {
    router.push('/streaming-proxies/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToDashboard}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Back to Dashboard"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Proxy Administration</h1>
                <p className="text-sm text-gray-500">Manage streaming proxies and configurations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleViewAnalytics}
                className={cn(COMPONENT_STYLES.BUTTON_SECONDARY, 'text-sm')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </button>
              
              <button
                onClick={handleRefreshAll}
                disabled={refreshing}
                className={cn(
                  COMPONENT_STYLES.BUTTON_SECONDARY,
                  'text-sm',
                  refreshing && 'opacity-50 cursor-not-allowed'
                )}
              >
                <svg className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h-.582M8.644 21A8.001 8.001 0 0019.418 15m0 0V15a8 8 0 10-15.356-2" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <button
                onClick={handleCreateProxy}
                className={cn(COMPONENT_STYLES.BUTTON_PRIMARY, 'text-sm')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Proxy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* System Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
            <CompactSystemOverview stats={stats} loading={statsLoading} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Proxies</p>
                  <p className="text-2xl font-semibold text-gray-900">{proxies.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {proxies.filter(p => p.status === ProxyStatus.ACTIVE).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Warnings</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {proxies.filter(p => p.healthStatus === 'warning').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Errors</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {proxies.filter(p => p.healthStatus === 'error').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Proxy Table */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">All Proxies</h2>
              <div className="text-sm text-gray-500">
                {proxies.length} total proxies
              </div>
            </div>

            {proxiesError ? (
              <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
                <div className="text-red-600 mb-4">Failed to load proxies</div>
                <button
                  onClick={handleRefreshAll}
                  className={COMPONENT_STYLES.BUTTON_PRIMARY}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <ProxyTable
                proxies={proxies}
                loading={proxiesLoading || refreshing}
                onEdit={handleEditProxy}
                onDelete={handleDeleteProxy}
                onBulkAction={handleBulkAction}
                onHealthCheck={handleHealthCheck}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}