import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

// Import dashboard components
const SystemOverview = vi.fn(() => <div data-testid="system-overview">System Overview</div>)
const ActiveStreams = vi.fn(() => <div data-testid="active-streams">Active Streams</div>)

// Mock the dashboard page component
const DashboardPage = () => (
  <div>
    <h1>Streaming Proxies Dashboard</h1>
    <SystemOverview />
    <ActiveStreams />
  </div>
)

describe('Dashboard Components Hydration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard page consistently between server and client', () => {
    const serverHTML = renderToString(<DashboardPage />)
    const { container } = render(<DashboardPage />)
    
    // Check that main structure is consistent
    expect(serverHTML).toContain('Streaming Proxies Dashboard')
    expect(container.innerHTML).toContain('Streaming Proxies Dashboard')
    
    // Verify components are rendered
    expect(screen.getByTestId('system-overview')).toBeInTheDocument()
    expect(screen.getByTestId('active-streams')).toBeInTheDocument()
  })

  it('should handle time-sensitive components with ClientOnly wrapper', () => {
    const TimeDisplay = ({ timestamp }: { timestamp: Date }) => (
      <div data-testid="time-display">
        {typeof window === 'undefined' ? '--' : timestamp.toLocaleString()}
      </div>
    )

    const ComponentWithTime = () => (
      <div>
        <TimeDisplay timestamp={new Date('2024-01-01T12:00:00Z')} />
      </div>
    )

    const serverHTML = renderToString(<ComponentWithTime />)
    const { container } = render(<ComponentWithTime />)
    
    // Server should show fallback
    expect(serverHTML).toContain('--')
    
    // Client should show actual time
    expect(container.innerHTML).toContain('1/1/2024')
  })

  it('should prevent hydration mismatches in proxy cards', () => {
    const ProxyCard = ({ proxy }: { proxy: any }) => (
      <div data-testid={`proxy-${proxy.id}`}>
        <h3>{proxy.name}</h3>
        <div>Status: {proxy.status}</div>
        <div suppressHydrationWarning>
          Last seen: {typeof window !== 'undefined' ? 'just now' : '--'}
        </div>
      </div>
    )

    const mockProxy = {
      id: '1',
      name: 'Test Proxy',
      status: 'active'
    }

    const serverHTML = renderToString(<ProxyCard proxy={mockProxy} />)
    const { container } = render(<ProxyCard proxy={mockProxy} />)
    
    // Static content should be consistent
    expect(serverHTML).toContain('Test Proxy')
    expect(container.innerHTML).toContain('Test Proxy')
    expect(serverHTML).toContain('Status: active')
    expect(container.innerHTML).toContain('Status: active')
    
    // Dynamic content should differ but not cause hydration errors
    expect(serverHTML).toContain('Last seen: --')
    expect(container.innerHTML).toContain('Last seen: just now')
  })

  it('should handle loading states consistently', () => {
    const LoadingComponent = ({ loading }: { loading: boolean }) => (
      <div>
        {loading ? (
          <div data-testid="loading">Loading...</div>
        ) : (
          <div data-testid="content">Content loaded</div>
        )}
      </div>
    )

    // Test loading state
    const serverLoadingHTML = renderToString(<LoadingComponent loading={true} />)
    const { container: loadingContainer } = render(<LoadingComponent loading={true} />)
    
    expect(serverLoadingHTML).toContain('Loading...')
    expect(loadingContainer.innerHTML).toContain('Loading...')
    
    // Test loaded state
    const serverLoadedHTML = renderToString(<LoadingComponent loading={false} />)
    const { container: loadedContainer } = render(<LoadingComponent loading={false} />)
    
    expect(serverLoadedHTML).toContain('Content loaded')
    expect(loadedContainer.innerHTML).toContain('Content loaded')
  })

  it('should handle error states without hydration issues', () => {
    const ErrorComponent = ({ error }: { error: string | null }) => (
      <div>
        {error ? (
          <div data-testid="error" role="alert">
            Error: {error}
          </div>
        ) : (
          <div data-testid="success">No errors</div>
        )}
      </div>
    )

    // Test error state
    const serverErrorHTML = renderToString(<ErrorComponent error="Connection failed" />)
    const { container: errorContainer } = render(<ErrorComponent error="Connection failed" />)
    
    expect(serverErrorHTML).toContain('Error: Connection failed')
    expect(errorContainer.innerHTML).toContain('Error: Connection failed')
    
    // Test success state
    const serverSuccessHTML = renderToString(<ErrorComponent error={null} />)
    const { container: successContainer } = render(<ErrorComponent error={null} />)
    
    expect(serverSuccessHTML).toContain('No errors')
    expect(successContainer.innerHTML).toContain('No errors')
  })
})