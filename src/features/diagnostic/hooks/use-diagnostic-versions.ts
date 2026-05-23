/**
 * useDiagnosticVersions Hook
 *
 * Fetches all diagnostic versions (runs) for a campaign.
 */

import { useState, useEffect, useCallback } from 'react'
import { diagnosticService } from '../services/diagnostic.service'
import type { DiagnosticRun } from '../types'

interface UseDiagnosticVersionsOptions {
  campaignId: string
  enabled?: boolean
}

interface UseDiagnosticVersionsReturn {
  versions: DiagnosticRun[]
  loading: boolean
  error: Error | null
  latestVersion: DiagnosticRun | null
  hasVersions: boolean
  refetch: () => Promise<void>
}

export function useDiagnosticVersions({
  campaignId,
  enabled = true,
}: UseDiagnosticVersionsOptions): UseDiagnosticVersionsReturn {
  const [versions, setVersions] = useState<DiagnosticRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVersions = useCallback(async () => {
    if (!campaignId || !enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await diagnosticService.listDiagnostics(campaignId)
      // Sort by version descending (newest first)
      const sorted = result.sort((a, b) => b.version - a.version)
      setVersions(sorted)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch versions'))
    } finally {
      setLoading(false)
    }
  }, [campaignId, enabled])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  // Find the latest completed version
  const latestVersion = versions.find((v) => v.status === 'completed') || null

  return {
    versions,
    loading,
    error,
    latestVersion,
    hasVersions: versions.length > 0,
    refetch: fetchVersions,
  }
}
