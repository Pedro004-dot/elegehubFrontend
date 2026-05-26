/**
 * useClassification - Hook para buscar classificacao de um municipio
 *
 * Busca do endpoint /intelligence/classificacao/:codigoIbge
 * Retorna a classificacao completa com condicoes avaliadas
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'

/**
 * Categorias de classificacao
 */
export type CategoriaClassificacao =
  | 'prioritaria'
  | 'crescente'
  | 'exploratoria'
  | 'fora_radar'

/**
 * Condicao avaliada com resultado
 */
export interface CondicaoAvaliada {
  id: string
  nome: string
  resultado: boolean
  valor_bruto: unknown
  criterio: string
}

/**
 * Classificacao completa de um municipio
 */
export interface ClassificacaoMunicipio {
  codigo_ibge: string
  nome_municipio: string
  partido_id: number
  partido_sigla: string
  categoria: CategoriaClassificacao
  condicoes: CondicaoAvaliada[]
  condicoes_determinantes: string[]
  data_calculo: string
  versao_algoritmo: string
}

interface UseClassificationOptions {
  codigoIbge: string
  partidoId: number
}

interface UseClassificationResult {
  classificacao: ClassificacaoMunicipio | null
  loading: boolean
  error: string | null
  refetch: () => void
}

// API retorna a classificacao diretamente (sem wrapper)
type ApiResponse = ClassificacaoMunicipio

/**
 * Configuracao visual das categorias
 */
export const CATEGORIA_CONFIG: Record<
  CategoriaClassificacao,
  {
    label: string
    description: string
    color: string
    bgColor: string
    borderColor: string
  }
> = {
  prioritaria: {
    label: 'Prioritaria',
    description: 'Municipio com alto potencial, estrutura local e historico favoravel',
    color: '#16a34a',
    bgColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  crescente: {
    label: 'Crescente',
    description: 'Municipio em crescimento, trajetoria positiva nos ultimos ciclos',
    color: '#2563eb',
    bgColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  exploratoria: {
    label: 'Exploratoria',
    description: 'Municipio viavel, vale investigar mais a fundo',
    color: '#ca8a04',
    bgColor: '#fef9c3',
    borderColor: '#eab308',
  },
  fora_radar: {
    label: 'Fora do Radar',
    description: 'Municipio sem prioridade no momento',
    color: '#71717a',
    bgColor: '#f4f4f5',
    borderColor: '#a1a1aa',
  },
}

/**
 * Labels das condicoes em portugues
 */
export const CONDICAO_LABELS: Record<string, string> = {
  partido_venceu_ultimo_ciclo: 'Partido venceu no ultimo ciclo',
  partido_cresceu_dois_ciclos: 'Partido cresceu em dois ciclos consecutivos',
  partido_acima_media_uf: 'Partido acima da media do estado',
  existe_lideranca_aliada: 'Existe lideranca local aliada',
  municipio_medio_porte: 'Municipio de medio porte (20k-200k hab)',
  presenca_partido_minima: 'Presenca minima do partido (>5%)',
  territorio_hostil: 'Territorio hostil (partido <3%)',
  sem_historico: 'Sem historico eleitoral suficiente',
  sem_lideranca: 'Sem lideranca local identificada',
}

export function useClassification(
  options: UseClassificationOptions
): UseClassificationResult {
  const { codigoIbge, partidoId } = options
  const [classificacao, setClassificacao] = useState<ClassificacaoMunicipio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!codigoIbge || !partidoId) {
      setError('codigoIbge e partidoId sao obrigatorios')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data } = await api.get<ApiResponse>(
        `/intelligence/classificacao/${codigoIbge}`,
        { params: { partidoId } }
      )

      if (data && data.codigo_ibge) {
        setClassificacao(data)
      } else {
        setClassificacao(null)
        console.warn('[useClassification] Sem classificacao disponivel')
      }
    } catch (err) {
      console.error('[useClassification] Erro:', err)
      // Nao definir erro se for 404 - significa que nao ha classificacao ainda
      if ((err as { response?: { status?: number } })?.response?.status === 404) {
        setClassificacao(null)
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao carregar classificacao')
        setClassificacao(null)
      }
    } finally {
      setLoading(false)
    }
  }, [codigoIbge, partidoId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    classificacao,
    loading,
    error,
    refetch: fetchData,
  }
}

export default useClassification
