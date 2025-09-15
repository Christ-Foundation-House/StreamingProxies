'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateProxySchema, UpdateProxySchema } from '@/lib/streaming-proxies/utils/validation';
import type { StreamingProxy } from '@/lib/streaming-proxies/types';
import { SERVER_LOCATIONS, COMPONENT_STYLES } from '@/lib/streaming-proxies/utils/constants';
import { apiUtils } from '@/lib/streaming-proxies/api';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '../../_components/LoadingStates';
import { getErrorMessage } from '@/lib/streaming-proxies/utils/error-handler';

type CreateFormData = z.infer<typeof CreateProxySchema>;
type UpdateFormData = z.infer<typeof UpdateProxySchema>;
type FormData = CreateFormData;

export interface ProxyFormProps {
  initialData?: Partial<StreamingProxy>;
  onSubmit: (data: CreateFormData) => Promise<void>;
  mode: 'create' | 'edit';
  loading?: boolean;
  className?: string;
}

export default function ProxyForm({
  initialData,
  onSubmit,
  mode,
  loading = false,
  className
}: ProxyFormProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(CreateProxySchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      rtmpUrl: initialData?.rtmpUrl ?? '',
      rtmpKey: initialData?.rtmpKey ?? '',
      serverLocation: initialData?.serverLocation ?? 'us-east-1',
      maxConcurrentStreams: initialData?.maxConcurrentStreams ?? 1,
      bandwidthLimit: initialData?.bandwidthLimit ?? 50,
      churchBranchId: initialData?.churchBranchId ?? ''
    }
  });

  const watchedRtmpUrl = watch('rtmpUrl');

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name ?? '',
        description: initialData.description ?? '',
        rtmpUrl: initialData.rtmpUrl ?? '',
        rtmpKey: initialData.rtmpKey ?? '',
        serverLocation: initialData.serverLocation ?? 'us-east-1',
        maxConcurrentStreams: initialData.maxConcurrentStreams ?? 1,
        bandwidthLimit: initialData.bandwidthLimit ?? 50,
        churchBranchId: initialData.churchBranchId ?? ''
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Ensure we're only sending the fields that match the schema
      const formData: FormData = {
        name: data.name,
        description: data.description || '',
        rtmpUrl: data.rtmpUrl,
        rtmpKey: data.rtmpKey || '',
        serverLocation: data.serverLocation,
        maxConcurrentStreams: data.maxConcurrentStreams,
        bandwidthLimit: data.bandwidthLimit,
        churchBranchId: data.churchBranchId || '' // Ensure this is handled properly
      };
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const testConnection = async () => {
    if (!watchedRtmpUrl) return;

    setTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const result = await apiUtils.testRtmpConnection(watchedRtmpUrl);
      setConnectionTestResult(result);
    } catch (error) {
      setConnectionTestResult({
        success: false,
        message: getErrorMessage(error) || 'Failed to test connection'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const generateStreamKey = () => {
    // Use a more predictable approach for key generation to avoid hydration issues
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 9);
    const key = `stream_${timestamp}_${randomPart}`;
    setValue('rtmpKey', key);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className={COMPONENT_STYLES.LABEL_BASE}>
              Proxy Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className={cn(
                COMPONENT_STYLES.INPUT_BASE,
                errors.name && COMPONENT_STYLES.INPUT_ERROR
              )}
              placeholder="e.g., Main Campus RTMP"
            />
            {errors.name && (
              <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.name.message}</p>
            )}
          </div>

          {/* Church Branch ID */}
          <div>
            <label className={COMPONENT_STYLES.LABEL_BASE}>
              Church Branch ID *
            </label>
            <input
              type="text"
              {...register('churchBranchId')}
              className={cn(
                COMPONENT_STYLES.INPUT_BASE,
                errors.churchBranchId && COMPONENT_STYLES.INPUT_ERROR
              )}
              placeholder="Enter church branch UUID"
            />
            {errors.churchBranchId && (
              <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.churchBranchId.message}</p>
            )}
          </div>

          {/* Server Location */}
          <div>
            <label className={COMPONENT_STYLES.LABEL_BASE}>
              Server Location *
            </label>
            <select
              {...register('serverLocation')}
              className={cn(
                COMPONENT_STYLES.INPUT_BASE,
                errors.serverLocation && COMPONENT_STYLES.INPUT_ERROR
              )}
            >
              {SERVER_LOCATIONS.map((location) => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
            {errors.serverLocation && (
              <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.serverLocation.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className={COMPONENT_STYLES.LABEL_BASE}>
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className={cn(
              COMPONENT_STYLES.INPUT_BASE,
              errors.description && COMPONENT_STYLES.INPUT_ERROR
            )}
            placeholder="Optional description for this proxy..."
          />
          {errors.description && (
            <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* RTMP Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">RTMP Configuration</h3>
        
        {/* RTMP URL */}
        <div className="mb-6">
          <label className={COMPONENT_STYLES.LABEL_BASE}>
            RTMP URL *
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              {...register('rtmpUrl')}
              className={cn(
                COMPONENT_STYLES.INPUT_BASE,
                'flex-1',
                errors.rtmpUrl && COMPONENT_STYLES.INPUT_ERROR
              )}
              placeholder="rtmp://your-server.com/live"
            />
            <button
              type="button"
              onClick={testConnection}
              disabled={!watchedRtmpUrl || testingConnection}
              className={cn(
                COMPONENT_STYLES.BUTTON_SECONDARY,
                'whitespace-nowrap',
                (!watchedRtmpUrl || testingConnection) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {testingConnection ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Test Connection'
              )}
            </button>
          </div>
          {errors.rtmpUrl && (
            <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.rtmpUrl.message}</p>
          )}
          
          {/* Connection Test Result */}
          {connectionTestResult && (
            <div className={cn(
              'mt-2 p-2 rounded text-sm',
              connectionTestResult.success 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            )}>
              {connectionTestResult.message}
            </div>
          )}
        </div>

        {/* RTMP Key */}
        <div>
          <label className={COMPONENT_STYLES.LABEL_BASE}>
            Stream Key
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              {...register('rtmpKey')}
              className={cn(
                COMPONENT_STYLES.INPUT_BASE,
                'flex-1',
                errors.rtmpKey && COMPONENT_STYLES.INPUT_ERROR
              )}
              placeholder="Optional stream key"
            />
            <button
              type="button"
              onClick={generateStreamKey}
              className={cn(COMPONENT_STYLES.BUTTON_SECONDARY, 'whitespace-nowrap')}
            >
              Generate Key
            </button>
          </div>
          {errors.rtmpKey && (
            <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.rtmpKey.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Leave empty if not required by your RTMP server
          </p>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Max Concurrent Streams */}
          <div>
            <label className={COMPONENT_STYLES.LABEL_BASE}>
              Max Concurrent Streams *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              {...register('maxConcurrentStreams', { valueAsNumber: true })}
              className={cn(
                COMPONENT_STYLES.INPUT_BASE,
                errors.maxConcurrentStreams && COMPONENT_STYLES.INPUT_ERROR
              )}
            />
            {errors.maxConcurrentStreams && (
              <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.maxConcurrentStreams.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of simultaneous streams (1-10)
            </p>
          </div>

          {/* Bandwidth Limit */}
          <div>
            <label className={COMPONENT_STYLES.LABEL_BASE}>
              Bandwidth Limit (Mbps)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              {...register('bandwidthLimit', { valueAsNumber: true })}
              className={cn(
                COMPONENT_STYLES.INPUT_BASE,
                errors.bandwidthLimit && COMPONENT_STYLES.INPUT_ERROR
              )}
              placeholder="50"
            />
            {errors.bandwidthLimit && (
              <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.bandwidthLimit.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Optional bandwidth limit in Mbps (1-1000)
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => window.history.back()}
          className={COMPONENT_STYLES.BUTTON_SECONDARY}
          disabled={isSubmitting || loading}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className={cn(
            COMPONENT_STYLES.BUTTON_PRIMARY,
            (isSubmitting || loading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isSubmitting || loading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>{mode === 'create' ? 'Creating...' : 'Updating...'}</span>
            </div>
          ) : (
            <span>{mode === 'create' ? 'Create Proxy' : 'Update Proxy'}</span>
          )}
        </button>
      </div>
    </form>
  );
}

// Simplified form for quick proxy creation
export function QuickProxyForm({
  onSubmit,
  loading = false
}: {
  onSubmit: (data: { name: string; rtmpUrl: string }) => Promise<void>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<{ name: string; rtmpUrl: string }>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className={COMPONENT_STYLES.LABEL_BASE}>
          Proxy Name *
        </label>
        <input
          type="text"
          {...register('name', { required: 'Name is required' })}
          className={cn(
            COMPONENT_STYLES.INPUT_BASE,
            errors.name && COMPONENT_STYLES.INPUT_ERROR
          )}
          placeholder="e.g., Main Campus RTMP"
        />
        {errors.name && (
          <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className={COMPONENT_STYLES.LABEL_BASE}>
          RTMP URL *
        </label>
        <input
          type="url"
          {...register('rtmpUrl', { required: 'RTMP URL is required' })}
          className={cn(
            COMPONENT_STYLES.INPUT_BASE,
            errors.rtmpUrl && COMPONENT_STYLES.INPUT_ERROR
          )}
          placeholder="rtmp://your-server.com/live"
        />
        {errors.rtmpUrl && (
          <p className={COMPONENT_STYLES.ERROR_TEXT}>{errors.rtmpUrl.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className={cn(
          COMPONENT_STYLES.BUTTON_PRIMARY,
          'w-full',
          (isSubmitting || loading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isSubmitting || loading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            <span>Creating...</span>
          </div>
        ) : (
          'Create Proxy'
        )}
      </button>
    </form>
  );
}