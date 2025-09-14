'use client';

import { useState, useEffect } from 'react';
import { ClientOnly } from '../ClientOnly';

interface TimeDisplayProps {
  /**
   * The timestamp to display
   */
  timestamp?: Date;
  
  /**
   * Format for the time display
   * @default 'full' - shows full date and time
   */
  format?: 'time' | 'date' | 'full' | 'relative';
  
  /**
   * Whether to update the time in real-time
   * @default false
   */
  realTime?: boolean;
  
  /**
   * Update interval in milliseconds for real-time updates
   * @default 1000
   */
  updateInterval?: number;
}

/**
 * TimeDisplay component that safely renders time-sensitive data
 * without causing hydration mismatches. This component demonstrates
 * proper usage of ClientOnly for time-based content.
 */
function TimeDisplayContent({
  timestamp = new Date(),
  format = 'full',
  realTime = false,
  updateInterval = 1000
}: TimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState(timestamp);

  useEffect(() => {
    if (!realTime) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [realTime, updateInterval]);

  const formatTime = (date: Date): string => {
    switch (format) {
      case 'time':
        return date.toLocaleTimeString();
      case 'date':
        return date.toLocaleDateString();
      case 'relative':
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
      case 'full':
      default:
        return date.toLocaleString();
    }
  };

  return (
    <time 
      dateTime={currentTime.toISOString()}
      className="text-sm text-gray-600 font-mono"
      title={currentTime.toLocaleString()}
    >
      {formatTime(currentTime)}
    </time>
  );
}

/**
 * Safe TimeDisplay component wrapped in ClientOnly to prevent hydration issues.
 * Use this component whenever you need to display timestamps or real-time data.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TimeDisplay />
 * 
 * // With specific timestamp
 * <TimeDisplay timestamp={new Date('2024-01-01')} format="relative" />
 * 
 * // Real-time clock
 * <TimeDisplay realTime format="time" />
 * ```
 */
export function TimeDisplay(props: TimeDisplayProps) {
  return (
    <ClientOnly 
      fallback={
        <span className="text-sm text-gray-400 font-mono">
          Loading time...
        </span>
      }
    >
      <TimeDisplayContent {...props} />
    </ClientOnly>
  );
}

export default TimeDisplay;