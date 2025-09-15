'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: Date;
  key: string;
  ttl: number;
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

export interface UseAnalyticsCachingOptions {
  maxEntries?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
  enableStats?: boolean;
  enableCompression?: boolean;
}

export interface UseAnalyticsCachingReturn<T = any> {
  // Cache operations
  get: (key: string) => T | null;
  set: (key: string, data: T, ttl?: number) => void;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  clear: () => void;
  
  // Cache management
  cleanup: () => number;
  preload: (key: string, fetcher: () => Promise<T>, ttl?: number) => Promise<T>;
  invalidatePattern: (pattern: string | RegExp) => number;
  
  // Cache information
  size: number;
  stats: CacheStats;
  keys: string[];
  
  // Cache optimization
  optimize: () => void;
  export: () => string;
  import: (data: string) => boolean;
}

export function useAnalyticsCaching<T = any>(
  options: UseAnalyticsCachingOptions = {}
): UseAnalyticsCachingReturn<T> {
  const {
    maxEntries = 100,
    defaultTTL = 5 * 60 * 1000, // 5 minutes
    cleanupInterval = 60 * 1000, // 1 minute
    enableStats = true,
    enableCompression = false,
  } = options;

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const statsRef = useRef({
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  });

  const [size, setSize] = useState(0);

  // Update size when cache changes
  const updateSize = useCallback(() => {
    setSize(cacheRef.current.size);
  }, []);

  // Check if entry is expired
  const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp.getTime() > entry.ttl;
  }, []);

  // Compress data if enabled
  const compressData = useCallback((data: T): T => {
    if (!enableCompression) return data;
    
    try {
      // Simple JSON compression - in production you might use a proper compression library
      const jsonString = JSON.stringify(data);
      // This is a placeholder - implement actual compression if needed
      return data;
    } catch {
      return data;
    }
  }, [enableCompression]);

  // Decompress data if enabled
  const decompressData = useCallback((data: T): T => {
    if (!enableCompression) return data;
    
    try {
      // Placeholder for decompression
      return data;
    } catch {
      return data;
    }
  }, [enableCompression]);

  // Get item from cache
  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      if (enableStats) statsRef.current.misses++;
      return null;
    }
    
    if (isExpired(entry)) {
      cacheRef.current.delete(key);
      updateSize();
      if (enableStats) statsRef.current.misses++;
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = new Date();
    
    if (enableStats) statsRef.current.hits++;
    
    return decompressData(entry.data);
  }, [isExpired, updateSize, enableStats, decompressData]);

  // Set item in cache
  const set = useCallback((key: string, data: T, ttl: number = defaultTTL) => {
    // Remove oldest entries if at capacity
    if (cacheRef.current.size >= maxEntries && !cacheRef.current.has(key)) {
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());
      
      // Remove oldest 10% of entries
      const toRemove = Math.max(1, Math.floor(maxEntries * 0.1));
      for (let i = 0; i < toRemove; i++) {
        cacheRef.current.delete(entries[i][0]);
      }
    }
    
    const entry: CacheEntry<T> = {
      data: compressData(data),
      timestamp: new Date(),
      key,
      ttl,
      accessCount: 0,
      lastAccessed: new Date(),
    };
    
    cacheRef.current.set(key, entry);
    updateSize();
    
    if (enableStats) statsRef.current.sets++;
  }, [defaultTTL, maxEntries, updateSize, enableStats, compressData]);

  // Check if key exists in cache
  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;
    
    if (isExpired(entry)) {
      cacheRef.current.delete(key);
      updateSize();
      return false;
    }
    
    return true;
  }, [isExpired, updateSize]);

  // Delete item from cache
  const deleteItem = useCallback((key: string): boolean => {
    const deleted = cacheRef.current.delete(key);
    if (deleted) {
      updateSize();
      if (enableStats) statsRef.current.deletes++;
    }
    return deleted;
  }, [updateSize, enableStats]);

  // Clear entire cache
  const clear = useCallback(() => {
    cacheRef.current.clear();
    updateSize();
    
    if (enableStats) {
      statsRef.current = { hits: 0, misses: 0, sets: 0, deletes: 0 };
    }
  }, [updateSize, enableStats]);

  // Clean up expired entries
  const cleanup = useCallback((): number => {
    let removedCount = 0;
    const now = Date.now();
    
    const entries = Array.from(cacheRef.current.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        cacheRef.current.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      updateSize();
    }
    
    return removedCount;
  }, [updateSize]);

  // Preload data into cache
  const preload = useCallback(async (
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = defaultTTL
  ): Promise<T> => {
    // Check if already cached and not expired
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const data = await fetcher();
      set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`Failed to preload cache key "${key}":`, error);
      throw error;
    }
  }, [defaultTTL, get, set]);

  // Invalidate entries matching pattern
  const invalidatePattern = useCallback((pattern: string | RegExp): number => {
    let removedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    const keys = Array.from(cacheRef.current.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        cacheRef.current.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      updateSize();
    }
    
    return removedCount;
  }, [updateSize]);

  // Get cache statistics
  const stats: CacheStats = {
    totalEntries: cacheRef.current.size,
    totalSize: Array.from(cacheRef.current.values()).reduce((size, entry) => {
      return size + JSON.stringify(entry.data).length;
    }, 0),
    hitRate: enableStats ? 
      (statsRef.current.hits / (statsRef.current.hits + statsRef.current.misses)) * 100 || 0 : 0,
    missRate: enableStats ? 
      (statsRef.current.misses / (statsRef.current.hits + statsRef.current.misses)) * 100 || 0 : 0,
    oldestEntry: cacheRef.current.size > 0 ? 
      new Date(Math.min(...Array.from(cacheRef.current.values()).map(e => e.timestamp.getTime()))) : null,
    newestEntry: cacheRef.current.size > 0 ? 
      new Date(Math.max(...Array.from(cacheRef.current.values()).map(e => e.timestamp.getTime()))) : null,
  };

  // Get all cache keys
  const keys = Array.from(cacheRef.current.keys());

  // Optimize cache by removing least accessed items
  const optimize = useCallback(() => {
    if (cacheRef.current.size <= maxEntries * 0.8) return;
    
    const entries = Array.from(cacheRef.current.entries());
    entries.sort((a, b) => {
      // Sort by access count (ascending) and last accessed (ascending)
      const accessDiff = a[1].accessCount - b[1].accessCount;
      if (accessDiff !== 0) return accessDiff;
      return a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime();
    });
    
    // Remove bottom 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      cacheRef.current.delete(entries[i][0]);
    }
    
    updateSize();
  }, [maxEntries, updateSize]);

  // Export cache data
  const exportCache = useCallback((): string => {
    const exportData = {
      entries: Array.from(cacheRef.current.entries()),
      stats: statsRef.current,
      timestamp: new Date().toISOString(),
    };
    
    return JSON.stringify(exportData);
  }, []);

  // Import cache data
  const importCache = useCallback((data: string): boolean => {
    try {
      const importData = JSON.parse(data);
      
      if (!importData.entries || !Array.isArray(importData.entries)) {
        return false;
      }
      
      cacheRef.current.clear();
      
      for (const [key, entry] of importData.entries) {
        // Only import non-expired entries
        if (!isExpired(entry)) {
          cacheRef.current.set(key, entry);
        }
      }
      
      if (importData.stats) {
        statsRef.current = importData.stats;
      }
      
      updateSize();
      return true;
    } catch {
      return false;
    }
  }, [isExpired, updateSize]);

  // Set up cleanup interval
  useEffect(() => {
    if (cleanupInterval > 0) {
      const interval = setInterval(cleanup, cleanupInterval);
      return () => clearInterval(interval);
    }
  }, [cleanupInterval, cleanup]);

  // Initial size update
  useEffect(() => {
    updateSize();
  }, [updateSize]);

  return {
    // Cache operations
    get,
    set,
    has,
    delete: deleteItem,
    clear,
    
    // Cache management
    cleanup,
    preload,
    invalidatePattern,
    
    // Cache information
    size,
    stats,
    keys,
    
    // Cache optimization
    optimize,
    export: exportCache,
    import: importCache,
  };
}