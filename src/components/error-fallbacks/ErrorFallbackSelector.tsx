'use client';

import { NetworkErrorFallback } from './NetworkErrorFallback';
import { ComponentErrorFallback } from './ComponentErrorFallback';
import { LoadingErrorFallback } from './LoadingErrorFallback';
import { ErrorBoundary } from '../ErrorBoundary';

export type ErrorType = 'network' | 'component' | 'loading' | 'unknown';

interface ErrorFallbackSelectorProps {
  error: Error;
  retry: () => void;
  errorType?: ErrorType;
  componentName?: string;
  dataType?: string;
  isRetrying?: boolean;
  showDetails?: boolean;
}

/**
 * Automatically determines the appropriate error fallback component based on error characteristics
 */
export function ErrorFallbackSelector({
  error,
  retry,
  errorType,
  componentName,
  dataType,
  isRetrying = false,
  showDetails = false
}: ErrorFallbackSelectorProps) {
  // Auto-detect error type if not provided
  const detectedErrorType = errorType || detectErrorType(error);

  switch (detectedErrorType) {
    case 'network':
      return (
        <NetworkErrorFallback
          error={error}
          retry={retry}
          isRetrying={isRetrying}
          showDetails={showDetails}
        />
      );
    
    case 'loading':
      return (
        <LoadingErrorFallback
          error={error}
          retry={retry}
          isRetrying={isRetrying}
          dataType={dataType}
          showDetails={showDetails}
          timeout={isTimeoutError(error)}
        />
      );
    
    case 'component':
    default:
      return (
        <ComponentErrorFallback
          error={error}
          retry={retry}
          isRetrying={isRetrying}
          componentName={componentName}
          showDetails={showDetails}
        />
      );
  }
}

/**
 * Detects the error type based on error characteristics
 */
export function detectErrorType(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network-related errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('cors') ||
    name === 'typeerror' ||
    !navigator.onLine
  ) {
    return 'network';
  }

  // Loading/data-related errors
  if (
    message.includes('timeout') ||
    message.includes('aborted') ||
    message.includes('data') ||
    message.includes('parse') ||
    message.includes('json') ||
    message.includes('loading') ||
    name === 'syntaxerror'
  ) {
    return 'loading';
  }

  // Component-related errors
  if (
    message.includes('render') ||
    message.includes('hook') ||
    message.includes('component') ||
    name === 'chunkloaderror' ||
    name === 'referenceerror'
  ) {
    return 'component';
  }

  // Default to component error
  return 'component';
}

/**
 * Checks if the error is a timeout-related error
 */
export function isTimeoutError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return message.includes('timeout') || message.includes('aborted');
}

/**
 * Higher-order component to wrap components with automatic error fallback selection
 */
export function withErrorFallback<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    errorType?: ErrorType;
    componentName?: string;
    dataType?: string;
    showDetails?: boolean;
  }
): React.FC<T> {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary
        fallback={(error, retry) => (
          <ErrorFallbackSelector
            error={error}
            retry={retry}
            errorType={options?.errorType}
            componentName={options?.componentName || Component.displayName || Component.name}
            dataType={options?.dataType}
            showDetails={options?.showDetails}
          />
        )}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorFallbackSelector;