'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Play, Server, Users, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export default function StartStream() {
  const router = useRouter();
  const [selectedProxy, setSelectedProxy] = useState('');
  const [streamConfig, setStreamConfig] = useState({
    title: '',
    description: '',
    fellowshipId: '',
    streamKey: '',
    maxViewers: 1000,
    recordStream: true,
    enableChat: true,
    isPrivate: false
  });
  const [isStarting, setIsStarting] = useState(false);

  // Available proxies - loaded from API
  const [availableProxies, setAvailableProxies] = useState<Array<{
    id: string;
    name: string;
    location: string;
    status: string;
    currentStreams: number;
    maxStreams: number;
    latency: string;
    bandwidth: string;
  }>>([]);
  const [loadingProxies, setLoadingProxies] = useState(true);

  // Load available proxies
  useEffect(() => {
    const loadProxies = async () => {
      try {
        const response = await fetch('/api/streaming-proxies?status=active');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAvailableProxies(data.data.map((proxy: any) => ({
              id: proxy.id,
              name: proxy.name,
              location: proxy.serverLocation,
              status: proxy.status,
              currentStreams: proxy.currentActiveStreams,
              maxStreams: proxy.maxConcurrentStreams,
              latency: `${Math.floor(Math.random() * 50) + 10}ms`, // Would come from health checks
              bandwidth: `${proxy.bandwidthUsed || 0} Mbps`
            })));
          }
        }
      } catch (error) {
        console.error('Failed to load available proxies:', error);
      } finally {
        setLoadingProxies(false);
      }
    };

    loadProxies();
  }, []);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setStreamConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleStartStream = async () => {
    if (!selectedProxy || !streamConfig.title || !streamConfig.fellowshipId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsStarting(true);
    
    try {
      const response = await fetch('/api/streaming-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proxyId: selectedProxy,
          fellowshipId: streamConfig.fellowshipId,
          title: streamConfig.title,
          description: streamConfig.description,
          streamKey: streamConfig.streamKey,
          maxViewers: streamConfig.maxViewers,
          recordStream: streamConfig.recordStream,
          enableChat: streamConfig.enableChat,
          isPrivate: streamConfig.isPrivate,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Stream started successfully!');
        router.push('/streaming-proxies/dashboard');
      } else {
        throw new Error(data.error || 'Failed to start stream');
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
      alert('Failed to start stream. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const getProxyUtilization = (proxy: typeof availableProxies[0]) => {
    return Math.round((proxy.currentStreams / proxy.maxStreams) * 100);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600';
    if (utilization >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/streaming-proxies/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Start New Stream</h1>
                <p className="text-sm text-gray-500">Configure and launch a new streaming session</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Proxy Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Select Streaming Proxy
            </h2>
            {loadingProxies ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : availableProxies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No active proxies available</p>
                <button
                  onClick={() => router.push('/streaming-proxies/admin/create')}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create a proxy first
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableProxies.map((proxy) => {
                const utilization = getProxyUtilization(proxy);
                const isSelected = selectedProxy === proxy.id;
                
                return (
                  <div
                    key={proxy.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProxy(proxy.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{proxy.name}</h3>
                      {isSelected && <CheckCircle className="h-5 w-5 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{proxy.location}</p>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Utilization:</span>
                        <span className={getUtilizationColor(utilization)}>
                          {utilization}% ({proxy.currentStreams}/{proxy.maxStreams})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Latency:</span>
                        <span className="text-gray-900">{proxy.latency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bandwidth:</span>
                        <span className="text-gray-900">{proxy.bandwidth}</span>
                      </div>
                    </div>
                    
                    {utilization >= 90 && (
                      <div className="mt-2 flex items-center text-xs text-red-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        High utilization
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            )}
          </Card>

          {/* Stream Configuration */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Stream Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream Title *
                  </label>
                  <input
                    type="text"
                    value={streamConfig.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Sunday Morning Service"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fellowship ID *
                  </label>
                  <input
                    type="text"
                    value={streamConfig.fellowshipId}
                    onChange={(e) => handleInputChange('fellowshipId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., fellowship-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream Key
                  </label>
                  <input
                    type="text"
                    value={streamConfig.streamKey}
                    onChange={(e) => handleInputChange('streamKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated if empty"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Viewers
                  </label>
                  <input
                    type="number"
                    value={streamConfig.maxViewers}
                    onChange={(e) => handleInputChange('maxViewers', parseInt(e.target.value))}
                    min="1"
                    max="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={streamConfig.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the stream"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="recordStream"
                      checked={streamConfig.recordStream}
                      onChange={(e) => handleInputChange('recordStream', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="recordStream" className="ml-2 text-sm text-gray-700">
                      Record stream for later viewing
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableChat"
                      checked={streamConfig.enableChat}
                      onChange={(e) => handleInputChange('enableChat', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableChat" className="ml-2 text-sm text-gray-700">
                      Enable live chat
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={streamConfig.isPrivate}
                      onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                      Private stream (invite only)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stream Preview/Summary */}
          {selectedProxy && streamConfig.title && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Stream Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Proxy:</span>
                  <span className="ml-2 text-blue-700">
                    {availableProxies.find(p => p.id === selectedProxy)?.name}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Title:</span>
                  <span className="ml-2 text-blue-700">{streamConfig.title}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Fellowship:</span>
                  <span className="ml-2 text-blue-700">{streamConfig.fellowshipId}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Max Viewers:</span>
                  <span className="ml-2 text-blue-700">{streamConfig.maxViewers}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/streaming-proxies/dashboard')}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleStartStream}
              disabled={!selectedProxy || !streamConfig.title || !streamConfig.fellowshipId || isStarting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isStarting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Stream...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Stream
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}