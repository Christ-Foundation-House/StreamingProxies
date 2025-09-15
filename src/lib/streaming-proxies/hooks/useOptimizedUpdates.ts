'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook for batching and debouncing state updates to prevent UI thrashing
 */
export function useDebounce<T>(
  callback: (value: T) => void,
  delay: number = 100
): (value: T) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((value: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(value);
    }, delay);
  }, [delay]);
}

/**
 * Hook for batching multiple updates together
 */
export function useBatchedUpdates<T>(
  callback: (updates: T[]) => void,
  options: {
    batchDelay?: number;
    maxBatchSize?: number;
  } = {}
): (update: T) => void {
  const { batchDelay = 50, maxBatchSize = 10 } = options;
  
  const batchRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const flushBatch = useCallback(() => {
    if (batchRef.current.length > 0) {
      callbackRef.current(batchRef.current);
      batchRef.current = [];
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      flushBatch();
    };
  }, [flushBatch]);

  return useCallback((update: T) => {
    batchRef.current.push(update);

    // Flush immediately if batch is full
    if (batchRef.current.length >= maxBatchSize) {
      flushBatch();
      return;
    }

    // Set timeout if not already set
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(flushBatch, batchDelay);
    }
  }, [batchDelay, maxBatchSize, flushBatch]);
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      return callbackRef.current(...args);
    } else {
      // Schedule the call for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callbackRef.current(...args);
      }, delay - (now - lastCallRef.current));
    }
  }, [delay]) as T;
}

/**
 * Hook for preventing unnecessary re-renders by comparing values
 */
export function useStableValue<T>(
  value: T,
  compareFn?: (prev: T, next: T) => boolean
): T {
  const ref = useRef<T>(value);
  
  const defaultCompare = useCallback((prev: T, next: T) => {
    // Deep comparison for objects and arrays
    if (typeof prev === 'object' && typeof next === 'object') {
      if (prev === null || next === null) return prev === next;
      if (Array.isArray(prev) && Array.isArray(next)) {
        return prev.length === next.length && prev.every((item, index) => item === next[index]);
      }
      // Simple object comparison (shallow)
      const prevKeys = Object.keys(prev as any);
      const nextKeys = Object.keys(next as any);
      return prevKeys.length === nextKeys.length && 
             prevKeys.every(key => (prev as any)[key] === (next as any)[key]);
    }
    return prev === next;
  }, []);

  const compare = compareFn || defaultCompare;
  
  if (!compare(ref.current, value)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Hook for optimizing list updates by tracking changes
 */
export function useOptimizedList<T extends { id: string }>(
  items: T[],
  options: {
    trackChanges?: boolean;
    maxChangeHistory?: number;
  } = {}
): {
  items: T[];
  changes: {
    added: T[];
    updated: T[];
    removed: string[];
  };
  clearChanges: () => void;
} {
  const { trackChanges = false, maxChangeHistory = 100 } = options;
  
  const prevItemsRef = useRef<T[]>([]);
  const changesRef = useRef<{
    added: T[];
    updated: T[];
    removed: string[];
  }>({ added: [], updated: [], removed: [] });

  const changes = trackChanges ? (() => {
    const prevItems = prevItemsRef.current;
    const prevItemsMap = new Map(prevItems.map(item => [item.id, item]));
    const currentItemsMap = new Map(items.map(item => [item.id, item]));

    const added: T[] = [];
    const updated: T[] = [];
    const removed: string[] = [];

    // Find added and updated items
    items.forEach(item => {
      const prevItem = prevItemsMap.get(item.id);
      if (!prevItem) {
        added.push(item);
      } else if (JSON.stringify(prevItem) !== JSON.stringify(item)) {
        updated.push(item);
      }
    });

    // Find removed items
    prevItems.forEach(item => {
      if (!currentItemsMap.has(item.id)) {
        removed.push(item.id);
      }
    });

    // Update changes history
    if (added.length > 0 || updated.length > 0 || removed.length > 0) {
      changesRef.current = { added, updated, removed };
    }

    return changesRef.current;
  })() : { added: [], updated: [], removed: [] };

  // Update previous items reference
  prevItemsRef.current = items;

  const clearChanges = useCallback(() => {
    changesRef.current = { added: [], updated: [], removed: [] };
  }, []);

  return {
    items,
    changes,
    clearChanges
  };
}