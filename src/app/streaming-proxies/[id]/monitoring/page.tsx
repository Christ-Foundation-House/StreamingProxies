import { notFound } from 'next/navigation';
import { getProxyById } from '@/lib/streaming-proxies/data';
import BandwidthChart from '../../_components/BandwidthChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ProxyMonitoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proxy = await getProxyById(id);

  if (!proxy) {
    notFound();
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proxy = await getProxyById(id);
  
  return {
    title: `${proxy?.name || 'Proxy'} Monitoring`,
  };
}
