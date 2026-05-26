/**
 * useMunicipalityList - Hook para buscar lista de municipios
 *
 * Busca lista paginada de municipios com indicadores basicos
 * para exibicao na lista tabular.
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'

export interface MunicipalityListItem {
  codigoIbge: string
  nome: string
  mesorregiao: string
  populacao: number
  totalEleitores: number | null
  percentualVotoPartido: number | null
  ultimoAcesso: string | null
}

interface UseMunicipalityListOptions {
  uf: string
  search?: string
  sortBy?: 'nome' | 'populacao' | 'percentualVotoPartido'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

interface UseMunicipalityListReturn {
  municipalities: MunicipalityListItem[]
  total: number
  loading: boolean
  error: string | null
  refetch: () => void
}

interface ApiMunicipio {
  id: number
  codigo_ibge: string
  nome: string
  regiao: string | null
  populacao: number | null
  total_votos_validos: number
  vencedor_votos: number | null
}

interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: { total: number }
}

export function useMunicipalityList(
  options: UseMunicipalityListOptions
): UseMunicipalityListReturn {
  const { uf, search, sortBy = 'nome', sortOrder = 'asc', limit = 50, offset = 0 } = options

  const [municipalities, setMunicipalities] = useState<MunicipalityListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: response } = await api.get<ApiResponse<ApiMunicipio[]>>(
        '/analytics/municipios',
        { params: { uf, limit, offset } }
      )

      if (response.success && response.data) {
        let items: MunicipalityListItem[] = response.data.map((m) => ({
          codigoIbge: m.codigo_ibge,
          nome: m.nome,
          mesorregiao: m.regiao || 'Sem regiao',
          populacao: m.populacao || 0,
          totalEleitores: null, // TODO: integrar com dados de eleitorado
          percentualVotoPartido: m.vencedor_votos && m.total_votos_validos
            ? (m.vencedor_votos / m.total_votos_validos) * 100
            : null,
          ultimoAcesso: null, // TODO: integrar com historico de briefings
        }))

        // Filtrar por busca
        if (search) {
          const searchLower = search.toLowerCase()
          items = items.filter(
            (m) =>
              m.nome.toLowerCase().includes(searchLower) ||
              m.mesorregiao.toLowerCase().includes(searchLower)
          )
        }

        // Ordenar
        items.sort((a, b) => {
          let comparison = 0
          if (sortBy === 'nome') {
            comparison = a.nome.localeCompare(b.nome)
          } else if (sortBy === 'populacao') {
            comparison = a.populacao - b.populacao
          } else if (sortBy === 'percentualVotoPartido') {
            const aVal = a.percentualVotoPartido ?? 0
            const bVal = b.percentualVotoPartido ?? 0
            comparison = aVal - bVal
          }
          return sortOrder === 'asc' ? comparison : -comparison
        })

        setMunicipalities(items)
        setTotal(response.meta?.total || items.length)
      }
    } catch (err) {
      console.error('[useMunicipalityList] Erro:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar municipios')
    } finally {
      setLoading(false)
    }
  }, [uf, search, sortBy, sortOrder, limit, offset])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    municipalities,
    total,
    loading,
    error,
    refetch: fetchData,
  }
}

export default useMunicipalityList
