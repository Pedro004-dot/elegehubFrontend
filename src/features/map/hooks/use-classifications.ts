/**
 * useClassifications - Hook para buscar classificacoes de municipios
 *
 * Busca do endpoint /intelligence/classificacao/bulk
 * Retorna classificacao por categoria (prioritaria, crescente, exploratoria, fora_radar)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { api } from '@/services/api'
import type { CategoriaClassificacao, ClassificacaoBulk } from '../types'

interface UseClassificationsOptions {
  partidoId: number
}

interface UseClassificationsResult {
  classifications: ClassificacaoBulk[]
  loading: boolean
  error: string | null
  refetch: () => void
  /** Mapa de codigo_ibge -> classificacao para lookup rapido */
  classificacaoByIbge: Map<string, ClassificacaoBulk>
  /** Estatisticas por categoria */
  stats: Record<CategoriaClassificacao, number>
  /** Inicia calculo do batch de classificacao */
  startBatchCalculation: () => Promise<void>
  /** Indica se o batch esta sendo calculado */
  calculating: boolean
}

interface ApiBulkResponse {
  municipios: Array<{
    codigo_ibge: string
    nome: string
    categoria: CategoriaClassificacao
    condicoes_determinantes: string[]
  }>
  total: number
  partido_sigla: string
  fonte: string
  calculado_em: string
}

export function useClassifications(
  options: UseClassificationsOptions
): UseClassificationsResult {
  const { partidoId } = options
  const [classifications, setClassifications] = useState<ClassificacaoBulk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calculating, setCalculating] = useState(false)
  const calculatingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (!partidoId) {
      setError('partidoId e obrigatorio')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Timeout de 30s - aumentado para dar tempo em conexoes lentas
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const { data } = await api.get<ApiBulkResponse>('/intelligence/classificacao/bulk', {
        params: { partidoId },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (data.municipios && data.municipios.length > 0) {
        setClassifications(data.municipios)
        console.log(`[useClassifications] Carregado ${data.municipios.length} classificacoes`)
      } else {
        // Se nao houver cache, retornar vazio (legenda mostra botao de calcular)
        setClassifications([])
        console.log('[useClassifications] Cache vazio - aguardando calculo')
      }
    } catch (err) {
      // Se foi timeout ou abort, nao tratar como erro critico
      if (err instanceof Error && err.name === 'CanceledError') {
        console.warn('[useClassifications] Timeout ao buscar cache')
        // Nao mostrar erro - deixar legenda mostrar botao de calcular
        setClassifications([])
      } else {
        console.error('[useClassifications] Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar classificacoes')
        setClassifications([])
      }
    } finally {
      setLoading(false)
    }
  }, [partidoId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cleanup: abortar polling quando componente desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Mapa para lookup rapido por codigo IBGE
  const classificacaoByIbge = useMemo(() => {
    const map = new Map<string, ClassificacaoBulk>()
    for (const c of classifications) {
      map.set(c.codigo_ibge, c)
    }
    return map
  }, [classifications])

  // Estatisticas por categoria
  const stats = useMemo(() => {
    const result: Record<CategoriaClassificacao, number> = {
      prioritaria: 0,
      crescente: 0,
      exploratoria: 0,
      fora_radar: 0,
    }
    for (const c of classifications) {
      result[c.categoria]++
    }
    return result
  }, [classifications])

  // Inicia calculo do batch de classificacao
  const startBatchCalculation = useCallback(async () => {
    if (!partidoId || calculatingRef.current) return

    calculatingRef.current = true
    setCalculating(true)
    setError(null)

    // Criar AbortController para cleanup
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      // Dispara o batch (retorna 202 Accepted)
      await api.post('/intelligence/batch/classificar', {}, {
        params: { partidoId },
      })

      console.log('[useClassifications] Batch iniciado, aguardando...')

      // Polling para verificar quando terminar
      let attempts = 0
      const maxAttempts = 60 // 5 minutos (60 * 5s)

      const checkProgress = async (): Promise<boolean> => {
        const { data } = await api.get<{ status: string; municipios_processados: number; municipios_total: number }>(
          '/intelligence/batch/progresso'
        )
        return data.status === 'completed' || data.status === 'idle'
      }

      while (attempts < maxAttempts && !signal.aborted) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // 5s entre checks
        attempts++

        if (signal.aborted) break

        const done = await checkProgress()
        if (done) {
          console.log('[useClassifications] Batch concluido!')
          await fetchData() // Recarregar dados
          break
        }
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error('[useClassifications] Erro ao iniciar batch:', err)
        setError('Erro ao calcular classificacoes')
      }
    } finally {
      calculatingRef.current = false
      setCalculating(false)
      abortControllerRef.current = null
    }
  }, [partidoId, fetchData])

  return {
    classifications,
    loading,
    error,
    refetch: fetchData,
    classificacaoByIbge,
    stats,
    startBatchCalculation,
    calculating,
  }
}

export default useClassifications
