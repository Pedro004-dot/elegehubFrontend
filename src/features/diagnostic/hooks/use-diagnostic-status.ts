/**
 * useDiagnosticStatus Hook
 *
 * Polls the status of a running diagnostic at regular intervals.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { diagnosticService } from '../services/diagnostic.service'
import type { DiagnosticStatusResponse, DiagnosticStatus } from '../types'

interface UseDiagnosticStatusOptions {
  campaignId: string
  runId: string
  enabled?: boolean
  pollingInterval?: number // milliseconds
  onComplete?: () => void
  onError?: (error: Error) => void
}

interface UseDiagnosticStatusReturn {
  status: DiagnosticStatusResponse | null
  loading: boolean
  error: Error | null
  isPolling: boolean
  stopPolling: () => void
  startPolling: () => void
}

const TERMINAL_STATUSES: DiagnosticStatus[] = ['completed', 'failed', 'cancelled']

export function useDiagnosticStatus({
  campaignId,
  runId,
  enabled = true,
  pollingInterval = 3000, // 3 seconds default
  onComplete,
  onError,
}: UseDiagnosticStatusOptions): UseDiagnosticStatusReturn {
  const [status, setStatus] = useState<DiagnosticStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isPolling, setIsPolling] = useState(enabled)

  const intervalRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)

  // Keep refs updated
  onCompleteRef.current = onComplete
  onErrorRef.current = onError

  const fetchStatus = useCallback(async () => {
    if (!campaignId || !runId) return

    try {
      const result = await diagnosticService.getDiagnosticStatus(campaignId, runId)
      setStatus(result)
      setError(null)

      // Check if we've reached a terminal status
      if (TERMINAL_STATUSES.includes(result.status)) {
        setIsPolling(false)

        if (result.status === 'completed' && onCompleteRef.current) {
          onCompleteRef.current()
        } else if (result.status === 'failed' && onErrorRef.current) {
          onErrorRef.current(new Error(result.error_message || 'Diagnostic failed'))
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch status')
      setError(error)

      if (onErrorRef.current) {
        onErrorRef.current(error)
      }

      // Stop polling on error
      setIsPolling(false)
    } finally {
      setLoading(false)
    }
  }, [campaignId, runId])

  const stopPolling = useCallback(() => {
    setIsPolling(false)
  }, [])

  const startPolling = useCallback(() => {
    setIsPolling(true)
  }, [])

  // Initial fetch
  useEffect(() => {
    if (enabled && campaignId && runId) {
      fetchStatus()
    }
  }, [enabled, campaignId, runId, fetchStatus])

  // Polling effect
  useEffect(() => {
    if (isPolling && campaignId && runId) {
      intervalRef.current = window.setInterval(fetchStatus, pollingInterval)

      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }
  }, [isPolling, campaignId, runId, pollingInterval, fetchStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    status,
    loading,
    error,
    isPolling,
    stopPolling,
    startPolling,
  }
}
