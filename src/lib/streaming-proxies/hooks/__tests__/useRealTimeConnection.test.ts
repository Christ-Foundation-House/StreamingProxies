import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRealTimeConnection } from '../useRealTimeConnection'

// Mock WebSocketManager
const mockWebSocketManager = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  send: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  getConnectionState: vi.fn(),
  isFallbackEnabled: vi.fn(),
}

vi.mock('../websocket-manager', () => ({
  WebSocketManager: vi.fn(() => mockWebSocketManager)
}))

describe('useRealTimeConnection Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWebSocketManager.getConnectionState.mockReturnValue({
      status: 'disconnected',
      error: null,
      lastConnected: null,
      reconnectAttempts: 0
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() => useRealTimeConnection())

    expect(result.current.connectionState.status).toBe('disconnected')
    expect(result.current.isConnected).toBe(false)
    expect(result.current.isConnecting).toBe(false)
  })

  it('should connect on mount when autoConnect is true', () => {
    renderHook(() => useRealTimeConnection({ autoConnect: true }))

    expect(mockWebSocketManager.connect).toHaveBeenCalledTimes(1)
  })

  it('should not connect on mount when autoConnect is false', () => {
    renderHook(() => useRealTimeConnection({ autoConnect: false }))

    expect(mockWebSocketManager.connect).not.toHaveBeenCalled()
  })

  it('should update connection state when WebSocket state changes', () => {
    const { result } = renderHook(() => useRealTimeConnection())

    // Simulate connection state change
    const stateChangeCallback = mockWebSocketManager.on.mock.calls.find(
      call => call[0] === 'stateChange'
    )?.[1]

    act(() => {
      stateChangeCallback?.({
        status: 'connected',
        error: null,
        lastConnected: new Date(),
        reconnectAttempts: 0
      })
    })

    expect(result.current.connectionState.status).toBe('connected')
    expect(result.current.isConnected).toBe(true)
  })

  it('should handle connection errors', () => {
    const { result } = renderHook(() => useRealTimeConnection())

    const errorCallback = mockWebSocketManager.on.mock.calls.find(
      call => call[0] === 'error'
    )?.[1]

    act(() => {
      errorCallback?.(new Error('Connection failed'))
    })

    expect(result.current.connectionState.status).toBe('error')
    expect(result.current.error).toBe('Connection failed')
  })

  it('should provide connect function', () => {
    const { result } = renderHook(() => useRealTimeConnection())

    act(() => {
      result.current.connect()
    })

    expect(mockWebSocketManager.connect).toHaveBeenCalledTimes(1)
  })

  it('should provide disconnect function', () => {
    const { result } = renderHook(() => useRealTimeConnection())

    act(() => {
      result.current.disconnect()
    })

    expect(mockWebSocketManager.disconnect).toHaveBeenCalledTimes(1)
  })

  it('should provide send function', () => {
    const { result } = renderHook(() => useRealTimeConnection())
    const testMessage = { type: 'test', data: 'hello' }

    act(() => {
      result.current.send(testMessage)
    })

    expect(mockWebSocketManager.send).toHaveBeenCalledWith(testMessage)
  })

  it('should handle message events', () => {
    const onMessage = vi.fn()
    renderHook(() => useRealTimeConnection({ onMessage }))

    const messageCallback = mockWebSocketManager.on.mock.calls.find(
      call => call[0] === 'message'
    )?.[1]

    const testMessage = { type: 'update', data: { id: 1 } }
    act(() => {
      messageCallback?.(testMessage)
    })

    expect(onMessage).toHaveBeenCalledWith(testMessage)
  })

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useRealTimeConnection())

    unmount()

    expect(mockWebSocketManager.disconnect).toHaveBeenCalledTimes(1)
    expect(mockWebSocketManager.off).toHaveBeenCalled()
  })

  it('should handle reconnection attempts', () => {
    const { result } = renderHook(() => useRealTimeConnection())

    const reconnectingCallback = mockWebSocketManager.on.mock.calls.find(
      call => call[0] === 'reconnecting'
    )?.[1]

    act(() => {
      reconnectingCallback?.()
    })

    expect(result.current.connectionState.status).toBe('connecting')
    expect(result.current.isConnecting).toBe(true)
  })

  it('should track reconnection attempts', () => {
    const { result } = renderHook(() => useRealTimeConnection())

    const stateChangeCallback = mockWebSocketManager.on.mock.calls.find(
      call => call[0] === 'stateChange'
    )?.[1]

    act(() => {
      stateChangeCallback?.({
        status: 'connecting',
        error: null,
        lastConnected: null,
        reconnectAttempts: 2
      })
    })

    expect(result.current.connectionState.reconnectAttempts).toBe(2)
  })

  it('should handle fallback mode', () => {
    mockWebSocketManager.isFallbackEnabled.mockReturnValue(true)
    const { result } = renderHook(() => useRealTimeConnection())

    const fallbackCallback = mockWebSocketManager.on.mock.calls.find(
      call => call[0] === 'fallbackMode'
    )?.[1]

    act(() => {
      fallbackCallback?.()
    })

    expect(result.current.isFallbackMode).toBe(true)
  })

  it('should provide retry function', () => {
    const { result } = renderHook(() => useRealTimeConnection())

    act(() => {
      result.current.retry()
    })

    expect(mockWebSocketManager.connect).toHaveBeenCalledTimes(1)
  })

  it('should handle custom WebSocket URL', () => {
    const customUrl = 'ws://custom-server:8080'
    renderHook(() => useRealTimeConnection({ url: customUrl }))

    // WebSocketManager should be created with custom URL
    expect(mockWebSocketManager.connect).toHaveBeenCalled()
  })

  it('should handle connection timeout', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRealTimeConnection({ 
      connectionTimeout: 5000 
    }))

    act(() => {
      result.current.connect()
    })

    // Simulate timeout
    act(() => {
      vi.advanceTimersByTime(6000)
    })

    expect(result.current.error).toContain('timeout')
    vi.useRealTimers()
  })
})