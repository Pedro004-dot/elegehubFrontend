import { useState, useEffect, useCallback } from 'react'
import type { Municipality } from '../types'
import {
  fetchMunicipiosMG,
  fetchFilters,
  transformMunicipioToMapFormat,
  type MapaMunicipioMG,
  type FiltersData,
  type CandidatoResumo,
} from '../services/analytics'

interface UseMunicipalitiesOptions {
  cargo?: string
  regiao?: string
  candidato?: CandidatoResumo | null
}

interface UseMunicipalitiesResult {
  municipalities: Municipality[]
  filters: FiltersData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMunicipalities(options: UseMunicipalitiesOptions = {}): UseMunicipalitiesResult {
  const { cargo, regiao, candidato } = options
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [filters, setFilters] = useState<FiltersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Busca municipios e filtros em paralelo
      const [municipiosData, filtersData] = await Promise.all([
        fetchMunicipiosMG({ cargo, regiao }),
        fetchFilters(),
      ])

      // Transforma para formato do mapa com classificacao por compatibilidade
      const transformed = municipiosData.map((m: MapaMunicipioMG) =>
        transformMunicipioToMapFormat(m, candidato)
      )

      setMunicipalities(transformed)
      setFilters(filtersData)
    } catch (err) {
      console.error('Error fetching municipalities:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar municipios')
    } finally {
      setLoading(false)
    }
  }, [cargo, regiao, candidato])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    municipalities,
    filters,
    loading,
    error,
    refetch: fetchData,
  }
}
