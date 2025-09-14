import { notFound } from 'next/navigation';
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

export default async function ProxyMonitoringPage({
  params,
}: {
  params: { id: string };
}) {
  let proxy;
  
  try {
    proxy = await getProxyById(params.id);
    
    if (!proxy) {
      notFound();
    }
  } catch (error) {
    console.error('Error fetching proxy data:', error);
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-2">Failed to load proxy data</h1>
        <p className="text-gray-600 mb-6">
          We couldn't load the monitoring data for this proxy. Please try again later.
        </p>
        <Button asChild>
          <Link href="/streaming-proxies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proxies
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proxy Monitoring</h1>
          <p className="text-muted-foreground">
            Detailed analytics for {proxy.name || `Proxy ${proxy.id}`}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/streaming-proxies/${proxy.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proxy
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="bandwidth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
          <TabsTrigger value="requests" disabled>
            Requests
          </TabsTrigger>
          <TabsTrigger value="errors" disabled>
            Errors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bandwidth" className="space-y-4">
          <BandwidthChart 
            proxy={proxy} 
            timeRange="24h"
            className="mb-8"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Last Hour</h3>
              <BandwidthChart 
                proxy={proxy} 
                timeRange="1h"
                className="h-64"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Last 7 Days</h3>
              <BandwidthChart 
                proxy={proxy} 
                timeRange="7d"
                className="h-64"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const proxy = await getProxyById(params.id);
  
  return {
    title: `${proxy?.name || 'Proxy'} Monitoring`,
  };
}
