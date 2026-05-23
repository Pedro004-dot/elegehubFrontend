/**
 * useMunicipalityAnalysis Hook
 *
 * Fetches and manages municipality analysis data (scores, costs, ROI).
 * Uses the deterministic algorithm endpoint.
 */

import { useState, useEffect, useCallback } from 'react'
import { diagnosticService } from '../services/diagnostic.service'
import type {
  MunicipalityAnalysisResponse,
  TerritorialMunicipio,
  TerritorialClassification,
} from '../types'

interface UseMunicipalityAnalysisOptions {
  campaignId: string
  enabled?: boolean
}

interface UseMunicipalityAnalysisReturn {
  data: MunicipalityAnalysisResponse['data'] | null
  municipios: TerritorialMunicipio[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useMunicipalityAnalysis({
  campaignId,
  enabled = true,
}: UseMunicipalityAnalysisOptions): UseMunicipalityAnalysisReturn {
  const [data, setData] = useState<MunicipalityAnalysisResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnalysis = useCallback(async () => {
    if (!campaignId || !enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await diagnosticService.getMunicipalityAnalysis(campaignId)

      if (response.success) {
        setData(response.data)
      } else {
        throw new Error('Failed to fetch municipality analysis')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch municipality analysis'))
    } finally {
      setLoading(false)
    }
  }, [campaignId, enabled])

  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  return {
    data,
    municipios: data?.municipios ?? [],
    loading,
    error,
    refetch: fetchAnalysis,
  }
}

// =============================================================================
// Additional Hooks for Specific Use Cases
// =============================================================================

interface UseTopMunicipiosOptions {
  campaignId: string
  criterio?: 'votos' | 'roi' | 'score' | 'eleitorado'
  limit?: number
  enabled?: boolean
}

interface UseTopMunicipiosReturn {
  municipios: TerritorialMunicipio[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useTopMunicipios({
  campaignId,
  criterio = 'votos',
  limit = 50,
  enabled = true,
}: UseTopMunicipiosOptions): UseTopMunicipiosReturn {
  const [municipios, setMunicipios] = useState<TerritorialMunicipio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!campaignId || !enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await diagnosticService.getTopMunicipios(campaignId, criterio, limit)
      setMunicipios(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch top municipios'))
    } finally {
      setLoading(false)
    }
  }, [campaignId, criterio, limit, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    municipios,
    loading,
    error,
    refetch: fetchData,
  }
}

interface UseMunicipiosByClassificationOptions {
  campaignId: string
  classification: TerritorialClassification
  enabled?: boolean
}

interface UseMunicipiosByClassificationReturn {
  municipios: TerritorialMunicipio[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useMunicipiosByClassification({
  campaignId,
  classification,
  enabled = true,
}: UseMunicipiosByClassificationOptions): UseMunicipiosByClassificationReturn {
  const [municipios, setMunicipios] = useState<TerritorialMunicipio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!campaignId || !enabled || classification === 'alta_abstencao') {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await diagnosticService.getMunicipiosByClassification(
        campaignId,
        classification as 'fiel' | 'pendular' | 'disputavel' | 'hostil'
      )
      setMunicipios(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch municipios by classification'))
    } finally {
      setLoading(false)
    }
  }, [campaignId, classification, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    municipios,
    loading,
    error,
    refetch: fetchData,
  }
}
