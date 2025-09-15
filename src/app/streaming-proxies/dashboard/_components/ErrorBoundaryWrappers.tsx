'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DashboardSectionErrorFallback, ProxyGridErrorFallback, ProxyCardErrorFallback } from '@/components/error-fallbacks';
import { useRouter } from 'next/navigation';

// SystemOverview Error Boundary Wrapper
export function SystemOverviewErrorBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ErrorBoundary
      context="SystemOverview"
      fallback={(error, retry) => (
        <DashboardSectionErrorFallback
          error={error}
          retry={retry}
          sectionName="System Overview"
          onNavigateHome={() => router.push('/')}
          onOpenSettings={() => router.push('/streaming-proxies/admin')}
        />
      )}
      onError={(error, errorInfo) => {
        console.error('SystemOverview Error:', error, errorInfo);
        // Here you could send to error reporting service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// QuickActions Error Boundary Wrapper
export function QuickActionsErrorBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ErrorBoundary
      context="QuickActions"
      fallback={(error, retry) => (
        <DashboardSectionErrorFallback
          error={error}
          retry={retry}
          sectionName="Quick Actions"
          onNavigateHome={() => router.push('/')}
          onOpenSettings={() => router.push('/streaming-proxies/admin')}
        />
      )}
      onError={(error, errorInfo) => {
        console.error('QuickActions Error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// ActiveStreams Error Boundary Wrapper
export function ActiveStreamsErrorBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ErrorBoundary
      context="ActiveStreams"
      fallback={(error, retry) => (
        <DashboardSectionErrorFallback
          error={error}
          retry={retry}
          sectionName="Active Streams"
          onNavigateHome={() => router.push('/')}
          onOpenSettings={() => router.push('/streaming-proxies/admin')}
        />
      )}
      onError={(error, errorInfo) => {
        console.error('ActiveStreams Error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Proxy Grid Error Boundary Wrapper
export function ProxyGridErrorBoundary({ 
  children,
  onCreateProxy,
  onViewAllProxies
}: { 
  children: React.ReactNode;
  onCreateProxy?: () => void;
  onViewAllProxies?: () => void;
}) {
  return (
    <ErrorBoundary
      context="ProxyGrid"
      fallback={(error, retry) => (
        <ProxyGridErrorFallback
          error={error}
          retry={retry}
          onCreateProxy={onCreateProxy}
          onViewAllProxies={onViewAllProxies}
        />
      )}
      onError={(error, errorInfo) => {
        console.error('ProxyGrid Error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Individual Proxy Card Error Boundary Wrapper
export function ProxyCardErrorBoundary({ 
  children,
  proxyId,
  proxyName,
  onViewDetails,
  onRemoveFromGrid
}: { 
  children: React.ReactNode;
  proxyId?: string;
  proxyName?: string;
  onViewDetails?: () => void;
  onRemoveFromGrid?: () => void;
}) {
  return (
    <ErrorBoundary
      context={`ProxyCard-${proxyId || 'unknown'}`}
      fallback={(error, retry) => (
        <ProxyCardErrorFallback
          error={error}
          retry={retry}
          proxyId={proxyId}
          proxyName={proxyName}
          onViewDetails={onViewDetails}
          onRemoveFromGrid={onRemoveFromGrid}
        />
      )}
      onError={(error, errorInfo) => {
        console.error(`ProxyCard Error (${proxyId}):`, error, errorInfo);
      }}
      maxRetries={2} // Limit retries for individual cards
      retryDelay={500} // Faster retry for cards
    >
      {children}
    </ErrorBoundary>
  );
}