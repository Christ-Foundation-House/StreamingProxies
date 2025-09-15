'use client';

import { useState } from 'react';
import { COMPONENT_STYLES } from '@/lib/streaming-proxies/utils/constants';
import { cn } from '@/lib/utils';
import { InlineLoadingSpinner } from '@/components/ui/loading-skeletons';

interface QuickActionsProps {
  onStartStream: () => void;
  onKillAllStreams: () => void;
  onRefreshData: () => void;
  onCreateProxy?: () => void;
  onViewAnalytics?: () => void;
  loading?: boolean;
  className?: string;
}

export default function QuickActions({
  onStartStream,
  onKillAllStreams,
  onRefreshData,
  onCreateProxy,
  onViewAnalytics,
  loading = false,
  className
}: QuickActionsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (actionName: string, actionFn: () => void | Promise<void>) => {
    setActionLoading(actionName);
    try {
      await actionFn();
    } finally {
      setActionLoading(null);
    }
  };

  const actions = [
    {
      name: 'start-stream',
      label: 'Start Stream',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a2 2 0 012-2h8a2 2 0 012 2v2M7 16v2a2 2 0 002 2h6a2 2 0 002-2v-2" />
        </svg>
      ),
      onClick: onStartStream,
      variant: 'primary' as const,
      description: 'Start a new streaming session',
    },
    {
      name: 'refresh',
      label: 'Refresh',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h-.582M8.644 21A8.001 8.001 0 0019.418 15m0 0V15a8 8 0 10-15.356-2" />
        </svg>
      ),
      onClick: onRefreshData,
      variant: 'secondary' as const,
      description: 'Refresh all data',
    },
    {
      name: 'kill-all',
      label: 'Kill All Streams',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      onClick: onKillAllStreams,
      variant: 'danger' as const,
      description: 'Emergency stop all active streams',
      requiresConfirm: true,
    },
  ];

  // Add optional actions
  if (onCreateProxy) {
    actions.splice(1, 0, {
      name: 'create-proxy',
      label: 'Add Proxy',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: onCreateProxy,
      variant: 'secondary' as const,
      description: 'Create a new streaming proxy',
    });
  }

  if (onViewAnalytics) {
    actions.push({
      name: 'analytics',
      label: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: onViewAnalytics,
      variant: 'secondary' as const,
      description: 'View detailed analytics',
    });
  }

  const getButtonStyles = (variant: 'primary' | 'secondary' | 'danger') => {
    switch (variant) {
      case 'primary':
        return COMPONENT_STYLES.BUTTON_PRIMARY;
      case 'danger':
        return COMPONENT_STYLES.BUTTON_DANGER;
      default:
        return COMPONENT_STYLES.BUTTON_SECONDARY;
    }
  };

  const handleActionClick = async (action: typeof actions[0]) => {
    if (action.requiresConfirm) {
      const confirmed = window.confirm(`Are you sure you want to ${action.label.toLowerCase()}?`);
      if (!confirmed) return;
    }

    await handleAction(action.name, action.onClick);
  };

  return (
    <div className={cn(COMPONENT_STYLES.CARD_BASE, className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.name}
            onClick={() => handleActionClick(action)}
            disabled={loading || actionLoading === action.name}
            className={cn(
              getButtonStyles(action.variant),
              'flex items-center justify-center gap-2 p-3 text-sm font-medium transition-all duration-200',
              (loading || actionLoading === action.name) && 'opacity-50 cursor-not-allowed'
            )}
            title={action.description}
          >
            {actionLoading === action.name ? (
              <InlineLoadingSpinner size="sm" />
            ) : (
              <>
                {action.icon}
                <span>{action.label}</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Action descriptions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Primary actions for streaming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Emergency controls</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactQuickActions({
  onStartStream,
  onRefreshData,
  loading = false,
  className
}: {
  onStartStream: () => void;
  onRefreshData: () => void;
  loading?: boolean;
  className?: string;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (actionName: string, actionFn: () => void | Promise<void>) => {
    setActionLoading(actionName);
    try {
      await actionFn();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={() => handleAction('start-stream', onStartStream)}
        disabled={loading || actionLoading === 'start-stream'}
        className={cn(
          COMPONENT_STYLES.BUTTON_PRIMARY,
          'flex items-center gap-2 text-sm',
          (loading || actionLoading === 'start-stream') && 'opacity-50 cursor-not-allowed'
        )}
      >
        {actionLoading === 'start-stream' ? (
          <InlineLoadingSpinner size="sm" />
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a2 2 0 012-2h8a2 2 0 012 2v2M7 16v2a2 2 0 002 2h6a2 2 0 002-2v-2" />
            </svg>
            Start Stream
          </>
        )}
      </button>

      <button
        onClick={() => handleAction('refresh', onRefreshData)}
        disabled={loading || actionLoading === 'refresh'}
        className={cn(
          COMPONENT_STYLES.BUTTON_SECONDARY,
          'p-2',
          (loading || actionLoading === 'refresh') && 'opacity-50 cursor-not-allowed'
        )}
        title="Refresh data"
      >
        {actionLoading === 'refresh' ? (
          <InlineLoadingSpinner size="sm" />
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h-.582M8.644 21A8.001 8.001 0 0019.418 15m0 0V15a8 8 0 10-15.356-2" />
          </svg>
        )}
      </button>
    </div>
  );
}

// Action button component for reuse
export function ActionButton({
  icon,
  label,
  onClick,
  variant = 'secondary',
  loading = false,
  disabled = false,
  className
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return COMPONENT_STYLES.BUTTON_PRIMARY;
      case 'danger':
        return COMPONENT_STYLES.BUTTON_DANGER;
      default:
        return COMPONENT_STYLES.BUTTON_SECONDARY;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        getButtonStyles(),
        'flex items-center gap-2 text-sm',
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? <InlineLoadingSpinner size="sm" /> : icon}
      <span>{label}</span>
    </button>
  );
}