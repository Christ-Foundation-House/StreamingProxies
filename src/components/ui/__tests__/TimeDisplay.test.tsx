import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimeDisplay } from '../TimeDisplay'

// Mock ClientOnly to test hydration prevention
vi.mock('../../ClientOnly', () => ({
  ClientOnly: ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
    // Simulate server-side rendering by returning fallback initially
    const [mounted, setMounted] = React.useState(false)
    
    React.useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) {
      return fallback || null
    }
    
    return <>{children}</>
  }
}))

describe('TimeDisplay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock Date.now to ensure consistent timestamps
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  it('should prevent hydration mismatch by using ClientOnly wrapper', () => {
    const testDate = new Date('2024-01-01T10:00:00Z')
    
    render(<TimeDisplay timestamp={testDate} />)
    
    // Should eventually render the formatted time
    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument()
  })

  it('should show fallback during server-side rendering', () => {
    // Mock ClientOnly to simulate server-side rendering
    vi.doMock('../../ClientOnly', () => ({
      ClientOnly: ({ fallback }: { fallback?: React.ReactNode }) => fallback || null
    }))

    const testDate = new Date('2024-01-01T10:00:00Z')
    
    const { rerender } = render(<TimeDisplay timestamp={testDate} />)
    
    // Should show fallback initially
    expect(screen.getByText('--')).toBeInTheDocument()
    
    // Re-render to simulate client-side hydration
    rerender(<TimeDisplay timestamp={testDate} />)
  })

  it('should format relative time correctly', () => {
    const testCases = [
      { date: new Date('2024-01-01T11:59:00Z'), expected: /1 minute ago/ },
      { date: new Date('2024-01-01T11:00:00Z'), expected: /1 hour ago/ },
      { date: new Date('2023-12-31T12:00:00Z'), expected: /1 day ago/ },
    ]

    testCases.forEach(({ date, expected }) => {
      const { unmount } = render(<TimeDisplay timestamp={date} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    })
  })

  it('should format absolute time when specified', () => {
    const testDate = new Date('2024-01-01T10:30:00Z')
    
    render(<TimeDisplay timestamp={testDate} format="absolute" />)
    
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument()
  })

  it('should handle invalid dates gracefully', () => {
    const invalidDate = new Date('invalid')
    
    render(<TimeDisplay timestamp={invalidDate} />)
    
    expect(screen.getByText('Invalid date')).toBeInTheDocument()
  })

  it('should update relative time periodically', async () => {
    const testDate = new Date('2024-01-01T11:59:00Z')
    
    render(<TimeDisplay timestamp={testDate} />)
    
    expect(screen.getByText(/1 minute ago/)).toBeInTheDocument()
    
    // Advance time by 1 minute
    vi.setSystemTime(new Date('2024-01-01T12:01:00Z'))
    
    // Wait for the component to update (it should update every minute)
    await vi.waitFor(() => {
      expect(screen.getByText(/2 minutes ago/)).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})