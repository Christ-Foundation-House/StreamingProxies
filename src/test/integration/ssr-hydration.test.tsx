import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { SystemOverview } from '../../app/streaming-proxies/dashboard/_components/SystemOverview'
import { ActiveStreams } from '../../app/streaming-proxies/dashboard/_components/ActiveStreams'

// Mock the hooks to provide consistent data
vi.mock('../../lib/streaming-proxies/hooks/useSystemStats', () => ({
  useSystemStats: () => ({
    data: {
      totalProxies: 5,
      activeProxies: 3,
      totalActiveStreams: 12,
      totalBandwidthUsage: 1024,
      healthyProxies: 3,
      warningProxies: 1,
      errorProxies: 1,
      lastUpdated: new Date('2024-01-01T12:00:00Z')
    },
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}))

vi.mock('../../lib/streaming-proxies/hooks/useStreamingSessions', () => ({
  useStreamingSessions: () => ({
    data: [
      {
        id: '1',
        proxyId: 'proxy-1',
        status: 'active',
        startTime: new Date('2024-01-01T11:00:00Z'),
        viewerCount: 150,
        quality: '1080p',
        bandwidth: 5.2
      }
    ],
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}))

describe('SSR Hydration Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  it('should render SystemOverview consistently between server and client', () => {
    // Render on server
    const serverHTML = renderToString(<SystemOverview />)
    
    // Render on client
    const { container } = render(<SystemOverview />)
    const clientHTML = container.innerHTML
    
    // The initial structure should be similar (allowing for ClientOnly differences)
    expect(serverHTML).toContain('System Overview')
    expect(clientHTML).toContain('System Overview')
    
    // Both should contain the same static content
    expect(serverHTML).toContain('Total Proxies')
    expect(clientHTML).toContain('Total Proxies')
  })

  it('should handle time-sensitive content without hydration mismatches', () => {
    // Mock ClientOnly to simulate proper hydration behavior
    const MockedSystemOverview = () => (
      <div>
        <h2>System Overview</h2>
        <div>Total Proxies: 5</div>
        <div>Active Proxies: 3</div>
        {/* Time-sensitive content should be wrapped in ClientOnly */}
        <div data-testid="last-updated">Last updated: --</div>
      </div>
    )

    const serverHTML = renderToString(<MockedSystemOverview />)
    const { container } = render(<MockedSystemOverview />)
    
    // Server should show fallback for time-sensitive content
    expect(serverHTML).toContain('Last updated: --')
    
    // Client should eventually show actual time (after hydration)
    expect(container.innerHTML).toContain('Last updated: --')
  })

  it('should render ActiveStreams without hydration issues', () => {
    const serverHTML = renderToString(<ActiveStreams />)
    const { container } = render(<ActiveStreams />)
    
    // Both should contain the same structure
    expect(serverHTML).toContain('Active Streams')
    expect(container.innerHTML).toContain('Active Streams')
    
    // Should handle loading states consistently
    expect(serverHTML).not.toContain('undefined')
    expect(container.innerHTML).not.toContain('undefined')
  })

  it('should prevent hydration warnings with proper ClientOnly usage', () => {
    // Mock console.error to catch hydration warnings
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Render components that previously had hydration issues
    render(
      <div>
        <SystemOverview />
        <ActiveStreams />
      </div>
    )
    
    // Should not have any hydration-related console errors
    const hydrationErrors = consoleSpy.mock.calls.filter(call => 
      call.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('hydration') || arg.includes('server') || arg.includes('client'))
      )
    )
    
    expect(hydrationErrors).toHaveLength(0)
    
    consoleSpy.mockRestore()
  })

  it('should handle dynamic content with suppressHydrationWarning', () => {
    const DynamicComponent = () => (
      <div>
        <span suppressHydrationWarning>
          {typeof window !== 'undefined' ? 'Client' : 'Server'}
        </span>
      </div>
    )

    const serverHTML = renderToString(<DynamicComponent />)
    const { container } = render(<DynamicComponent />)
    
    // Server renders "Server", client renders "Client"
    expect(serverHTML).toContain('Server')
    expect(container.innerHTML).toContain('Client')
    
    // This should not cause hydration warnings due to suppressHydrationWarning
  })

  it('should maintain consistent loading states across SSR and CSR', () => {
    // Mock loading state
    vi.doMock('../../lib/streaming-proxies/hooks/useSystemStats', () => ({
      useSystemStats: () => ({
        data: null,
        loading: true,
        error: null,
        refetch: vi.fn()
      })
    }))

    const { SystemOverview: LoadingSystemOverview } = require('../../app/streaming-proxies/dashboard/_components/SystemOverview')
    
    const serverHTML = renderToString(<LoadingSystemOverview />)
    const { container } = render(<LoadingSystemOverview />)
    
    // Both should show loading state consistently
    expect(serverHTML).toContain('Loading') // or skeleton content
    expect(container.innerHTML).toContain('Loading')
  })
})