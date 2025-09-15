'use client';

import { SystemStats } from '@/lib/streaming-proxies/types';
import { formatNumber, formatBandwidth } from '@/lib/streaming-proxies/utils/formatters';
import { COMPONENT_STYLES, LAYOUT_STYLES } from '@/lib/streaming-proxies/utils/constants';
import { cn } from '@/lib/utils';
import { SystemStatsSkeleton } from '@/components/ui/loading-skeletons';

interface SystemOverviewProps {
  stats: SystemStats | null;
  loading?: boolean;
  className?: string;
}

export default function SystemOverview({ stats, loading = false, className }: SystemOverviewProps) {
  if (loading || !stats) {
    return (
      <div className={cn('space-y-6', className)}>
        <SystemStatsSkeleton />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-200 rounded-full mr-3" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-200 rounded w-8" />
                    <div className="w-24 bg-gray-200 rounded-full h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-16" />
                      <div className="h-3 bg-gray-200 rounded w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const healthPercentage = stats.totalProxies > 0 
    ? (stats.healthyProxies / stats.totalProxies) * 100 
    : 0;

  const activePercentage = stats.totalProxies > 0 
    ? (stats.activeProxies / stats.totalProxies) * 100 
    : 0;

  const statCards = [
    {
      title: 'Total Proxies',
      value: formatNumber(stats.totalProxies),
      subtitle: `${stats.activeProxies} active`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Streams',
      value: formatNumber(stats.totalActiveStreams),
      subtitle: 'Currently streaming',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a2 2 0 012-2h8a2 2 0 012 2v2M7 16v2a2 2 0 002 2h6a2 2 0 002-2v-2" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Bandwidth Usage',
      value: formatBandwidth(stats.totalBandwidthUsage),
      subtitle: 'Current usage',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'System Health',
      value: `${Math.round(healthPercentage)}%`,
      subtitle: `${stats.healthyProxies}/${stats.totalProxies} healthy`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: healthPercentage >= 80 ? 'text-green-600' : healthPercentage >= 60 ? 'text-yellow-600' : 'text-red-600',
      bgColor: healthPercentage >= 80 ? 'bg-green-100' : healthPercentage >= 60 ? 'bg-yellow-100' : 'bg-red-100',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Grid */}
      <div className={LAYOUT_STYLES.STATS_GRID}>
        {statCards.map((stat, index) => (
          <div key={index} className={COMPONENT_STYLES.CARD_BASE}>
            <div className="flex items-center">
              <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Health Distribution */}
      <div className={COMPONENT_STYLES.CARD_BASE}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Distribution</h3>
        
        <div className="space-y-4">
          {/* Healthy Proxies */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{stats.healthyProxies}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.totalProxies > 0 ? (stats.healthyProxies / stats.totalProxies) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Warning Proxies */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{stats.warningProxies}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.totalProxies > 0 ? (stats.warningProxies / stats.totalProxies) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Error Proxies */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Error</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{stats.errorProxies}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.totalProxies > 0 ? (stats.errorProxies / stats.totalProxies) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={COMPONENT_STYLES.CARD_BASE}>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Proxy Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active:</span>
              <span className="font-medium text-green-600">{stats.activeProxies}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Inactive:</span>
              <span className="font-medium text-gray-600">{stats.totalProxies - stats.activeProxies}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Utilization:</span>
              <span className="font-medium text-blue-600">{Math.round(activePercentage)}%</span>
            </div>
          </div>
        </div>

        <div className={COMPONENT_STYLES.CARD_BASE}>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Stream Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Streams:</span>
              <span className="font-medium text-blue-600">{stats.totalActiveStreams}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg per Proxy:</span>
              <span className="font-medium text-gray-600">
                {stats.activeProxies > 0 ? (stats.totalActiveStreams / stats.activeProxies).toFixed(1) : '0'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Bandwidth:</span>
              <span className="font-medium text-purple-600">{formatBandwidth(stats.totalBandwidthUsage)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactSystemOverview({ stats, loading = false }: SystemOverviewProps) {
  if (loading || !stats) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-16 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.totalProxies}</div>
        <div className="text-xs text-gray-500">Total Proxies</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.totalActiveStreams}</div>
        <div className="text-xs text-gray-500">Active Streams</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{formatBandwidth(stats.totalBandwidthUsage)}</div>
        <div className="text-xs text-gray-500">Bandwidth</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {stats.totalProxies > 0 ? Math.round((stats.healthyProxies / stats.totalProxies) * 100) : 0}%
        </div>
        <div className="text-xs text-gray-500">Healthy</div>
      </div>
    </div>
  );
}