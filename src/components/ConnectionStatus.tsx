'use client';

import React, { useEffect, useState } from 'react';
import { ConnectionState, ConnectionStatus as ConnectionStatusType } from '@/lib/streaming-proxies/websocket-manager';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  showDetails?: boolean;
  className?: string;
}

export function ConnectionStatus({ 
  connectionState, 
  showDetails = false, 
  className = '' 
}: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        status: 'offline' as const,
        color: 'bg-gray-500',
        text: 'Offline',
        description: 'No internet connection',
      };
    }

    switch (connectionState.status) {
      case 'connected':
        return {
          status: 'connected' as const,
          color: 'bg-green-500',
          text: 'Connected',
          description: 'Real-time updates active',
        };
      case 'connecting':
        return {
          status: 'connecting' as const,
          color: 'bg-yellow-500',
          text: 'Connecting',
          description: 'Establishing connection...',
        };
      case 'error':
        return {
          status: 'error' as const,
          color: 'bg-red-500',
          text: 'Error',
          description: connectionState.error || 'Connection failed',
        };
      case 'disconnected':
      default:
        return {
          status: 'disconnected' as const,
          color: 'bg-gray-400',
          text: 'Disconnected',
          description: 'Using cached data',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const formatLastConnected = () => {
    if (!connectionState.lastConnected) return null;
    
    const now = new Date();
    const diff = now.getTime() - connectionState.lastConnected.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status indicator dot */}
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${statusInfo.color}`} />
        {statusInfo.status === 'connecting' && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${statusInfo.color} animate-ping`} />
        )}
      </div>

      {/* Status text */}
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {statusInfo.text}
      </span>

      {/* Detailed information */}
      {showDetails && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>{statusInfo.description}</div>
          {connectionState.lastConnected && statusInfo.status !== 'connected' && (
            <div>Last connected: {formatLastConnected()}</div>
          )}
          {connectionState.reconnectAttempts > 0 && (
            <div>Reconnect attempts: {connectionState.reconnectAttempts}</div>
          )}
        </div>
      )}
    </div>
  );
}

interface ConnectionBannerProps {
  connectionState: ConnectionState;
  onRetry?: () => void;
  className?: string;
}

export function ConnectionBanner({ 
  connectionState, 
  onRetry, 
  className = '' 
}: ConnectionBannerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Show banner when offline or connection has issues
    const shouldShow = !isOnline || 
                      connectionState.status === 'error' || 
                      (connectionState.status === 'disconnected' && connectionState.reconnectAttempts > 0);
    setIsVisible(shouldShow);
  }, [isOnline, connectionState]);

  if (!isVisible) return null;

  const getBannerInfo = () => {
    if (!isOnline) {
      return {
        type: 'offline' as const,
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-800 dark:text-gray-200',
        title: 'You are offline',
        message: 'Check your internet connection. Data may be outdated.',
        showRetry: false,
      };
    }

    if (connectionState.status === 'error') {
      return {
        type: 'error' as const,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        textColor: 'text-red-800 dark:text-red-200',
        title: 'Connection Error',
        message: connectionState.error || 'Unable to connect to real-time updates',
        showRetry: true,
      };
    }

    return {
      type: 'disconnected' as const,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      title: 'Connection Lost',
      message: 'Attempting to reconnect... Data may be outdated.',
      showRetry: true,
    };
  };

  const bannerInfo = getBannerInfo();

  return (
    <div className={`${bannerInfo.bgColor} border-l-4 border-current p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center ${bannerInfo.textColor}`}>
          <div className="flex-shrink-0">
            {bannerInfo.type === 'offline' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            )}
            {bannerInfo.type === 'error' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {bannerInfo.type === 'disconnected' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">{bannerInfo.title}</h3>
            <p className="text-sm">{bannerInfo.message}</p>
          </div>
        </div>

        {bannerInfo.showRetry && onRetry && (
          <button
            onClick={onRetry}
            className={`ml-4 px-3 py-1 text-sm font-medium rounded-md border ${bannerInfo.textColor} border-current hover:bg-current hover:bg-opacity-10 transition-colors`}
          >
            Retry
          </button>
        )}

        <button
          onClick={() => setIsVisible(false)}
          className={`ml-2 p-1 rounded-md ${bannerInfo.textColor} hover:bg-current hover:bg-opacity-10 transition-colors`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface OfflineModeIndicatorProps {
  isOffline: boolean;
  className?: string;
}

export function OfflineModeIndicator({ isOffline, className = '' }: OfflineModeIndicatorProps) {
  if (!isOffline) return null;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 ${className}`}>
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
      </svg>
      Offline Mode
    </div>
  );
}