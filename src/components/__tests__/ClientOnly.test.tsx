import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClientOnly } from '../ClientOnly'

// Mock useEffect to simulate server-side rendering
const mockUseEffect = vi.fn()
const originalUseEffect = React.useEffect

describe('ClientOnly Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    React.useEffect = originalUseEffect
  })

  it('should not render children on server-side (initial render)', () => {
    // Mock server-side rendering by preventing useEffect from running
    React.useEffect = mockUseEffect

    render(
      <ClientOnly fallback={<div>Loading...</div>}>
        <div data-testid="client-content">Client-only content</div>
      </ClientOnly>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByTestId('client-content')).not.toBeInTheDocument()
  })

  it('should render children after hydration (client-side)', () => {
    render(
      <ClientOnly fallback={<div>Loading...</div>}>
        <div data-testid="client-content">Client-only content</div>
      </ClientOnly>
    )

    // After useEffect runs, children should be rendered
    expect(screen.getByTestId('client-content')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('should render fallback when provided', () => {
    React.useEffect = mockUseEffect

    render(
      <ClientOnly fallback={<div data-testid="fallback">Custom fallback</div>}>
        <div>Client content</div>
      </ClientOnly>
    )

    expect(screen.getByTestId('fallback')).toBeInTheDocument()
  })

  it('should render null when no fallback provided on server', () => {
    React.useEffect = mockUseEffect

    const { container } = render(
      <ClientOnly>
        <div>Client content</div>
      </ClientOnly>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should handle multiple children correctly', () => {
    render(
      <ClientOnly>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </ClientOnly>
    )

    expect(screen.getByTestId('child1')).toBeInTheDocument()
    expect(screen.getByTestId('child2')).toBeInTheDocument()
  })
})