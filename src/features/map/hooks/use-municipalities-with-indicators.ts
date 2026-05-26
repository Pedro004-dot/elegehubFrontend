/**
 * useMunicipalitiesWithIndicators - Hook para buscar municipios com indicadores
 *
 * Busca dados dos municipios e seus indicadores para coloracao do mapa.
 *
 * ESTRATEGIA DE DADOS:
 * 1. Tenta buscar do endpoint /intelligence/indicadores/bulk (dados reais cacheados)
 * 2. Se falhar, busca de /analytics/municipios e gera mock para indicadores faltantes
 *
 * STATUS DOS INDICADORES:
 * - percentual_voto_partido: REAL (do cache ou calculado de fact_votacao)
 * - populacao: REAL (de dim_municipio)
 * - saldo_caged: REAL quando cacheado, MOCK como fallback
 * - cobertura_psf: REAL quando cacheado, MOCK como fallback
 * - taxa_abstencao: REAL quando cacheado, MOCK como fallback
 * - ideb: REAL quando cacheado, MOCK como fallback
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '@/services/api'
import type { MunicipalityWithIndicators, IndicatorId } from '../types'

interface UseMunicipalitiesOptions {
  uf: string
  ano?: number
  partidoId?: number
}

interface UseMunicipalitiesResult {
  municipalities: MunicipalityWithIndicators[]
  loading: boolean
  error: string | null
  refetch: () => void
  /** Indica se alguns indicadores sao mock */
  hasMockData: boolean
}

// ===========================================================================
// Tipos da API de Bulk Indicators
// ===========================================================================

interface ApiBulkIndicadores {
  codigo_ibge: string
  nome: string
  indicadores: {
    populacao: number | null
    percentual_voto_partido: number | null
    saldo_caged: number | null
    cobertura_psf: number | null
    taxa_abstencao: number | null
    ideb: number | null
  }
}

interface ApiBulkResponse {
  municipios: ApiBulkIndicadores[]
  total: number
  retornados: number
  calculado_em: string
  fonte: string
}

// ===========================================================================
// Tipos da API Legacy
// ===========================================================================

interface ApiMunicipioLegacy {
  id: number
  codigo_ibge: string
  nome: string
  latitude: number | null
  longitude: number | null
  populacao: number | null
  regiao: string | null
  total_votos_validos: number
  total_candidatos: number
  vencedor_votos: number | null
  vencedor_nome: string | null
  vencedor_partido: string | null
  vencedor_espectro: string | null
}

interface ApiResponseLegacy<T> {
  success: boolean
  data: T
  meta?: { total: number }
}

// ===========================================================================
// Helpers
// ===========================================================================

/**
 * Gera mock deterministico baseado no codigo IBGE
 * Isso garante que o mesmo municipio sempre tera os mesmos valores mock
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Gera indicadores mock para fallback
 */
function generateMockIndicators(codigoIbge: string, populacao: number): Partial<Record<IndicatorId, number | null>> {
  const seed = parseInt(codigoIbge) || 1

  // Percentual voto partido: 5% a 45%, variando por municipio
  // Municipios menores tendem a ter mais variacao
  const basePercentual = populacao < 20000 ? 15 : populacao < 100000 ? 20 : 25
  const percentualVotoPartido = basePercentual + seededRandom(seed * 5) * 20

  // Saldo CAGED: varia com populacao, pode ser negativo
  const saldoCaged = populacao > 0
    ? Math.round((seededRandom(seed * 1) - 0.3) * populacao * 0.008)
    : null

  // Cobertura PSF: 40% a 100% baseado em caracteristicas do municipio
  const basePsf = populacao < 50000 ? 75 : populacao < 200000 ? 65 : 55
  const coberturaPsf = basePsf + seededRandom(seed * 2) * 25

  // Taxa abstencao: 15% a 30%, municipios maiores tendem a ter mais abstencao
  const baseAbstencao = populacao > 500000 ? 22 : populacao > 100000 ? 18 : 15
  const taxaAbstencao = baseAbstencao + seededRandom(seed * 3) * 10

  // IDEB: 4.0 a 7.0
  const ideb = 4 + seededRandom(seed * 4) * 3

  return {
    percentual_voto_partido: percentualVotoPartido,
    saldo_caged: saldoCaged,
    cobertura_psf: coberturaPsf,
    taxa_abstencao: taxaAbstencao,
    ideb: ideb,
  }
}

/**
 * Transforma dados do endpoint bulk para o formato do mapa
 */
function transformBulkToMunicipality(
  data: ApiBulkIndicadores,
  uf: string
): MunicipalityWithIndicators {
  const populacao = data.indicadores.populacao || 0

  // Verificar se indicadores estao preenchidos ou precisam de mock
  // Se percentual_voto_partido tambem e null, precisamos gerar mock
  const needsMock =
    data.indicadores.percentual_voto_partido === null ||
    (!data.indicadores.saldo_caged && !data.indicadores.cobertura_psf)
  const mockIndicators = needsMock ? generateMockIndicators(data.codigo_ibge, populacao) : {}

  const indicators: Partial<Record<IndicatorId, number | null>> = {
    populacao: populacao,
    percentual_voto_partido: data.indicadores.percentual_voto_partido ?? mockIndicators.percentual_voto_partido ?? null,
    saldo_caged: data.indicadores.saldo_caged ?? mockIndicators.saldo_caged ?? null,
    cobertura_psf: data.indicadores.cobertura_psf ?? mockIndicators.cobertura_psf ?? null,
    taxa_abstencao: data.indicadores.taxa_abstencao ?? mockIndicators.taxa_abstencao ?? null,
    ideb: data.indicadores.ideb ?? mockIndicators.ideb ?? null,
  }

  return {
    codigoIbge: data.codigo_ibge,
    nome: data.nome,
    uf,
    mesorregiao: 'Sem regiao', // Bulk nao retorna mesorregiao
    populacao,
    latitude: 0, // Bulk nao retorna coordenadas
    longitude: 0,
    indicators,
  }
}

/**
 * Transforma dados do endpoint legacy para o formato do mapa (com mock)
 */
function transformLegacyToMunicipality(
  apiData: ApiMunicipioLegacy,
  uf: string
): MunicipalityWithIndicators {
  const populacao = apiData.populacao || 0
  const totalVotos = apiData.total_votos_validos || 0

  // Indicador real
  const percentualVotoPartido =
    apiData.vencedor_votos && totalVotos
      ? (apiData.vencedor_votos / totalVotos) * 100
      : null

  // Mock para o resto
  const mockIndicators = generateMockIndicators(apiData.codigo_ibge, populacao)

  const indicators: Partial<Record<IndicatorId, number | null>> = {
    populacao: populacao,
    percentual_voto_partido: percentualVotoPartido,
    ...mockIndicators,
  }

  return {
    codigoIbge: apiData.codigo_ibge,
    nome: apiData.nome,
    uf,
    mesorregiao: apiData.regiao || 'Sem regiao',
    populacao,
    latitude: apiData.latitude || 0,
    longitude: apiData.longitude || 0,
    indicators,
  }
}

// ===========================================================================
// Hook Principal
// ===========================================================================

export function useMunicipalitiesWithIndicators(
  options: UseMunicipalitiesOptions
): UseMunicipalitiesResult {
  const { uf, partidoId } = options
  const [municipalities, setMunicipalities] = useState<MunicipalityWithIndicators[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMockData, setHasMockData] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Estrategia 1: Tentar endpoint de bulk indicators
      try {
        const { data } = await api.get<ApiBulkResponse>('/intelligence/indicadores/bulk', {
          params: { partidoId },
        })

        if (data.municipios && data.municipios.length > 0) {
          const transformed = data.municipios.map((m) =>
            transformBulkToMunicipality(m, uf)
          )
          setMunicipalities(transformed)

          // Verificar se tem dados mock (indicadores null no cache)
          const hasAllReal = data.municipios.every(
            (m) => m.indicadores.saldo_caged !== null
          )
          setHasMockData(!hasAllReal)

          console.log(`[useMunicipalitiesWithIndicators] Carregado ${transformed.length} municipios do bulk endpoint`)
          return
        }
      } catch (bulkErr) {
        console.warn('[useMunicipalitiesWithIndicators] Bulk endpoint falhou, usando fallback:', bulkErr)
      }

      // Estrategia 2: Fallback para endpoint legacy
      const { data } = await api.get<ApiResponseLegacy<ApiMunicipioLegacy[]>>('/analytics/municipios', {
        params: { uf },
      })

      const transformed = data.data.map((m) =>
        transformLegacyToMunicipality(m, uf)
      )

      setMunicipalities(transformed)
      setHasMockData(true) // Legacy sempre tem mock

      console.log(`[useMunicipalitiesWithIndicators] Carregado ${transformed.length} municipios do endpoint legacy`)
    } catch (err) {
      console.error('[useMunicipalitiesWithIndicators] Erro:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar municipios')
    } finally {
      setLoading(false)
    }
  }, [uf, partidoId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Memoizar hasMockData para evitar re-renders desnecessarios
  const memoizedHasMockData = useMemo(() => hasMockData, [hasMockData])

  return {
    municipalities,
    loading,
    error,
    refetch: fetchData,
    hasMockData: memoizedHasMockData,
  }
}

export default useMunicipalitiesWithIndicators
