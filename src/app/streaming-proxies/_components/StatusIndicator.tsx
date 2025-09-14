'use client';

import { ProxyStatus, HealthStatus } from '@/lib/streaming-proxies/types';
import { STATUS_STYLES, HEALTH_STYLES, STATUS_LABELS, HEALTH_STATUS_LABELS } from '@/lib/streaming-proxies/utils/constants';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: ProxyStatus | HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function StatusIndicator({ 
  status, 
  size = 'md', 
  showLabel = true,
  className 
}: StatusIndicatorProps) {
  const isProxyStatus = Object.values(ProxyStatus).includes(status as ProxyStatus);
  const isHealthStatus = Object.values(HealthStatus).includes(status as HealthStatus);

  // Determine styles based on status type
  const getStatusStyles = () => {
    if (isProxyStatus) {
      return STATUS_STYLES[status as ProxyStatus];
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getHealthDotColor = () => {
    if (isHealthStatus) {
      return HEALTH_STYLES[status as HealthStatus];
    }
    return 'bg-gray-400';
  };

  const getLabel = () => {
    if (isProxyStatus) {
      return STATUS_LABELS[status as ProxyStatus];
    }
    if (isHealthStatus) {
      return HEALTH_STATUS_LABELS[status as HealthStatus];
    }
    return status;
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  if (isHealthStatus && !showLabel) {
    // Show only health dot for health status without label
    return (
      <div className={cn('flex items-center', className)}>
        <div 
          className={cn(
            'rounded-full',
            dotSizeClasses[size],
            getHealthDotColor()
          )}
          title={getLabel()}
        />
      </div>
    );
  }

  if (isHealthStatus && showLabel) {
    // Show health dot with label
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div 
          className={cn(
            'rounded-full',
            dotSizeClasses[size],
            getHealthDotColor()
          )}
        />
        <span className={cn(
          'font-medium',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        )}>
          {getLabel()}
        </span>
      </div>
    );
  }

  // Show proxy status badge
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        sizeClasses[size],
        getStatusStyles(),
        className
      )}
    >
      {getLabel()}
    </span>
  );
}

// Specialized components for different status types
export function ProxyStatusBadge({ 
  status, 
  size = 'md', 
  className 
}: { 
  status: ProxyStatus; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <StatusIndicator 
      status={status} 
      size={size} 
      showLabel={true}
      className={className}
    />
  );
}

export function HealthStatusDot({ 
  status, 
  size = 'md', 
  showLabel = false,
  className 
}: { 
  status: HealthStatus; 
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <StatusIndicator 
      status={status} 
      size={size} 
      showLabel={showLabel}
      className={className}
    />
  );
}

export function HealthStatusIndicator({ 
  status, 
  size = 'md',
  className 
}: { 
  status: HealthStatus; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <StatusIndicator 
      status={status} 
      size={size} 
      showLabel={true}
      className={className}
    />
  );
}

// Combined status indicator showing both proxy status and health
export function CombinedStatusIndicator({
  proxyStatus,
  healthStatus,
  size = 'md',
  className
}: {
  proxyStatus: ProxyStatus;
  healthStatus: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ProxyStatusBadge status={proxyStatus} size={size} />
      <HealthStatusDot status={healthStatus} size={size} />
    </div>
  );
}

// Status indicator with tooltip
export function StatusIndicatorWithTooltip({
  status,
  tooltip,
  size = 'md',
  showLabel = true,
  className
}: {
  status: ProxyStatus | HealthStatus;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('relative group', className)} title={tooltip}>
      <StatusIndicator 
        status={status} 
        size={size} 
        showLabel={showLabel}
      />
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {tooltip}
        </div>
      )}
    </div>
  );
}