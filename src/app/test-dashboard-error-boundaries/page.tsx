'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  SystemOverviewErrorBoundary,
  QuickActionsErrorBoundary,
  ActiveStreamsErrorBoundary,
  ProxyGridErrorBoundary,
  ProxyCardErrorBoundary
} from '../streaming-proxies/dashboard/_components/ErrorBoundaryWrappers';

// Test components that throw errors
function ErrorThrowingSystemOverview({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('SystemOverview test error: Failed to load system statistics');
  }
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">System Overview</h3>
      <p>System is running normally</p>
    </Card>
  );
}

function ErrorThrowingQuickActions({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('QuickActions test error: Action buttons failed to render');
  }
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
      <div className="flex gap-2">
        <Button>Start Stream</Button>
        <Button variant="outline">Refresh</Button>
      </div>
    </Card>
  );
}

function ErrorThrowingActiveStreams({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('ActiveStreams test error: Failed to fetch streaming sessions');
  }
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Active Streams</h3>
      <p>No active streams</p>
    </Card>
  );
}

function ErrorThrowingProxyGrid({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('ProxyGrid test error: Network connection failed while loading proxies');
  }
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Proxy Grid</h3>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-2">Proxy 1</Card>
        <Card className="p-2">Proxy 2</Card>
      </div>
    </Card>
  );
}

function ErrorThrowingProxyCard({ shouldError, proxyId }: { shouldError: boolean; proxyId: string }) {
  if (shouldError) {
    throw new Error(`ProxyCard test error: Failed to render proxy ${proxyId} data`);
  }
  return (
    <Card className="p-4">
      <h4 className="font-medium">Proxy {proxyId}</h4>
      <p className="text-sm text-gray-600">Status: Active</p>
    </Card>
  );
}

export default function TestDashboardErrorBoundaries() {
  const [errorStates, setErrorStates] = useState({
    systemOverview: false,
    quickActions: false,
    activeStreams: false,
    proxyGrid: false,
    proxyCard1: false,
    proxyCard2: false,
  });

  const toggleError = (component: keyof typeof errorStates) => {
    setErrorStates(prev => ({
      ...prev,
      [component]: !prev[component]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard Error Boundaries Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the error boundaries for each dashboard section by clicking the buttons below to trigger errors.
          </p>

          {/* Error Toggle Controls */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Error Controls</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                onClick={() => toggleError('systemOverview')}
                variant={errorStates.systemOverview ? 'destructive' : 'outline'}
                className="w-full"
              >
                {errorStates.systemOverview ? 'Fix' : 'Break'} System Overview
              </Button>
              <Button
                onClick={() => toggleError('quickActions')}
                variant={errorStates.quickActions ? 'destructive' : 'outline'}
                className="w-full"
              >
                {errorStates.quickActions ? 'Fix' : 'Break'} Quick Actions
              </Button>
              <Button
                onClick={() => toggleError('activeStreams')}
                variant={errorStates.activeStreams ? 'destructive' : 'outline'}
                className="w-full"
              >
                {errorStates.activeStreams ? 'Fix' : 'Break'} Active Streams
              </Button>
              <Button
                onClick={() => toggleError('proxyGrid')}
                variant={errorStates.proxyGrid ? 'destructive' : 'outline'}
                className="w-full"
              >
                {errorStates.proxyGrid ? 'Fix' : 'Break'} Proxy Grid
              </Button>
              <Button
                onClick={() => toggleError('proxyCard1')}
                variant={errorStates.proxyCard1 ? 'destructive' : 'outline'}
                className="w-full"
              >
                {errorStates.proxyCard1 ? 'Fix' : 'Break'} Proxy Card 1
              </Button>
              <Button
                onClick={() => toggleError('proxyCard2')}
                variant={errorStates.proxyCard2 ? 'destructive' : 'outline'}
                className="w-full"
              >
                {errorStates.proxyCard2 ? 'Fix' : 'Break'} Proxy Card 2
              </Button>
            </div>
          </Card>
        </div>

        {/* Dashboard Sections with Error Boundaries */}
        <div className="space-y-8">
          {/* System Overview */}
          <SystemOverviewErrorBoundary>
            <ErrorThrowingSystemOverview shouldError={errorStates.systemOverview} />
          </SystemOverviewErrorBoundary>

          {/* Quick Actions */}
          <QuickActionsErrorBoundary>
            <ErrorThrowingQuickActions shouldError={errorStates.quickActions} />
          </QuickActionsErrorBoundary>

          {/* Active Streams */}
          <ActiveStreamsErrorBoundary>
            <ErrorThrowingActiveStreams shouldError={errorStates.activeStreams} />
          </ActiveStreamsErrorBoundary>

          {/* Proxy Grid */}
          <ProxyGridErrorBoundary
            onCreateProxy={() => alert('Create proxy clicked')}
            onViewAllProxies={() => alert('View all proxies clicked')}
          >
            <ErrorThrowingProxyGrid shouldError={errorStates.proxyGrid} />
          </ProxyGridErrorBoundary>

          {/* Individual Proxy Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Individual Proxy Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProxyCardErrorBoundary
                proxyId="proxy-1"
                proxyName="Test Proxy 1"
                onViewDetails={() => alert('View details for proxy-1')}
                onRemoveFromGrid={() => alert('Remove proxy-1 from grid')}
              >
                <ErrorThrowingProxyCard shouldError={errorStates.proxyCard1} proxyId="1" />
              </ProxyCardErrorBoundary>

              <ProxyCardErrorBoundary
                proxyId="proxy-2"
                proxyName="Test Proxy 2"
                onViewDetails={() => alert('View details for proxy-2')}
                onRemoveFromGrid={() => alert('Remove proxy-2 from grid')}
              >
                <ErrorThrowingProxyCard shouldError={errorStates.proxyCard2} proxyId="2" />
              </ProxyCardErrorBoundary>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Click any "Break" button to trigger an error in that section</p>
            <p>2. Observe that only that section shows an error fallback, while other sections continue to work</p>
            <p>3. Try the "Reload Section" button in the error fallback to recover</p>
            <p>4. Click "Fix" to stop the error and see the section return to normal</p>
            <p>5. Test multiple sections at once to verify isolation</p>
          </div>
        </Card>
      </div>
    </div>
  );
}