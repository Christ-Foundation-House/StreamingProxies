import { type ClassValue, clsx } from 'clsx';
import { toast } from '@/components/ui/use-toast';

type ErrorWithMessage = {
  message: string;
  status?: number;
  details?: unknown;
};

/**
 * Type guard to check if an error has a message property
 */
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Convert any error to a consistent error format
 */
export function toErrorWithMessage(error: unknown): ErrorWithMessage {
  if (isErrorWithMessage(error)) return error;

  try {
    return {
      message: JSON.stringify(error),
    };
  } catch {
    // Fallback in case stringifying the error fails
    return {
      message: String(error),
    };
  }
}

/**
 * Log an error to the console and optionally to an error reporting service
 */
export function logError(
  error: unknown,
  context: Record<string, unknown> = {},
  level: 'error' | 'warning' | 'info' = 'error'
) {
  const errorWithMessage = toErrorWithMessage(error);
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    level,
    message: errorWithMessage.message,
    status: errorWithMessage.status,
    details: errorWithMessage.details,
    context,
  };

  // Log to console
  if (level === 'error') {
    console.error('Application Error:', logEntry);
  } else if (level === 'warning') {
    console.warn('Application Warning:', logEntry);
  } else {
    console.log('Application Info:', logEntry);
  }

  // TODO: Integrate with an error reporting service (e.g., Sentry, LogRocket)
  // if (process.env.NODE_ENV === 'production') {
  //   reportErrorToService(logEntry);
  // }
}

/**
 * Show a toast notification for an error
 */
export function showErrorToast(error: unknown, options: {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
} = {}) {
  const errorWithMessage = toErrorWithMessage(error);
  
  toast({
    title: options.title || 'Error',
    description: options.description || errorWithMessage.message,
    variant: (options.variant || 'destructive') as 'destructive',
    duration: options.duration || 5000,
  });
}

/**
 * Handle API errors consistently
 */
export function handleApiError(
  error: unknown,
  options: {
    showToast?: boolean;
    logLevel?: 'error' | 'warning' | 'info';
    context?: Record<string, unknown>;
  } = {}
) {
  const errorWithMessage = toErrorWithMessage(error);
  const {
    showToast = true,
    logLevel = 'error',
    context = {},
  } = options;

  // Log the error
  logError(error, context, logLevel);

  // Show toast if enabled
  if (showToast) {
    showErrorToast(errorWithMessage);
  }

  // Return the normalized error
  return errorWithMessage;
}

/**
 * Create a safe function that wraps an async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    showToast?: boolean;
    logLevel?: 'error' | 'warning' | 'info';
    context?: Record<string, unknown>;
  } = {}
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | { error: ErrorWithMessage }> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorWithMessage = handleApiError(error, options);
      return { error: errorWithMessage };
    }
  };
}

/**
 * Create a function that can be used as an API route handler with error handling
 */
export function createApiHandler<T = any>(
  handler: (req: Request, context: any) => Promise<T>,
  options: {
    logLevel?: 'error' | 'warning' | 'info';
    context?: Record<string, unknown>;
  } = {}
) {
  return async (req: Request, context: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      const errorWithMessage = toErrorWithMessage(error);
      logError(errorWithMessage, options.context, options.logLevel);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorWithMessage.message,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        }),
        {
          status: errorWithMessage.status || 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}
