'use client';

import React, { useState } from 'react';
import { 
  ConnectionStatus, 
  ConnectionBanner, 
  OfflineModeIndicator 
} from '@/components/ConnectionStatus';
import { 
  useRealTimeConnection, 
  useRealTimeData 
} from '@/lib/streaming-proxies';

export default function TestWebSocketPage() {
  const [showDetails, setShowDetails] = useState(true);
  
  // Test real-time connection
  const connection = useRealTimeConnection({
    autoConnect: true,
    fallbackToMock: true,
    wsConfig: {
      url: 'ws://localhost:8080', // This will likely fail, triggering fallback
      reconnectAttempts: 3,
      reconnectInterval: 2000,
    },
  });

  // Test real-time data
  const realTimeData = useRealTimeData({
    autoConnect: true,
    fallbackToMock: true,
  });

  const connectionInfo = connection.getConnectionInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            WebSocket Connection Test
          </h1>

          {/* Connection Banner */}
          <ConnectionBanner 
            connectionState={connection.connectionState}
            onRetry={connection.retry}
            className="mb-6"
          />

          {/* Connection Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Connection Status
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Basic Status:</span>
                  <ConnectionStatus 
                    connectionState={connection.connectionState}
                    showDetails={false}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Detailed Status:</span>
                  <ConnectionStatus 
                    connectionState={connection.connectionState}
                    showDetails={showDetails}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Offline Indicator:</span>
                  <OfflineModeIndicator isOffline={!connection.isOnline} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showDetails}
                    onChange={(e) => setShowDetails(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Show detailed status
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Connection Info
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {connectionInfo.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {connectionInfo.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Connected:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {connection.isConnected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Using Mock:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {connection.isUsingMockData ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Online:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {connection.isOnline ? 'Yes' : 'No'}
                  </span>
                </div>
                {connectionInfo.lastConnected && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Connected:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {connectionInfo.lastConnected.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reconnect Attempts:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {connectionInfo.reconnectAttempts}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Controls */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Connection Controls
            </h2>
            
            <div className="flex space-x-4">
              <button
                onClick={connection.connect}
                disabled={connection.isConnected}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect
              </button>
              
              <button
                onClick={connection.disconnect}
                disabled={!connection.isConnected}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
              
              <button
                onClick={connection.retry}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Retry
              </button>
            </div>
          </div>

          {/* Real-time Updates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Real-time Updates
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Update Statistics
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Updates:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {connection.updateCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Update:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {connection.lastUpdate ? connection.lastUpdate.type : 'None'}
                    </span>
                  </div>
                  {connection.lastUpdate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Timestamp:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(connection.lastUpdate.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Real-time Data
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Proxies:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {realTimeData.proxies.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Streams:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {realTimeData.stats?.totalActiveStreams || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Health Checks:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {realTimeData.healthChecks.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Update Details */}
          {connection.lastUpdate && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Last Update Details
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-900 dark:text-white overflow-x-auto">
                  {JSON.stringify(connection.lastUpdate, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}