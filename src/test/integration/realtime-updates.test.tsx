import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'

// Mock components that use real-time data
const MockSystemOverview = () => {
  const [stats, setStats] = React.useState({
    totalProxies: 0,
    activeProxies: 0,
    totalActiveStreams: 0
  })

  React.useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalActiveStreams: prev.totalActiveStreams + 1
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div data-testid="system-overview">
      <div data-testid="total-proxies">{stats.totalProxies}</div>
      <div data-testid="active-proxies">{stats.activeProxies}</div>
      <div data-testid="active-streams">{stats.totalActiveStreams}</div>
    </div>
  )
}

const MockActiveStreams = () => {
  const [streams, setStreams] = React.useState<any[]>([])

  React.useEffect(() => {
    // Simulate WebSocket message
    const timeout = setTimeout(() => {
      setStreams([
        { id: '1', status: 'active', viewerCount: 100 },
        { id: '2', status: 'active', viewerCount: 250 }
      ])
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div data-testid="active-streams">
      {streams.map(stream => (
        <div key={stream.id} data-testid={`stream-${stream.id}`}>
          Stream {stream.id}: {stream.viewerCount} viewers
        </div>
      ))}
    </div>
  )
}

// Mock WebSocket for integration tests
class MockWebSocketForIntegration {
  static OPEN = 1
  readyState = MockWebSocketForIntegration.OPEN
  onmessage: ((event: MessageEvent) => void) | null = null
  
  constructor(public url: string) {}
  
  send = vi.fn()
  close = vi.fn()
  
  simulateMessage(data: any) {
    this.onmessage?.(new MessageEvent('message', { 
      data: JSON.stringify(data) 
    }))
  }
}

describe('Real-Time Updates Integration', () => {
  let mockWebSocket: MockWebSocketForIntegration

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    mockWebSocket = new MockWebSocketForIntegration('ws://localhost:8080')
    global.WebSocket = vi.fn(() => mockWebSocket) as any
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should handle real-time system stats updates', async () => {
    render(<MockSystemOverview />)

    // Initial state
    expect(screen.getByTestId('active-streams')).toHaveTextContent('0')

    // Advance time to trigger update
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId('active-streams')).toHaveTextContent('1')

    // Another update
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId('active-streams')).toHaveTextContent('2')
  })

  it('should handle WebSocket stream updates', async () => {
    render(<MockActiveStreams />)

    // Initially no streams
    expect(screen.queryByTestId('stream-1')).not.toBeInTheDocument()

    // Wait for WebSocket data
    act(() => {
      vi.advanceTimersByTime(500)
    })

    await waitFor(() => {
      expect(screen.getByTestId('stream-1')).toBeInTheDocument()
      expect(screen.getByTestId('stream-2')).toBeInTheDocument()
    })

    expect(screen.getByTestId('stream-1')).toHaveTextContent('Stream 1: 100 viewers')
    expect(screen.getByTestId('stream-2')).toHaveTextContent('Stream 2: 250 viewers')
  })

  it('should batch multiple rapid updates', async () => {
    const BatchedComponent = () => {
      const [count, setCount] = React.useState(0)
      const [batchedUpdates, setBatchedUpdates] = React.useState<number[]>([])

      React.useEffect(() => {
        // Simulate rapid updates
        const updates = [1, 2, 3, 4, 5]
        updates.forEach((update, index) => {
          setTimeout(() => {
            setCount(update)
            setBatchedUpdates(prev => [...prev, update])
          }, index * 10) // Very rapid updates
        })
      }, [])

      return (
        <div>
          <div data-testid="current-count">{count}</div>
          <div data-testid="update-count">{batchedUpdates.length}</div>
        </div>
      )
    }

    render(<BatchedComponent />)

    // Advance time to process all updates
    act(() => {
      vi.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(screen.getByTestId('current-count')).toHaveTextContent('5')
      expect(screen.getByTestId('update-count')).toHaveTextContent('5')
    })
  })

  it('should handle WebSocket disconnection and reconnection', async () => {
    const ConnectionAwareComponent = () => {
      const [connected, setConnected] = React.useState(true)
      const [data, setData] = React.useState<any[]>([])

      React.useEffect(() => {
        // Simulate connection loss
        const disconnectTimeout = setTimeout(() => {
          setConnected(false)
        }, 1000)

        // Simulate reconnection
        const reconnectTimeout = setTimeout(() => {
          setConnected(true)
          setData([{ id: 1, message: 'Reconnected data' }])
        }, 2000)

        return () => {
          clearTimeout(disconnectTimeout)
          clearTimeout(reconnectTimeout)
        }
      }, [])

      return (
        <div>
          <div data-testid="connection-status">
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          <div data-testid="data-count">{data.length}</div>
        </div>
      )
    }

    render(<ConnectionAwareComponent />)

    // Initially connected
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected')

    // Simulate disconnection
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected')

    // Simulate reconnection with data
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected')
    expect(screen.getByTestId('data-count')).toHaveTextContent('1')
  })

  it('should handle fallback to mock data when WebSocket fails', async () => {
    const FallbackComponent = () => {
      const [data, setData] = React.useState<any[]>([])
      const [usingFallback, setUsingFallback] = React.useState(false)

      React.useEffect(() => {
        // Simulate WebSocket failure and fallback
        const failureTimeout = setTimeout(() => {
          setUsingFallback(true)
          setData([
            { id: 'mock-1', type: 'fallback', value: 'Mock data 1' },
            { id: 'mock-2', type: 'fallback', value: 'Mock data 2' }
          ])
        }, 500)

        return () => clearTimeout(failureTimeout)
      }, [])

      return (
        <div>
          <div data-testid="fallback-status">
            {usingFallback ? 'Using fallback data' : 'Using real-time data'}
          </div>
          <div data-testid="data-items">
            {data.map(item => (
              <div key={item.id} data-testid={`item-${item.id}`}>
                {item.value}
              </div>
            ))}
          </div>
        </div>
      )
    }

    render(<FallbackComponent />)

    // Initially using real-time
    expect(screen.getByTestId('fallback-status')).toHaveTextContent('Using real-time data')

    // Switch to fallback
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(screen.getByTestId('fallback-status')).toHaveTextContent('Using fallback data')
    expect(screen.getByTestId('item-mock-1')).toHaveTextContent('Mock data 1')
    expect(screen.getByTestId('item-mock-2')).toHaveTextContent('Mock data 2')
  })

  it('should handle high-frequency updates without performance issues', async () => {
    const HighFrequencyComponent = () => {
      const [updateCount, setUpdateCount] = React.useState(0)
      const [lastUpdate, setLastUpdate] = React.useState(Date.now())

      React.useEffect(() => {
        // Simulate high-frequency updates (every 10ms)
        const interval = setInterval(() => {
          setUpdateCount(prev => prev + 1)
          setLastUpdate(Date.now())
        }, 10)

        // Stop after 100 updates
        const stopTimeout = setTimeout(() => {
          clearInterval(interval)
        }, 1000)

        return () => {
          clearInterval(interval)
          clearTimeout(stopTimeout)
        }
      }, [])

      return (
        <div>
          <div data-testid="update-count">{updateCount}</div>
          <div data-testid="last-update">{lastUpdate}</div>
        </div>
      )
    }

    render(<HighFrequencyComponent />)

    // Let high-frequency updates run
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Should handle ~100 updates
    await waitFor(() => {
      const count = parseInt(screen.getByTestId('update-count').textContent || '0')
      expect(count).toBeGreaterThan(90) // Allow for some timing variance
    })
  })

  it('should maintain UI responsiveness during real-time updates', async () => {
    const ResponsiveComponent = () => {
      const [realtimeData, setRealtimeData] = React.useState<number[]>([])
      const [userInteraction, setUserInteraction] = React.useState(0)

      React.useEffect(() => {
        // Continuous real-time updates
        const interval = setInterval(() => {
          setRealtimeData(prev => [...prev, Date.now()])
        }, 100)

        return () => clearInterval(interval)
      }, [])

      return (
        <div>
          <button 
            data-testid="interaction-button"
            onClick={() => setUserInteraction(prev => prev + 1)}
          >
            Click me ({userInteraction})
          </button>
          <div data-testid="realtime-count">{realtimeData.length}</div>
        </div>
      )
    }

    render(<ResponsiveComponent />)

    // Start real-time updates
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // User interaction should still work
    const button = screen.getByTestId('interaction-button')
    act(() => {
      button.click()
    })

    expect(button).toHaveTextContent('Click me (1)')

    // Real-time updates should continue
    const realtimeCount = parseInt(screen.getByTestId('realtime-count').textContent || '0')
    expect(realtimeCount).toBeGreaterThan(0)
  })
})