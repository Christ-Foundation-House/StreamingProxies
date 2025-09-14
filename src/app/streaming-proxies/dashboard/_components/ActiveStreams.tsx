'use client';

import { useState } from 'react';
import { StreamingSession, SessionStatus } from '@/lib/streaming-proxies/types';
import { formatStreamDuration, formatViewerCount, formatBytes } from '@/lib/streaming-proxies/utils/formatters';
import { COMPONENT_STYLES, SESSION_STATUS_STYLES } from '@/lib/streaming-proxies/utils/constants';
import { cn } from '@/lib/utils';
import { LoadingSpinner, ListLoadingSkeleton } from '../../_components/LoadingStates';

interface ActiveStreamsProps {
  sessions: StreamingSession[];
  loading?: boolean;
  onEndStream?: (sessionId: string) => void;
  className?: string;
}

export default function ActiveStreams({ 
  sessions, 
  loading = false, 
  onEndStream,
  className 
}: ActiveStreamsProps) {
  const [endingStreams, setEndingStreams] = useState<Set<string>>(new Set());

  const activeSessions = sessions.filter(session => session.status === SessionStatus.ACTIVE);

  const handleEndStream = async (sessionId: string) => {
    if (!onEndStream) return;

    setEndingStreams(prev => new Set(prev).add(sessionId));
    try {
      await onEndStream(sessionId);
    } finally {
      setEndingStreams(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  if (loading) {
    return <ListLoadingSkeleton count={3} className={className} />;
  }

  if (activeSessions.length === 0) {
    return (
      <div className={cn(COMPONENT_STYLES.CARD_BASE, className)}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Streams</h3>
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-900">No Active Streams</h4>
          <p className="text-sm text-gray-500 mt-1">All streaming sessions have ended</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(COMPONENT_STYLES.CARD_BASE, className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Streams</h3>
        <span className="text-sm text-gray-500">
          {activeSessions.length} active
        </span>
      </div>

      <div className="space-y-3">
        {activeSessions.map((session) => (
          <div
            key={session.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    Stream {session.streamKey}
                  </h4>
                  <span className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    SESSION_STATUS_STYLES[session.status]
                  )}>
                    Live
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <div className="font-medium text-gray-900">
                      {formatStreamDuration(session.startedAt)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Viewers:</span>
                    <div className="font-medium text-gray-900">
                      {formatViewerCount(session.peakViewers)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Data:</span>
                    <div className="font-medium text-gray-900">
                      {formatBytes(session.totalDataTransferred)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Fellowship:</span>
                    <div className="font-medium text-gray-900 truncate">
                      {session.fellowshipId}
                    </div>
                  </div>
                </div>
              </div>

              {onEndStream && (
                <div className="ml-4">
                  <button
                    onClick={() => handleEndStream(session.id)}
                    disabled={endingStreams.has(session.id)}
                    className={cn(
                      COMPONENT_STYLES.BUTTON_DANGER,
                      'text-sm',
                      endingStreams.has(session.id) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {endingStreams.has(session.id) ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'End Stream'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Progress indicators */}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Broadcasting</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Proxy: {session.proxyId}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {activeSessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-gray-900">
                {activeSessions.reduce((sum, session) => sum + session.peakViewers, 0)}
              </div>
              <div className="text-gray-500">Total Viewers</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {formatBytes(activeSessions.reduce((sum, session) => sum + session.totalDataTransferred, 0))}
              </div>
              <div className="text-gray-500">Total Data</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {Math.round(activeSessions.reduce((sum, session) => {
                  const duration = (Date.now() - session.startedAt.getTime()) / (1000 * 60);
                  return sum + duration;
                }, 0) / activeSessions.length)}m
              </div>
              <div className="text-gray-500">Avg Duration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactActiveStreams({ 
  sessions, 
  loading = false,
  className 
}: {
  sessions: StreamingSession[];
  loading?: boolean;
  className?: string;
}) {
  const activeSessions = sessions.filter(session => session.status === SessionStatus.ACTIVE);

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSessions.length === 0) {
    return (
      <div className={cn('text-center py-4', className)}>
        <p className="text-sm text-gray-500">No active streams</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {activeSessions.slice(0, 5).map((session) => (
        <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900 truncate">
              {session.streamKey}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {formatStreamDuration(session.startedAt)}
          </div>
        </div>
      ))}
      
      {activeSessions.length > 5 && (
        <div className="text-center">
          <span className="text-xs text-gray-500">
            +{activeSessions.length - 5} more streams
          </span>
        </div>
      )}
    </div>
  );
}

// Stream status indicator
export function StreamStatusIndicator({ 
  session,
  showDetails = false 
}: { 
  session: StreamingSession;
  showDetails?: boolean;
}) {
  const isActive = session.status === SessionStatus.ACTIVE;
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'w-2 h-2 rounded-full',
        isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
      )} />
      
      {showDetails && (
        <div className="text-xs text-gray-500">
          {isActive ? (
            <span>Live • {formatStreamDuration(session.startedAt)}</span>
          ) : (
            <span>Ended • {session.durationMinutes}m</span>
          )}
        </div>
      )}
    </div>
  );
}