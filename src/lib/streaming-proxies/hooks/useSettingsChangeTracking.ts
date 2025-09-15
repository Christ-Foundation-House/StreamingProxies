'use client';

import { useState, useCallback, useEffect } from 'react';

interface SettingChange {
  key: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  description?: string;
}

interface UseSettingsChangeTrackingReturn {
  changes: Record<string, SettingChange>;
  trackChange: (key: string, oldValue: any, newValue: any, description?: string) => void;
  clearChange: (key: string) => void;
  clearAllChanges: () => void;
  hasChanges: boolean;
  changeCount: number;
  getChangesArray: () => SettingChange[];
  getChangesByCategory: (categoryId: string, settings: Record<string, any>) => SettingChange[];
  undoChange: (key: string) => any;
  getChangeDescription: (key: string) => string;
}

export function useSettingsChangeTracking(): UseSettingsChangeTrackingReturn {
  const [changes, setChanges] = useState<Record<string, SettingChange>>({});

  const trackChange = useCallback((
    key: string, 
    oldValue: any, 
    newValue: any, 
    description?: string
  ) => {
    // Don't track if values are the same
    if (oldValue === newValue) {
      // Remove existing change if values are now the same
      setChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[key];
        return newChanges;
      });
      return;
    }

    setChanges(prev => ({
      ...prev,
      [key]: {
        key,
        oldValue,
        newValue,
        timestamp: new Date(),
        description
      }
    }));
  }, []);

  const clearChange = useCallback((key: string) => {
    setChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[key];
      return newChanges;
    });
  }, []);

  const clearAllChanges = useCallback(() => {
    setChanges({});
  }, []);

  const getChangesArray = useCallback((): SettingChange[] => {
    return Object.values(changes).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [changes]);

  const getChangesByCategory = useCallback((
    categoryId: string, 
    settings: Record<string, any>
  ): SettingChange[] => {
    return Object.values(changes).filter(change => {
      const setting = settings[change.key];
      return setting && setting.category === categoryId;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [changes]);

  const undoChange = useCallback((key: string): any => {
    const change = changes[key];
    if (change) {
      clearChange(key);
      return change.oldValue;
    }
    return undefined;
  }, [changes, clearChange]);

  const getChangeDescription = useCallback((key: string): string => {
    const change = changes[key];
    if (!change) return '';

    const settingName = key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || key;
    
    const formatValue = (value: any): string => {
      if (typeof value === 'boolean') {
        return value ? 'Enabled' : 'Disabled';
      }
      if (value === null || value === undefined || value === '') {
        return '(empty)';
      }
      if (typeof value === 'string' && value.length > 50) {
        return value.substring(0, 47) + '...';
      }
      return String(value);
    };

    return `${settingName}: ${formatValue(change.oldValue)} → ${formatValue(change.newValue)}`;
  }, [changes]);

  const hasChanges = Object.keys(changes).length > 0;
  const changeCount = Object.keys(changes).length;

  // Auto-cleanup old changes (optional - remove changes older than 1 hour)
  useEffect(() => {
    const cleanup = () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      setChanges(prev => {
        const filtered = Object.fromEntries(
          Object.entries(prev).filter(([_, change]) => change.timestamp > oneHourAgo)
        );
        return filtered;
      });
    };

    const interval = setInterval(cleanup, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    changes,
    trackChange,
    clearChange,
    clearAllChanges,
    hasChanges,
    changeCount,
    getChangesArray,
    getChangesByCategory,
    undoChange,
    getChangeDescription,
  };
}