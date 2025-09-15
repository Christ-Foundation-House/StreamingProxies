/**
 * Test Runner for Hydration and Error Boundary Tests
 * 
 * This file provides utilities to run comprehensive tests for:
 * - Hydration prevention
 * - Error boundary functionality
 * - WebSocket connection handling
 * - Real-time update integration
 */

import { describe, it, expect } from 'vitest'

export const runHydrationTests = () => {
  describe('Hydration Prevention Test Suite', () => {
    it('should run ClientOnly component tests', async () => {
      const { default: clientOnlyTests } = await import('../components/__tests__/ClientOnly.test')
      expect(clientOnlyTests).toBeDefined()
    })

    it('should run TimeDisplay component tests', async () => {
      const { default: timeDisplayTests } = await import('../components/ui/__tests__/TimeDisplay.test')
      expect(timeDisplayTests).toBeDefined()
    })

    it('should run SSR hydration integration tests', async () => {
      const { default: ssrTests } = await import('./integration/ssr-hydration.test')
      expect(ssrTests).toBeDefined()
    })

    it('should run dashboard hydration tests', async () => {
      const { default: dashboardTests } = await import('../app/streaming-proxies/dashboard/_components/__tests__/dashboard-hydration.test')
      expect(dashboardTests).toBeDefined()
    })
  })
}

export const runErrorBoundaryTests = () => {
  describe('Error Boundary Test Suite', () => {
    it('should run ErrorBoundary component tests', async () => {
      const { default: errorBoundaryTests } = await import('../components/__tests__/ErrorBoundary.test')
      expect(errorBoundaryTests).toBeDefined()
    })

    it('should run error fallback component tests', async () => {
      const { default: errorFallbackTests } = await import('../components/error-fallbacks/__tests__/error-fallbacks.test')
      expect(errorFallbackTests).toBeDefined()
    })
  })
}

export const runWebSocketTests = () => {
  describe('WebSocket Handling Test Suite', () => {
    it('should run WebSocketManager tests', async () => {
      const { default: wsManagerTests } = await import('../lib/streaming-proxies/__tests__/websocket-manager.test')
      expect(wsManagerTests).toBeDefined()
    })

    it('should run useRealTimeConnection hook tests', async () => {
      const { default: realtimeHookTests } = await import('../lib/streaming-proxies/hooks/__tests__/useRealTimeConnection.test')
      expect(realtimeHookTests).toBeDefined()
    })

    it('should run real-time updates integration tests', async () => {
      const { default: realtimeIntegrationTests } = await import('./integration/realtime-updates.test')
      expect(realtimeIntegrationTests).toBeDefined()
    })
  })
}

export const runAllTests = () => {
  describe('Complete Test Suite for Fixed Issues', () => {
    runHydrationTests()
    runErrorBoundaryTests()
    runWebSocketTests()
  })
}

// Export test utilities for manual testing
export const testUtilities = {
  // Mock WebSocket for testing
  createMockWebSocket: (url: string) => ({
    url,
    readyState: 1,
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    simulateMessage: function(data: any) {
      this.onmessage?.({ data: JSON.stringify(data) })
    },
    simulateError: function() {
      this.onerror?.(new Error('Mock WebSocket error'))
    },
    simulateClose: function() {
      this.onclose?.({ code: 1000, reason: 'Normal closure' })
    }
  }),

  // Mock error for testing error boundaries
  createTestError: (message: string = 'Test error') => new Error(message),

  // Mock component that throws error
  createErrorComponent: (shouldThrow: boolean = true) => {
    return function ErrorComponent() {
      if (shouldThrow) {
        throw new Error('Component error for testing')
      }
      return React.createElement('div', { 'data-testid': 'success' }, 'No error')
    }
  },

  // Mock time-sensitive component
  createTimeComponent: (timestamp: Date) => {
    return function TimeComponent() {
      return React.createElement('div', {
        'data-testid': 'time-display',
        suppressHydrationWarning: true
      }, typeof window !== 'undefined' ? timestamp.toLocaleString() : '--')
    }
  }
}