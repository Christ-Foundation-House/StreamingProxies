import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'
import { ComponentErrorFallback } from '../error-fallbacks/ComponentErrorFallback'

// Component that throws an error
const ThrowError = ({ shouldThrow = false, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message)
  }
  return <div data-testid="success">No error</div>
}

// Component that throws async error
const ThrowAsyncError = ({ shouldThrow = false }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      throw new Error('Async error')
    }
  }, [shouldThrow])
  
  return <div data-testid="async-success">No async error</div>
}

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary fallback={ComponentErrorFallback}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('success')).toBeInTheDocument()
  })

  it('should render error fallback when child component throws', () => {
    render(
      <ErrorBoundary fallback={ComponentErrorFallback}>
        <ThrowError shouldThrow={true} message="Component crashed" />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/component crashed/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('should call onError callback when error occurs', () => {
    const onErrorSpy = vi.fn()

    render(
      <ErrorBoundary fallback={ComponentErrorFallback} onError={onErrorSpy}>
        <ThrowError shouldThrow={true} message="Callback test error" />
      </ErrorBoundary>
    )

    expect(onErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Callback test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })

  it('should reset error state when retry button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={ComponentErrorFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error should be displayed
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    // Click retry button
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    // Re-render with no error
    rerender(
      <ErrorBoundary fallback={ComponentErrorFallback}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    // Should show success content
    expect(screen.getByTestId('success')).toBeInTheDocument()
  })

  it('should handle multiple error types with different fallbacks', () => {
    const NetworkErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
      <div>
        <h2>Network Error</h2>
        <p>{error.message}</p>
        <button onClick={retry}>Retry Connection</button>
      </div>
    )

    render(
      <ErrorBoundary fallback={NetworkErrorFallback}>
        <ThrowError shouldThrow={true} message="Network connection failed" />
      </ErrorBoundary>
    )

    expect(screen.getByText('Network Error')).toBeInTheDocument()
    expect(screen.getByText('Network connection failed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument()
  })

  it('should handle nested error boundaries correctly', () => {
    const OuterFallback = () => <div data-testid="outer-fallback">Outer Error</div>
    const InnerFallback = () => <div data-testid="inner-fallback">Inner Error</div>

    render(
      <ErrorBoundary fallback={OuterFallback}>
        <div>
          <ErrorBoundary fallback={InnerFallback}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    )

    // Inner boundary should catch the error
    expect(screen.getByTestId('inner-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('outer-fallback')).not.toBeInTheDocument()
  })

  it('should preserve error boundary state across re-renders', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={ComponentErrorFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    // Re-render with same error
    rerender(
      <ErrorBoundary fallback={ComponentErrorFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should still show error
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('should handle errors in error fallback component gracefully', () => {
    const BuggyFallback = () => {
      throw new Error('Fallback component error')
    }

    // This should not crash the test - React will handle it
    expect(() => {
      render(
        <ErrorBoundary fallback={BuggyFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
    }).not.toThrow()
  })
})