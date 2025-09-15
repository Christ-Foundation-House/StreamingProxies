import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WebSocketManager } from '../websocket-manager'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(url: string) {
    this.url = url
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      this.onopen?.(new Event('open'))
    }, 10)
  }

  send = vi.fn()
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.(new CloseEvent('close'))
  })

  // Helper methods for testing
  simulateMessage(data: any) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }))
  }

  simulateError() {
    this.onerror?.(new Event('error'))
  }

  simulateClose(code = 1000, reason = 'Normal closure') {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.(new CloseEvent('close', { code, reason }))
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any

describe('WebSocketManager', () => {
  let wsManager: WebSocketManager
  const mockUrl = 'ws://localhost:8080'
  const mockConfig = {
    url: mockUrl,
    reconnectAttempts: 3,
    reconnectInterval: 1000,
    enableFallback: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    wsManager = new WebSocketManager(mockConfig)
  })

  afterEach(() => {
    wsManager.disconnect()
    vi.useRealTimers()
  })

  describe('Connection Management', () => {
    it('should connect to WebSocket server', async () => {
      const connectPromise = wsManager.connect()
      
      // Fast-forward timers to simulate connection
      vi.advanceTimersByTime(20)
      
      await connectPromise
      
      expect(wsManager.getConnectionState().status).toBe('connected')
    })

    it('should handle connection errors', async () => {
      const onError = vi.fn()
      wsManager.on('error', onError)

      // Mock WebSocket to fail immediately
      global.WebSocket = vi.fn(() => {
        const ws = new MockWebSocket(mockUrl)
        setTimeout(() => ws.simulateError(), 5)
        return ws
      }) as any

      wsManager.connect()
      vi.advanceTimersByTime(20)

      expect(onError).toHaveBeenCalled()
      expect(wsManager.getConnectionState().status).toBe('error')
    })

    it('should disconnect properly', () => {
      wsManager.connect()
      vi.advanceTimersByTime(20)

      wsManager.disconnect()

      expect(wsManager.getConnectionState().status).toBe('disconnected')
    })

    it('should track connection state correctly', () => {
      const initialState = wsManager.getConnectionState()
      expect(initialState.status).toBe('disconnected')
      expect(initialState.reconnectAttempts).toBe(0)

      wsManager.connect()
      expect(wsManager.getConnectionState().status).toBe('connecting')

      vi.advanceTimersByTime(20)
      expect(wsManager.getConnectionState().status).toBe('connected')
    })
  })

  describe('Reconnection Logic', () => {
    it('should attempt reconnection on connection loss', () => {
      const onReconnecting = vi.fn()
      wsManager.on('reconnecting', onReconnecting)

      // Connect first
      wsManager.connect()
      vi.advanceTimersByTime(20)

      // Simulate connection loss
      const ws = wsManager['ws'] as MockWebSocket
      ws.simulateClose(1006, 'Connection lost')

      expect(onReconnecting).toHaveBeenCalled()
      expect(wsManager.getConnectionState().status).toBe('connecting')
    })

    it('should use exponential backoff for reconnection', () => {
      wsManager.connect()
      vi.advanceTimersByTime(20)

      // Simulate multiple connection failures
      for (let i = 0; i < 3; i++) {
        const ws = wsManager['ws'] as MockWebSocket
        ws.simulateClose(1006, 'Connection lost')
        vi.advanceTimersByTime(1000 * Math.pow(2, i)) // Exponential backoff
      }

      const state = wsManager.getConnectionState()
      expect(state.reconnectAttempts).toBe(3)
    })

    it('should stop reconnecting after max attempts', () => {
      const onMaxReconnectAttemptsReached = vi.fn()
      wsManager.on('maxReconnectAttemptsReached', onMaxReconnectAttemptsReached)

      wsManager.connect()
      vi.advanceTimersByTime(20)

      // Simulate failures beyond max attempts
      for (let i = 0; i <= mockConfig.reconnectAttempts; i++) {
        const ws = wsManager['ws'] as MockWebSocket
        ws.simulateClose(1006, 'Connection lost')
        vi.advanceTimersByTime(5000) // Advance enough time for all reconnect attempts
      }

      expect(onMaxReconnectAttemptsReached).toHaveBeenCalled()
      expect(wsManager.getConnectionState().status).toBe('error')
    })

    it('should reset reconnect attempts on successful connection', () => {
      wsManager.connect()
      vi.advanceTimersByTime(20)

      // Simulate connection loss and reconnection
      const ws = wsManager['ws'] as MockWebSocket
      ws.simulateClose(1006, 'Connection lost')
      vi.advanceTimersByTime(1000)

      // Should reset attempts after successful reconnection
      vi.advanceTimersByTime(20)
      expect(wsManager.getConnectionState().reconnectAttempts).toBe(0)
    })
  })

  describe('Message Handling', () => {
    it('should send messages when connected', async () => {
      await wsManager.connect()
      vi.advanceTimersByTime(20)

      const testMessage = { type: 'test', data: 'hello' }
      wsManager.send(testMessage)

      const ws = wsManager['ws'] as MockWebSocket
      expect(ws.send).toHaveBeenCalledWith(JSON.stringify(testMessage))
    })

    it('should queue messages when disconnected', () => {
      const testMessage = { type: 'test', data: 'hello' }
      wsManager.send(testMessage)

      // Message should be queued, not sent immediately
      expect(wsManager['messageQueue']).toContain(testMessage)
    })

    it('should process queued messages on reconnection', async () => {
      const testMessage = { type: 'test', data: 'hello' }
      wsManager.send(testMessage) // Queue message while disconnected

      await wsManager.connect()
      vi.advanceTimersByTime(20)

      const ws = wsManager['ws'] as MockWebSocket
      expect(ws.send).toHaveBeenCalledWith(JSON.stringify(testMessage))
      expect(wsManager['messageQueue']).toHaveLength(0)
    })

    it('should emit received messages', () => {
      const onMessage = vi.fn()
      wsManager.on('message', onMessage)

      wsManager.connect()
      vi.advanceTimersByTime(20)

      const testData = { type: 'update', payload: { id: 1, status: 'active' } }
      const ws = wsManager['ws'] as MockWebSocket
      ws.simulateMessage(testData)

      expect(onMessage).toHaveBeenCalledWith(testData)
    })

    it('should handle malformed messages gracefully', () => {
      const onError = vi.fn()
      wsManager.on('error', onError)

      wsManager.connect()
      vi.advanceTimersByTime(20)

      const ws = wsManager['ws'] as MockWebSocket
      ws.onmessage?.(new MessageEvent('message', { data: 'invalid json' }))

      expect(onError).toHaveBeenCalled()
    })
  })

  describe('Event System', () => {
    it('should support event listeners', () => {
      const onConnect = vi.fn()
      const onDisconnect = vi.fn()

      wsManager.on('connected', onConnect)
      wsManager.on('disconnected', onDisconnect)

      wsManager.connect()
      vi.advanceTimersByTime(20)
      expect(onConnect).toHaveBeenCalled()

      wsManager.disconnect()
      expect(onDisconnect).toHaveBeenCalled()
    })

    it('should support removing event listeners', () => {
      const onConnect = vi.fn()
      wsManager.on('connected', onConnect)
      wsManager.off('connected', onConnect)

      wsManager.connect()
      vi.advanceTimersByTime(20)

      expect(onConnect).not.toHaveBeenCalled()
    })

    it('should emit connection state changes', () => {
      const onStateChange = vi.fn()
      wsManager.on('stateChange', onStateChange)

      wsManager.connect()
      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'connecting' })
      )

      vi.advanceTimersByTime(20)
      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'connected' })
      )
    })
  })

  describe('Fallback Mode', () => {
    it('should enable fallback mode when configured', () => {
      const fallbackManager = new WebSocketManager({
        ...mockConfig,
        enableFallback: true
      })

      expect(fallbackManager.isFallbackEnabled()).toBe(true)
    })

    it('should switch to fallback mode after max reconnect attempts', () => {
      const onFallbackMode = vi.fn()
      wsManager.on('fallbackMode', onFallbackMode)

      // Simulate repeated connection failures
      wsManager.connect()
      for (let i = 0; i <= mockConfig.reconnectAttempts; i++) {
        vi.advanceTimersByTime(20)
        const ws = wsManager['ws'] as MockWebSocket
        ws.simulateError()
        vi.advanceTimersByTime(5000)
      }

      expect(onFallbackMode).toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should clean up resources on disconnect', () => {
      wsManager.connect()
      vi.advanceTimersByTime(20)

      const ws = wsManager['ws'] as MockWebSocket
      const closeSpy = vi.spyOn(ws, 'close')

      wsManager.disconnect()

      expect(closeSpy).toHaveBeenCalled()
      expect(wsManager['ws']).toBeNull()
    })

    it('should clear reconnection timers on disconnect', () => {
      wsManager.connect()
      vi.advanceTimersByTime(20)

      // Simulate connection loss to start reconnection timer
      const ws = wsManager['ws'] as MockWebSocket
      ws.simulateClose(1006, 'Connection lost')

      // Disconnect should clear the timer
      wsManager.disconnect()

      // Advance time - no reconnection should happen
      vi.advanceTimersByTime(10000)
      expect(wsManager.getConnectionState().status).toBe('disconnected')
    })
  })
})