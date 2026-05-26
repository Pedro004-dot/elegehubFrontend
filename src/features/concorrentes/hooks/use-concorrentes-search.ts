/**
 * useConcorrentesSearch - Hook para buscar concorrentes
 */

import { useState, useCallback } from 'react'
import { api } from '@/services/api'
import type { ConcorrenteBasico } from '../types'

interface UseConcorrentesSearchOptions {
  cargo?: string
  ano?: number
  limit?: number
}

interface UseConcorrentesSearchReturn {
  concorrentes: ConcorrenteBasico[]
  total: number
  isLoading: boolean
  error: Error | null
  search: (termo: string) => Promise<void>
  clear: () => void
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

export function useConcorrentesSearch(
  options: UseConcorrentesSearchOptions = {}
): UseConcorrentesSearchReturn {
  const { cargo = 'deputado estadual', ano = 2022, limit = 50 } = options

  const [concorrentes, setConcorrentes] = useState<ConcorrenteBasico[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = useCallback(
    async (termo: string) => {
      if (!termo || termo.length < 2) {
        setConcorrentes([])
        setTotal(0)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const { data } = await api.get<{
          concorrentes: Record<string, unknown>[]
          total: number
        }>('/intelligence/concorrentes/search', {
          params: { q: termo, cargo, ano, limit },
        })

        const transformed = data.concorrentes.map(transformConcorrente)
        setConcorrentes(transformed)
        setTotal(data.total)
      } catch (err) {
        console.error('[useConcorrentesSearch] Erro:', err)
        setError(err instanceof Error ? err : new Error('Erro ao buscar concorrentes'))
        setConcorrentes([])
        setTotal(0)
      } finally {
        setIsLoading(false)
      }
    },
    [cargo, ano, limit]
  )

  const clear = useCallback(() => {
    setConcorrentes([])
    setTotal(0)
    setError(null)
  }, [])

  return {
    concorrentes,
    total,
    isLoading,
    error,
    search,
    clear,
  }
}

export default useConcorrentesSearch
