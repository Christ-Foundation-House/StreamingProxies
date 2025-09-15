'use client';

import { ClientOnly } from '@/components/ClientOnly';

interface TimeDisplayProps {
  /**
   * The timestamp to display
   */
  timestamp: Date | string | number;
  
  /**
   * Format options for the time display
   */
  format?: 'time' | 'date' | 'datetime' | 'relative' | 'duration';
  
  /**
   * Additional options for Intl.DateTimeFormat
   */
  options?: Intl.DateTimeFormatOptions;
  
  /**
   * Locale for formatting
   */
  locale?: string;
  
  /**
   * Fallback content to show during SSR
   */
  fallback?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TimeDisplay component that safely renders timestamps without hydration issues.
 * Automatically wraps time-sensitive content in ClientOnly to prevent server/client mismatches.
 */
export function TimeDisplay({
  timestamp,
  format = 'datetime',
  options,
  locale = 'en-US',
  fallback = '--:--',
  className
}: TimeDisplayProps) {
  const date = new Date(timestamp);
  
  // Validate the date
  if (isNaN(date.getTime())) {
    return <span className={className}>Invalid Date</span>;
  }

  const formatTime = () => {
    switch (format) {
      case 'time':
        return date.toLocaleTimeString(locale, options || { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
      
      case 'date':
        return date.toLocaleDateString(locale, options || {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      
      case 'datetime':
        return date.toLocaleString(locale, options || {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      
      case 'relative':
        return formatRelativeTime(date);
      
      case 'duration':
        return formatDuration(date);
      
      default:
        return date.toLocaleString(locale, options);
    }
  };

  return (
    <ClientOnly fallback={<span className={className}>{fallback}</span>}>
      <span className={className}>{formatTime()}</span>
    </ClientOnly>
  );
}

/**
 * Format a date as relative time (e.g., "2 minutes ago", "in 1 hour")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) {
    return 'just now';
  } else if (Math.abs(diffMinutes) < 60) {
    return diffMinutes > 0 ? `${diffMinutes}m ago` : `in ${Math.abs(diffMinutes)}m`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `${diffHours}h ago` : `in ${Math.abs(diffHours)}h`;
  } else {
    return diffDays > 0 ? `${diffDays}d ago` : `in ${Math.abs(diffDays)}d`;
  }
}

/**
 * Format a date as duration from now (e.g., "2h 30m", "1d 5h")
 */
function formatDuration(startDate: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    return '0m';
  }

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    return remainingHours > 0 ? `${diffDays}d ${remainingHours}h` : `${diffDays}d`;
  } else if (diffHours > 0) {
    const remainingMinutes = diffMinutes % 60;
    return remainingMinutes > 0 ? `${diffHours}h ${remainingMinutes}m` : `${diffHours}h`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m`;
  } else {
    return `${diffSeconds}s`;
  }
}

/**
 * LastUpdated component for showing when data was last refreshed
 */
export function LastUpdated({ 
  timestamp = new Date(), 
  className,
  prefix = 'Last updated:' 
}: {
  timestamp?: Date | string | number;
  className?: string;
  prefix?: string;
}) {
  return (
    <div className={className}>
      {prefix} <TimeDisplay timestamp={timestamp} format="time" fallback="--:--" />
    </div>
  );
}

/**
 * StreamDuration component for showing how long a stream has been running
 */
export function StreamDuration({ 
  startTime, 
  className,
  showLabel = false 
}: {
  startTime: Date | string | number;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <span className={className}>
      {showLabel && 'Duration: '}
      <TimeDisplay timestamp={startTime} format="duration" fallback="0m" />
    </span>
  );
}

export default TimeDisplay;