/**
 * Common error response structure from the API
 */
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
  statusCode?: number;
  timestamp?: string;
  path?: string;
}

/**
 * Type guard to check if an error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  
  const err = error as Record<string, unknown>;
  return (
    'success' in err && 
    err.success === false &&
    'error' in err &&
    typeof err.error === 'string'
  );
}

/**
 * Extracts error message from an unknown error
 */
export function getErrorMessage(error: unknown, defaultMessage: string = 'An unknown error occurred'): string {
  if (!error) return defaultMessage;
  
  if (isApiError(error)) {
    return error.error || defaultMessage;
  }
  
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  
  if (typeof error === 'string') {
    return error || defaultMessage;
  }
  
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') return message;
  }
  
  return defaultMessage;
}

/**
 * Handles API errors consistently and returns a standardized error object
 */
export function handleApiError(
  error: unknown,
  context: string = 'An error occurred'
): { 
  message: string; 
  details?: Record<string, string[]>;
  statusCode?: number;
  isHandled: boolean;
} {
  if (isApiError(error)) {
    return {
      message: error.error || context,
      details: error.details,
      statusCode: error.statusCode,
      isHandled: true
    };
  }
  
  const message = getErrorMessage(error, context);
  
  // Handle common HTTP errors
  if (error instanceof Response) {
    return {
      message: `HTTP Error ${error.status}: ${error.statusText || message}`,
      statusCode: error.status,
      isHandled: true
    };
  }
  
  return {
    message,
    isHandled: false
  };
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  context?: string
): { error: string; details?: Record<string, string[]> } {
  const { message, details } = handleApiError(error, context);
  return { error: message, ...(details && { details }) };
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorContext?: string
): Promise<{ data?: T; error?: string; details?: Record<string, string[]> }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    const { message, details } = handleApiError(error, errorContext);
    return { error: message, ...(details && { details }) };
  }
}
