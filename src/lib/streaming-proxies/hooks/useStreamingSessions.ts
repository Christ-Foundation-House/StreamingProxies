'use client';

import { useState, useEffect, useCallback } from 'react';
import { StreamingSession, SessionStatus, ApiResponse } from '../types';
import { apiClient } from '../api-client';

export interface UseStreamingSessionsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeInactive?: boolean;
}

export interface UseStreamingSessionsReturn {
  sessions: StreamingSession[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  startSession: (config: {
    proxyId: string;
    fellowshipId: string;
    streamKey?: string;
    title?: string;
  }) => Promise<StreamingSession>;
  updateSession: (sessionId: string, updates: Partial<StreamingSession>) => void;
}

export function useStreamingSessions(
  options: UseStreamingSessionsOptions = {}
): UseStreamingSessionsReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    includeInactive = false,
  } = options;

  const [sessions, setSessions] = useState<StreamingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.getSessions();
      
      if (response.success && response.data) {
        setSessions(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch streaming sessions:', err);
      
      // In production, don't show sessions if API fails
      if (process.env.NODE_ENV === 'production') {
        setSessions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchSessions();
  }, [fetchSessions]);

  const endSession = useCallback(async (sessionId: string) => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(`/streaming-sessions/${sessionId}/end`);
      
      if (response.success) {
        // Update local state
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: SessionStatus.ENDED, endedAt: new Date() }
            : session
        ));
      } else {
        throw new Error(response.message || 'Failed to end session');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      console.error('Failed to end streaming session:', err);
      throw new Error(errorMessage);
    }
  }, []);

  const startSession = useCallback(async (config: {
    proxyId: string;
    fellowshipId: string;
    streamKey?: string;
    title?: string;
  }) => {
    try {
      const response = await apiClient.post<ApiResponse<StreamingSession>>('/streaming-sessions', config);
      
      if (response.success && response.data) {
        const newSession = response.data;
        setSessions(prev => [...prev, newSession]);
        return newSession;
      } else {
        throw new Error(response.message || 'Failed to start session');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      console.error('Failed to start streaming session:', err);
      throw new Error(errorMessage);
    }
  }, []);

  const updateSession = useCallback((sessionId: string, updates: Partial<StreamingSession>) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates, updatedAt: new Date() }
        : session
    ));
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        fetchSessions();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refresh,
    endSession,
    startSession,
    updateSession,
  };
}