/**
 * useDiagnosticSettings Hook
 *
 * Fetches and manages diagnostic settings for a campaign.
 */

import { useState, useEffect, useCallback } from 'react'
import { diagnosticService } from '../services/diagnostic.service'
import type {
  DiagnosticSettings,
  ToneProfile,
  UpdateSettingsRequest,
} from '../types'

interface UseDiagnosticSettingsOptions {
  campaignId: string
  enabled?: boolean
}

interface UseDiagnosticSettingsReturn {
  settings: DiagnosticSettings | null
  toneProfiles: ToneProfile[]
  loading: boolean
  error: Error | null
  updating: boolean
  updateSettings: (updates: UpdateSettingsRequest) => Promise<void>
  refetch: () => Promise<void>
}

export function useDiagnosticSettings({
  campaignId,
  enabled = true,
}: UseDiagnosticSettingsOptions): UseDiagnosticSettingsReturn {
  const [settings, setSettings] = useState<DiagnosticSettings | null>(null)
  const [toneProfiles, setToneProfiles] = useState<ToneProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchData = useCallback(async () => {
    if (!campaignId || !enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [settingsResult, profilesResult] = await Promise.all([
        diagnosticService.getSettings(campaignId),
        diagnosticService.listToneProfiles(),
      ])

      setSettings(settingsResult)
      setToneProfiles(profilesResult)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'))
    } finally {
      setLoading(false)
    }
  }, [campaignId, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateSettings = useCallback(
    async (updates: UpdateSettingsRequest) => {
      if (!campaignId) return

      setUpdating(true)
      setError(null)

      try {
        const updatedSettings = await diagnosticService.updateSettings(
          campaignId,
          updates
        )
        setSettings(updatedSettings)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update settings'))
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [campaignId]
  )

  return {
    settings,
    toneProfiles,
    loading,
    error,
    updating,
    updateSettings,
    refetch: fetchData,
  }
}
