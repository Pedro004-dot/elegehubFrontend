/**
 * useConcorrenteDetail - Hook para buscar dados detalhados de um concorrente
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import type {
  AnaliseConcorrente,
  FichaConcorrente,
  VotacaoMunicipio,
  GastosAgregados,
  FinanciamentoAgregado,
  HistoricoEleicao,
  Doador,
  Despesa,
} from '../types'

interface UseConcorrenteDetailOptions {
  autoFetch?: boolean
  ano?: number
}

interface UseConcorrenteDetailReturn {
  analise: AnaliseConcorrente | null
  votos: VotacaoMunicipio[]
  gastos: GastosAgregados | null
  financiamento: FinanciamentoAgregado | null
  historico: HistoricoEleicao[]
  doadores: Doador[]
  despesas: Despesa[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  fetchVotos: (limit?: number) => Promise<void>
  fetchGastos: () => Promise<void>
  fetchFinanciamento: () => Promise<void>
  fetchHistorico: () => Promise<void>
  fetchDoadores: () => Promise<void>
  fetchDespesas: () => Promise<void>
}

/**
 * Transforma ficha da API
 */
function transformFicha(api: Record<string, unknown>): FichaConcorrente {
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
    dataNascimento: api.data_nascimento as string | null,
    genero: api.genero as string | null,
    corRaca: api.cor_raca as string | null,
    profissao: api.profissao as string | null,
    escolaridade: api.escolaridade as string | null,
    totalBens: api.total_bens as number | null,
    situacaoCandidatura: api.situacao_candidatura as string | null,
    resultado: api.resultado as string | null,
  }
}

/**
 * Transforma analise da API
 */
function transformAnalise(api: Record<string, unknown>): AnaliseConcorrente {
  const ficha = api.ficha as Record<string, unknown>
  const resumo = api.resumo as Record<string, unknown>

  return {
    ficha: transformFicha(ficha),
    resumo: {
      totalVotos: resumo.total_votos as number,
      numMunicipiosComVotos: resumo.num_municipios_com_votos as number,
      totalGastos: resumo.total_gastos as number | null,
      totalDoacoes: resumo.total_doacoes as number | null,
      numDoadores: resumo.num_doadores as number | null,
    },
    dataCalculo: api.data_calculo as string,
  }
}

/**
 * Transforma votacao por municipio da API
 */
function transformVotacao(api: Record<string, unknown>): VotacaoMunicipio {
  return {
    municipioId: api.municipio_id as number,
    codigoIbge: api.codigo_ibge as string,
    nomeMunicipio: api.nome_municipio as string,
    votos: api.votos as number,
    percentualVotos: api.percentual_votos as number | null,
    votosValidosMunicipio: api.votos_validos_municipio as number | null,
    anoEleicao: api.ano_eleicao as number,
  }
}

/**
 * Transforma gastos da API
 */
function transformGastos(api: Record<string, unknown>): GastosAgregados {
  const porCategoria = api.por_categoria as Array<Record<string, unknown>>

  return {
    candidatoId: api.candidato_id as number,
    total: api.total as number,
    porCategoria: porCategoria.map((c) => ({
      categoria: c.categoria as string,
      valor: c.valor as number,
      percentual: c.percentual as number,
      numDespesas: c.num_despesas as number,
    })),
    anoEleicao: api.ano_eleicao as number,
  }
}

/**
 * Transforma financiamento da API
 */
function transformFinanciamento(api: Record<string, unknown>): FinanciamentoAgregado {
  const porFonte = api.por_fonte as Array<Record<string, unknown>>

  return {
    candidatoId: api.candidato_id as number,
    total: api.total as number,
    porFonte: porFonte.map((f) => ({
      fonteOrigem: f.fonte_origem as string,
      tipoReceita: f.tipo_receita as string,
      valor: f.valor as number,
      percentual: f.percentual as number,
    })),
    numDoadores: api.num_doadores as number,
    anoEleicao: api.ano_eleicao as number,
  }
}

/**
 * Transforma historico da API
 */
function transformHistorico(api: Record<string, unknown>): HistoricoEleicao {
  return {
    anoEleicao: api.ano_eleicao as number,
    cargo: api.cargo as string,
    partidoSigla: api.partido_sigla as string,
    numeroCandidato: api.numero_candidato as number | null,
    totalVotos: api.total_votos as number,
    resultado: api.resultado as string | null,
  }
}

/**
 * Transforma doador da API
 */
function transformDoador(api: Record<string, unknown>): Doador {
  return {
    id: api.id as number,
    nome: api.nome as string,
    tipo: api.tipo as 'PF' | 'PJ',
    valor: api.valor as number,
    tipoReceita: api.tipo_receita as string,
    fonteOrigem: api.fonte_origem as string,
    dataDoacao: api.data_doacao as string | null,
  }
}

/**
 * Transforma despesa da API
 */
function transformDespesa(api: Record<string, unknown>): Despesa {
  return {
    id: api.id as number,
    categoria: api.categoria as string,
    valor: api.valor as number,
    dataDespesa: api.data_despesa as string | null,
    fornecedor: api.fornecedor as string | null,
    descricao: api.descricao as string | null,
  }
}

export function useConcorrenteDetail(
  candidatoId: number | null,
  options: UseConcorrenteDetailOptions = {}
): UseConcorrenteDetailReturn {
  const { autoFetch = true, ano = 2022 } = options

  const [analise, setAnalise] = useState<AnaliseConcorrente | null>(null)
  const [votos, setVotos] = useState<VotacaoMunicipio[]>([])
  const [gastos, setGastos] = useState<GastosAgregados | null>(null)
  const [financiamento, setFinanciamento] = useState<FinanciamentoAgregado | null>(null)
  const [historico, setHistorico] = useState<HistoricoEleicao[]>([])
  const [doadores, setDoadores] = useState<Doador[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnalise = useCallback(async () => {
    if (!candidatoId) return

    setIsLoading(true)
    setError(null)

    try {
      const { data } = await api.get<Record<string, unknown>>(
        `/intelligence/concorrentes/${candidatoId}`,
        { params: { ano } }
      )

      setAnalise(transformAnalise(data))
    } catch (err) {
      console.error('[useConcorrenteDetail] Erro:', err)
      setError(err instanceof Error ? err : new Error('Erro ao buscar analise'))
    } finally {
      setIsLoading(false)
    }
  }, [candidatoId, ano])

  const fetchVotos = useCallback(
    async (limit = 50) => {
      if (!candidatoId) return

      try {
        const { data } = await api.get<{
          municipios: Record<string, unknown>[]
        }>(`/intelligence/concorrentes/${candidatoId}/votos`, {
          params: { ano, limit },
        })

        setVotos(data.municipios.map(transformVotacao))
      } catch (err) {
        console.error('[useConcorrenteDetail] Erro ao buscar votos:', err)
      }
    },
    [candidatoId, ano]
  )

  const fetchGastos = useCallback(async () => {
    if (!candidatoId) return

    try {
      const { data } = await api.get<Record<string, unknown>>(
        `/intelligence/concorrentes/${candidatoId}/gastos`,
        { params: { ano } }
      )

      if (data.total && (data.total as number) > 0) {
        setGastos(transformGastos(data))
      }
    } catch (err) {
      console.error('[useConcorrenteDetail] Erro ao buscar gastos:', err)
    }
  }, [candidatoId, ano])

  const fetchFinanciamento = useCallback(async () => {
    if (!candidatoId) return

    try {
      const { data } = await api.get<Record<string, unknown>>(
        `/intelligence/concorrentes/${candidatoId}/financiamento`,
        { params: { ano } }
      )

      if (data.total && (data.total as number) > 0) {
        setFinanciamento(transformFinanciamento(data))
      }
    } catch (err) {
      console.error('[useConcorrenteDetail] Erro ao buscar financiamento:', err)
    }
  }, [candidatoId, ano])

  const fetchHistorico = useCallback(async () => {
    if (!candidatoId) return

    try {
      const { data } = await api.get<{
        eleicoes: Record<string, unknown>[]
      }>(`/intelligence/concorrentes/${candidatoId}/historico`)

      setHistorico(data.eleicoes.map(transformHistorico))
    } catch (err) {
      console.error('[useConcorrenteDetail] Erro ao buscar historico:', err)
    }
  }, [candidatoId])

  const fetchDoadores = useCallback(async () => {
    if (!candidatoId) return

    try {
      const { data } = await api.get<{
        doadores: Record<string, unknown>[]
      }>(`/intelligence/concorrentes/${candidatoId}/doadores`, {
        params: { ano },
      })

      setDoadores(data.doadores.map(transformDoador))
    } catch (err) {
      console.error('[useConcorrenteDetail] Erro ao buscar doadores:', err)
    }
  }, [candidatoId, ano])

  const fetchDespesas = useCallback(async () => {
    if (!candidatoId) return

    try {
      const { data } = await api.get<{
        despesas: Record<string, unknown>[]
      }>(`/intelligence/concorrentes/${candidatoId}/gastos/detalhes`, {
        params: { ano },
      })

      setDespesas(data.despesas.map(transformDespesa))
    } catch (err) {
      console.error('[useConcorrenteDetail] Erro ao buscar despesas:', err)
    }
  }, [candidatoId, ano])

  const refetch = useCallback(async () => {
    await fetchAnalise()
  }, [fetchAnalise])

  // Auto fetch analise ao montar
  useEffect(() => {
    if (autoFetch && candidatoId) {
      fetchAnalise()
    }
  }, [autoFetch, candidatoId, fetchAnalise])

  return {
    analise,
    votos,
    gastos,
    financiamento,
    historico,
    doadores,
    despesas,
    isLoading,
    error,
    refetch,
    fetchVotos,
    fetchGastos,
    fetchFinanciamento,
    fetchHistorico,
    fetchDoadores,
    fetchDespesas,
  }
}

export default useConcorrenteDetail
