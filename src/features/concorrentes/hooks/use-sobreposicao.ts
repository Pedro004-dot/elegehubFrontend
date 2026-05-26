/**
 * useSobreposicao - Hook para calcular sobreposicao territorial
 */

import { useState, useCallback } from 'react'
import { api } from '@/services/api'
import type { SobreposicaoTerritorial, MunicipioSobreposicao } from '../types'

interface UseSobreposicaoOptions {
  cargo?: string
  ano?: number
}

interface UseSobreposicaoReturn {
  sobreposicao: SobreposicaoTerritorial | null
  isLoading: boolean
  error: Error | null
  calcular: (concorrenteId: number, meuPartidoId: number) => Promise<void>
  clear: () => void
}

/**
 * Transforma municipio de sobreposicao da API
 */
function transformMunicipio(api: Record<string, unknown>): MunicipioSobreposicao {
  return {
    codigoIbge: api.codigo_ibge as string,
    nomeMunicipio: api.nome_municipio as string,
    meusVotos: api.meus_votos as number,
    meuPercentual: api.meu_percentual as number | null,
    votosConcorrente: api.votos_concorrente as number,
    percentualConcorrente: api.percentual_concorrente as number | null,
    diferencaVotos: api.diferenca_votos as number,
    diferencaPercentual: api.diferenca_percentual as number | null,
  }
}

/**
 * Transforma sobreposicao da API
 */
function transformSobreposicao(api: Record<string, unknown>): SobreposicaoTerritorial {
  const municipiosDisputa = api.municipios_disputa as Array<Record<string, unknown>>
  const ameacas = api.ameacas as Array<Record<string, unknown>>
  const oportunidades = api.oportunidades as Array<Record<string, unknown>>
  const estatisticas = api.estatisticas as Record<string, unknown>

  return {
    concorrenteId: api.concorrente_id as number,
    concorrenteNome: api.concorrente_nome as string,
    meuPartidoId: api.meu_partido_id as number,
    meuPartidoSigla: api.meu_partido_sigla as string,
    anoEleicao: api.ano_eleicao as number,
    municipiosDisputa: municipiosDisputa.map(transformMunicipio),
    ameacas: ameacas.map(transformMunicipio),
    oportunidades: oportunidades.map(transformMunicipio),
    estatisticas: {
      totalMunicipiosAnalisados: estatisticas.total_municipios_analisados as number,
      totalDisputa: estatisticas.total_disputa as number,
      totalAmeacas: estatisticas.total_ameacas as number,
      totalOportunidades: estatisticas.total_oportunidades as number,
    },
    dataCalculo: api.data_calculo as string,
  }
}

export function useSobreposicao(
  options: UseSobreposicaoOptions = {}
): UseSobreposicaoReturn {
  const { cargo = 'deputado estadual', ano = 2022 } = options

  const [sobreposicao, setSobreposicao] = useState<SobreposicaoTerritorial | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const calcular = useCallback(
    async (concorrenteId: number, meuPartidoId: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const { data } = await api.get<Record<string, unknown>>(
          `/intelligence/concorrentes/${concorrenteId}/sobreposicao`,
          { params: { meuPartidoId, cargo, ano } }
        )

        setSobreposicao(transformSobreposicao(data))
      } catch (err) {
        console.error('[useSobreposicao] Erro:', err)
        setError(err instanceof Error ? err : new Error('Erro ao calcular sobreposicao'))
        setSobreposicao(null)
      } finally {
        setIsLoading(false)
      }
    },
    [cargo, ano]
  )

  const clear = useCallback(() => {
    setSobreposicao(null)
    setError(null)
  }, [])

  return {
    sobreposicao,
    isLoading,
    error,
    calcular,
    clear,
  }
}

export default useSobreposicao
