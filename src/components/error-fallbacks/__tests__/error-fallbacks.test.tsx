import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentErrorFallback } from '../ComponentErrorFallback'
import { NetworkErrorFallback } from '../NetworkErrorFallback'
import { LoadingErrorFallback } from '../LoadingErrorFallback'
import { DashboardSectionErrorFallback } from '../DashboardSectionErrorFallback'

describe('Error Fallback Components', () => {
  const mockRetry = vi.fn()
  const mockError = new Error('Test error message')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ComponentErrorFallback', () => {
    it('should render error message and retry button', () => {
      render(<ComponentErrorFallback error={mockError} retry={mockRetry} />)

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(screen.getByText('Test error message')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('should call retry function when button is clicked', () => {
      render(<ComponentErrorFallback error={mockError} retry={mockRetry} />)

      fireEvent.click(screen.getByRole('button', { name: /try again/i }))
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })

    it('should handle long error messages gracefully', () => {
      const longError = new Error('This is a very long error message that should be displayed properly without breaking the layout or causing any visual issues')
      
      render(<ComponentErrorFallback error={longError} retry={mockRetry} />)

      expect(screen.getByText(longError.message)).toBeInTheDocument()
    })
  })

  describe('NetworkErrorFallback', () => {
    it('should render network-specific error message', () => {
      const networkError = new Error('Failed to fetch')
      render(<NetworkErrorFallback error={networkError} retry={mockRetry} />)

      expect(screen.getByText(/connection problem/i)).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument()
    })

    it('should show offline indicator when appropriate', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      render(<NetworkErrorFallback error={mockError} retry={mockRetry} />)

      expect(screen.getByText(/offline/i)).toBeInTheDocument()
    })

    it('should call retry function for network errors', () => {
      render(<NetworkErrorFallback error={mockError} retry={mockRetry} />)

      fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('LoadingErrorFallback', () => {
    it('should render loading-specific error message', () => {
      render(<LoadingErrorFallback error={mockError} retry={mockRetry} />)

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
    })

    it('should provide helpful loading error guidance', () => {
      render(<LoadingErrorFallback error={mockError} retry={mockRetry} />)

      expect(screen.getByText(/try refreshing/i)).toBeInTheDocument()
    })

    it('should call retry function for loading errors', () => {
      render(<LoadingErrorFallback error={mockError} retry={mockRetry} />)

      fireEvent.click(screen.getByRole('button', { name: /reload/i }))
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('DashboardSectionErrorFallback', () => {
    it('should render section-specific error message', () => {
      render(<DashboardSectionErrorFallback error={mockError} retry={mockRetry} />)

      expect(screen.getByText(/section unavailable/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /refresh section/i })).toBeInTheDocument()
    })

    it('should allow continuing with other sections', () => {
      render(<DashboardSectionErrorFallback error={mockError} retry={mockRetry} />)

      expect(screen.getByText(/other sections/i)).toBeInTheDocument()
    })

    it('should call retry function for section errors', () => {
      render(<DashboardSectionErrorFallback error={mockError} retry={mockRetry} />)

      fireEvent.click(screen.getByRole('button', { name: /refresh section/i }))
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Fallback Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ComponentErrorFallback error={mockError} retry={mockRetry} />)

      const errorContainer = screen.getByRole('alert')
      expect(errorContainer).toBeInTheDocument()
      
      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      render(<ComponentErrorFallback error={mockError} retry={mockRetry} />)

      const retryButton = screen.getByRole('button', { name: /try again/i })
      
      // Focus the button
      retryButton.focus()
      expect(retryButton).toHaveFocus()

      // Press Enter
      fireEvent.keyDown(retryButton, { key: 'Enter', code: 'Enter' })
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })
})