'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Settings, 
  Activity, 
  Users, 
  Wifi, 
  Server,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useStreamingProxies } from '@/lib/streaming-proxies/hooks/useStreamingProxies';
import { useStreamingSessions } from '@/lib/streaming-proxies/hooks/useStreamingSessions';
import { StreamingProxy } from '@/lib/streaming-proxies/types';
import { ProxyCardSkeleton } from '@/components/ui/loading-skeletons';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ProxyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const proxyId = params.id as string;

  const { proxies, loading: proxiesLoading, error: proxiesError } = useStreamingProxies();
  const { sessions, loading: sessionsLoading } = useStreamingSessions({
    autoRefresh: true,
    refreshInterval: 10000
  });

  const [proxy, setProxy] = useState<StreamingProxy | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!proxiesLoading && proxies.length > 0) {
      const foundProxy = proxies.find(p => p.id === proxyId);
      if (foundProxy) {
        setProxy(foundProxy);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    }
  }, [proxies, proxyId, proxiesLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (proxiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ProxyCardSkeleton />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proxy Not Found</h1>
          <p className="text-gray-600 mb-4">The requested proxy could not be found.</p>
          <Button onClick={() => router.push('/streaming-proxies/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!proxy) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/streaming-proxies/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{proxy.name}</h1>
            <p className="text-gray-600">{proxy.serverLocation}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Proxy Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(proxy.status)}`}>
                      {proxy.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="text-gray-900">{proxy.serverLocation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Health</span>
                    <span className="text-gray-900">{proxy.healthStatus}</span>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}