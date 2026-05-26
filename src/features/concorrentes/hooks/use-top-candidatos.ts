/**
 * useTopCandidatos - Hook para carregar os top candidatos por votos
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import type { ConcorrenteBasico } from '../types'

interface UseTopCandidatosOptions {
  cargo?: string
  ano?: number
  limit?: number
  autoFetch?: boolean
}

interface UseTopCandidatosReturn {
  candidatos: ConcorrenteBasico[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Transforma resposta da API (snake_case) para tipos do frontend (camelCase)
 */
function transformConcorrente(api: Record<string, unknown>): ConcorrenteBasico {
  return {
    id: api.id as number,
    nomeUrna: api.nome_urna as string,
    nome: api.nome as string | null,
    partidoId: api.partido_id as number,
    partidoSigla: api.partido_sigla as string,
    cargo: api.cargo as string,
    anoEleicao: api.ano_eleicao as number,
    numeroCandidato: api.numero_candidato as number | null,
    fotoUrl: api.foto_url as string | null,
    totalVotos: api.total_votos as number | null,
    resultado: api.resultado as string | null,
  }
}

export function useTopCandidatos(
  options: UseTopCandidatosOptions = {}
): UseTopCandidatosReturn {
  const { cargo = 'deputado estadual', ano = 2022, limit = 5000, autoFetch = true } = options

  const [candidatos, setCandidatos] = useState<ConcorrenteBasico[]>([])
  const [isLoading, setIsLoading] = useState(autoFetch)
  const [error, setError] = useState<Error | null>(null)

  const fetchCandidatos = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Busca sem termo retorna os top por votos
      const { data } = await api.get<{
        concorrentes: Record<string, unknown>[]
        total: number
      }>('/intelligence/concorrentes/search', {
        params: { cargo, ano, limit },
      })

      const transformed = data.concorrentes.map(transformConcorrente)
      setCandidatos(transformed)
    } catch (err) {
      console.error('[useTopCandidatos] Erro:', err)
      setError(err instanceof Error ? err : new Error('Erro ao carregar candidatos'))
      setCandidatos([])
    } finally {
      setIsLoading(false)
    }
  }, [cargo, ano, limit])

  useEffect(() => {
    if (autoFetch) {
      fetchCandidatos()
    }
  }, [autoFetch, fetchCandidatos])

  return {
    candidatos,
    isLoading,
    error,
    refetch: fetchCandidatos,
  }
}

export default useTopCandidatos
