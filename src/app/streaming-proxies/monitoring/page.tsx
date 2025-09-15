'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProxyById } from '@/lib/streaming-proxies/data';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Skeleton from '@/components/ui/skeleton';

import React from 'react';
import { StreamingProxy } from '@/lib/streaming-proxies/types';

// Define the props type for BandwidthChart
interface BandwidthChartProps {
  proxy: StreamingProxy;
  timeRange?: '1h' | '24h' | '7d' | '30d';
  className?: string;
  onRefresh?: () => void;
}

// Dynamically import BandwidthChart with no SSR to avoid hydration issues
const BandwidthChart = dynamic<BandwidthChartProps>(
  () => import('../_components/BandwidthChart').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
) as React.ComponentType<BandwidthChartProps>;

export default function SystemMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // This is a system-wide monitoring page, not for a specific proxy
    // You could load system-wide stats here
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {error}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Failed to load system monitoring data.
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            System-wide monitoring and analytics
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/streaming-proxies/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance" disabled>
            Performance
          </TabsTrigger>
          <TabsTrigger value="errors" disabled>
            Errors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-2">Total Proxies</h3>
              <p className="text-3xl font-bold text-blue-600">--</p>
              <p className="text-sm text-gray-500">System monitoring coming soon</p>
            </div>
            <div className="p-6 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-2">Active Streams</h3>
              <p className="text-3xl font-bold text-green-600">--</p>
              <p className="text-sm text-gray-500">Real-time monitoring</p>
            </div>
            <div className="p-6 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-2">System Health</h3>
              <p className="text-3xl font-bold text-yellow-600">--</p>
              <p className="text-sm text-gray-500">Health checks</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Note: generateMetadata is not available in client components
// The title will be set dynamically via document.title or next/head if needed
