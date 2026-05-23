/**
 * useDiagnostic Hook
 *
 * Fetches and manages a single diagnostic by run ID.
 */

import { useState, useEffect, useCallback } from 'react'
import { diagnosticService } from '../services/diagnostic.service'
import type { DiagnosticFull } from '../types'

interface UseDiagnosticOptions {
  campaignId: string
  runId?: string
  enabled?: boolean
}

interface UseDiagnosticReturn {
  diagnostic: DiagnosticFull | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useDiagnostic({
  campaignId,
  runId,
  enabled = true,
}: UseDiagnosticOptions): UseDiagnosticReturn {
  const [diagnostic, setDiagnostic] = useState<DiagnosticFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDiagnostic = useCallback(async () => {
    if (!campaignId || !enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result: DiagnosticFull | null

      if (runId) {
        // Fetch specific diagnostic by run ID
        result = await diagnosticService.getDiagnostic(campaignId, runId)
      } else {
        // Fetch latest diagnostic
        result = await diagnosticService.getLatestDiagnostic(campaignId)
      }

      setDiagnostic(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch diagnostic'))
    } finally {
      setLoading(false)
    }
  }, [campaignId, runId, enabled])

  useEffect(() => {
    fetchDiagnostic()
  }, [fetchDiagnostic])

  return {
    diagnostic,
    loading,
    error,
    refetch: fetchDiagnostic,
  }
}
