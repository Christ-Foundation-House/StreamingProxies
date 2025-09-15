'use client';

import { useState } from 'react';
import { 
  ProxyCardSkeleton,
  ProxyGridSkeleton,
  SystemStatsSkeleton,
  SessionListSkeleton,
  QuickActionsSkeleton,
  BandwidthChartSkeleton,
  MonitoringPageSkeleton,
  TableSkeleton,
  ChartSkeleton,
  InlineLoadingSpinner,
  ButtonLoadingSpinner,
  LoadingDots,
  LoadingText,
  LoadingState,
  ProgressiveLoading,
  ConditionalLoading
} from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function TestLoadingStatesPage() {
  const [loading, setLoading] = useState(true);
  const [progressiveDemo, setProgressiveDemo] = useState(false);

  const toggleLoading = () => setLoading(!loading);
  const toggleProgressive = () => setProgressiveDemo(!progressiveDemo);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading States Test Page</h1>
          <p className="text-gray-600 mb-6">
            This page demonstrates all the enhanced loading states and skeleton components.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={toggleLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Show Content' : 'Show Loading'}
            </button>
            <button
              onClick={toggleProgressive}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Test Progressive Loading
            </button>
          </div>
        </div>

        {/* Inline Loading Components */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Inline Loading Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Loading Spinners</h3>
              <div className="flex items-center gap-4">
                <InlineLoadingSpinner size="sm" />
                <InlineLoadingSpinner size="md" />
                <InlineLoadingSpinner size="lg" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Button Loading</h3>
              <div className="flex items-center gap-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <ButtonLoadingSpinner />
                  Loading...
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Loading Dots</h3>
              <LoadingDots />
            </div>
          </div>
        </div>

        {/* Skeleton Variants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skeleton Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Default</h3>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Shimmer</h3>
              <Skeleton variant="shimmer" className="h-4 w-full" />
              <Skeleton variant="shimmer" className="h-6 w-3/4" />
              <Skeleton variant="shimmer" className="h-8 w-1/2" />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Wave</h3>
              <Skeleton variant="wave" className="h-4 w-full" />
              <Skeleton variant="wave" className="h-6 w-3/4" />
              <Skeleton variant="wave" className="h-8 w-1/2" />
            </div>
          </div>
        </div>

        {/* Progressive Loading Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progressive Loading</h2>
          <ProgressiveLoading
            loading={progressiveDemo}
            skeleton={<ProxyCardSkeleton />}
            delay={500}
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800">Content Loaded!</h3>
              <p className="text-green-600">This content appeared after the progressive loading delay.</p>
            </div>
          </ProgressiveLoading>
        </div>

        {/* System Stats Skeleton */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">System Stats</h2>
          <ConditionalLoading
            loading={loading}
            skeleton={<SystemStatsSkeleton />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <div className="h-6 w-6 bg-blue-600 rounded" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500">Metric {i + 1}</p>
                      <p className="text-2xl font-semibold text-gray-900">{Math.floor(Math.random() * 100)}</p>
                      <p className="text-xs text-gray-500">Sample data</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ConditionalLoading>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <ConditionalLoading
            loading={loading}
            skeleton={<QuickActionsSkeleton />}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {['Start Stream', 'Refresh Data', 'Create Proxy', 'View Analytics', 'Kill All'].map((action) => (
                  <button
                    key={action}
                    className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-5 w-5 bg-blue-600 rounded" />
                    <span className="text-sm font-medium">{action}</span>
                  </button>
                ))}
              </div>
            </div>
          </ConditionalLoading>
        </div>

        {/* Proxy Grid Skeleton */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Proxy Grid</h2>
          <ConditionalLoading
            loading={loading}
            skeleton={<ProxyGridSkeleton count={6} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-green-500 rounded-full" />
                      <h3 className="text-lg font-semibold">Proxy {i + 1}</h3>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium">US-East</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Streams:</span>
                      <span className="font-medium">{Math.floor(Math.random() * 10)} / 10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ConditionalLoading>
        </div>

        {/* Session List Skeleton */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Sessions</h2>
          <ConditionalLoading
            loading={loading}
            skeleton={<SessionListSkeleton count={3} />}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Streams</h3>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Stream {i + 1}</h4>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Live
                        </span>
                      </div>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                        End Stream
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ConditionalLoading>
        </div>

        {/* Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Bandwidth Chart</h2>
            <ConditionalLoading
              loading={loading}
              skeleton={<BandwidthChartSkeleton />}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bandwidth Usage</h3>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">Chart would be here</p>
                </div>
              </div>
            </ConditionalLoading>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Generic Chart</h2>
            <ConditionalLoading
              loading={loading}
              skeleton={<ChartSkeleton />}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">Chart would be here</p>
                </div>
              </div>
            </ConditionalLoading>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Data Table</h2>
          <ConditionalLoading
            loading={loading}
            skeleton={<TableSkeleton rows={5} columns={5} />}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Streams</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">Proxy {i + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">US-East</td>
                      <td className="px-6 py-4 whitespace-nowrap">{Math.floor(Math.random() * 10)}/10</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-800">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ConditionalLoading>
        </div>

        {/* Generic Loading State Component */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Generic Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Dashboard Overview</h3>
              <LoadingState type="dashboard" />
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Monitoring Page</h3>
              <LoadingState type="monitoring" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}