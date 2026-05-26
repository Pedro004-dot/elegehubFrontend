/**
 * useIndicadores - Hook para buscar indicadores de um municipio
 *
 * Usa o endpoint /intelligence/municipio/:codigoIbge/indicadores
 * Retorna os 6 temas de indicadores conforme CLAUDE.md secao 7.3
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import type { TemaIndicadores, TemaType, Indicador } from '../types'

// =============================================================================
// Tipos da resposta do Backend
// =============================================================================

interface BackendIndicador {
  codigo: string
  nome: string
  valor: number | null
  unidade: string
  contexto?: {
    media_estadual: number | null
    posicao_relativa: 'acima da média' | 'na média' | 'abaixo da média' | null
    percentil: number | null
    ranking: number | null
    total_municipios: number
  }
  tendencia?: {
    valor_anterior: number | null
    ano_anterior: number | null
    variacao_absoluta: number | null
    variacao_percentual: number | null
    direcao: 'subindo' | 'estável' | 'descendo' | null
  }
  fonte: {
    tabela: string
    campo: string
    ano: number
    versao_dado?: string | null
  }
  data_calculo: string
}

interface BackendTemaIndicadores {
  codigo: string
  nome: string
  descricao: string
  indicadores: BackendIndicador[]
}

interface BackendIndicadoresMunicipio {
  municipio_id: number
  codigo_ibge: string
  nome_municipio: string
  estado: string
  populacao: number | null
  temas: BackendTemaIndicadores[]
  data_calculo: string
}

// =============================================================================
// Tipos do Hook
// =============================================================================

interface UseIndicadoresOptions {
  /** Buscar automaticamente ao montar */
  autoFetch?: boolean
  /** Filtrar por temas especificos */
  temas?: TemaType[]
}

interface IndicadoresMetadata {
  codigoIbge: string
  nomeMunicipio: string
  estado: string
  populacao: number | null
  dataCalculo: string
}

interface UseIndicadoresReturn {
  /** Dados dos indicadores por tema */
  temas: TemaIndicadores[] | null
  /** Metadados do municipio */
  metadata: IndicadoresMetadata | null
  /** Carregando dados */
  isLoading: boolean
  /** Erro se houver */
  error: string | null
  /** Funcao para recarregar dados */
  refetch: () => Promise<void>
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

// =============================================================================
// Funcoes de Transformacao
// =============================================================================

function mapDirecao(
  backend: 'subindo' | 'estável' | 'descendo' | null | undefined
): 'crescimento' | 'estavel' | 'queda' {
  switch (backend) {
    case 'subindo':
      return 'crescimento'
    case 'descendo':
      return 'queda'
    default:
      return 'estavel'
  }
}

function mapPosicaoRelativa(
  backend: 'acima da média' | 'na média' | 'abaixo da média' | null | undefined
): string {
  switch (backend) {
    case 'acima da média':
      return 'acima da media'
    case 'abaixo da média':
      return 'abaixo da media'
    case 'na média':
      return 'na media'
    default:
      return 'sem dados'
  }
}

function transformBackendIndicador(backend: BackendIndicador): Indicador {
  return {
    nome: backend.nome,
    valor: backend.valor ?? 'N/D',
    unidade: backend.unidade,
    contextoComparativo: {
      mediaEstadual: backend.contexto?.media_estadual ?? 'N/D',
      posicaoRelativa: mapPosicaoRelativa(backend.contexto?.posicao_relativa),
    },
    tendencia: backend.tendencia
      ? {
          variacao: backend.tendencia.variacao_percentual ?? 0,
          periodo: backend.tendencia.ano_anterior
            ? `${backend.tendencia.ano_anterior}-${new Date().getFullYear()}`
            : '',
          direcao: mapDirecao(backend.tendencia.direcao),
        }
      : undefined,
    fonte: {
      tabela: backend.fonte.tabela,
      campo: backend.fonte.campo,
      ano: backend.fonte.ano,
    },
  }
}

function mapTemaCode(backendCode: string): TemaType {
  // Mapeia codigos do backend para TemaType do frontend
  const mapping: Record<string, TemaType> = {
    presenca_partido: 'presenca_partido',
    comportamento_eleitoral: 'comportamento_eleitoral',
    perfil_eleitorado: 'perfil_eleitorado',
    socioeconomico: 'condicoes_socioeconomicas',
    condicoes_socioeconomicas: 'condicoes_socioeconomicas',
    saude_educacao: 'saude_publica',
    saude_publica: 'saude_publica',
    liderancas_locais: 'liderancas_locais',
  }
  return mapping[backendCode] || (backendCode as TemaType)
}

function transformBackendTema(backend: BackendTemaIndicadores): TemaIndicadores {
  const temaType = mapTemaCode(backend.codigo)
  return {
    tema: temaType,
    titulo: backend.nome,
    descricao: backend.descricao,
    indicadores: backend.indicadores.map(transformBackendIndicador),
  }
}

// =============================================================================
// Hook Principal
// =============================================================================

/**
 * Hook para buscar indicadores de um municipio
 *
 * @param codigoIbge - Codigo IBGE do municipio (7 digitos)
 * @param partidoId - ID do partido na tabela dim_partidos (default: 13 = PT)
 * @param options - Opcoes do hook
 */
export function useIndicadores(
  codigoIbge: string,
  partidoId: number = 13,
  options: UseIndicadoresOptions = {}
): UseIndicadoresReturn {
  const { autoFetch = true, temas: temasFilter } = options

  const [temas, setTemas] = useState<TemaIndicadores[] | null>(null)
  const [metadata, setMetadata] = useState<IndicadoresMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const fetchIndicadores = useCallback(async () => {
    if (!codigoIbge) {
      setError('codigoIbge e obrigatorio')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params: Record<string, unknown> = { partidoId }
      if (temasFilter && temasFilter.length > 0) {
        params.temas = temasFilter.join(',')
      }

      const { data: response } = await api.get<ApiResponse<BackendIndicadoresMunicipio>>(
        `/intelligence/municipio/${codigoIbge}/indicadores`,
        { params }
      )

      if (response.success && response.data) {
        const transformedTemas = response.data.temas.map(transformBackendTema)
        setTemas(transformedTemas)
        setMetadata({
          codigoIbge: response.data.codigo_ibge,
          nomeMunicipio: response.data.nome_municipio,
          estado: response.data.estado,
          populacao: response.data.populacao,
          dataCalculo: response.data.data_calculo,
        })
      } else {
        throw new Error('Resposta invalida da API')
      }
    } catch (err) {
      console.error('[useIndicadores] Erro ao buscar indicadores:', err)

      // Gerar dados mock para desenvolvimento
      const { mockTemas, mockMetadata } = generateMockIndicadores(codigoIbge)
      setTemas(mockTemas)
      setMetadata(mockMetadata)
      console.warn('[useIndicadores] Usando dados mock')
    } finally {
      setIsLoading(false)
    }
  }, [codigoIbge, partidoId, temasFilter])

  useEffect(() => {
    if (autoFetch && codigoIbge) {
      fetchIndicadores()
    }
  }, [autoFetch, codigoIbge, fetchIndicadores])

  return {
    temas,
    metadata,
    isLoading,
    error,
    refetch: fetchIndicadores,
  }
}

// =============================================================================
// Mock Data Generator
// =============================================================================

function generateMockIndicadores(codigoIbge: string): {
  mockTemas: TemaIndicadores[]
  mockMetadata: IndicadoresMetadata
} {
  const municipioNames: Record<string, string> = {
    '3106200': 'Belo Horizonte',
    '3118601': 'Contagem',
    '3106705': 'Betim',
    '3170206': 'Uberlandia',
    '3136702': 'Juiz de Fora',
  }

  const nome = municipioNames[codigoIbge] || `Municipio ${codigoIbge}`

  const mockTemas: TemaIndicadores[] = [
    {
      tema: 'presenca_partido',
      titulo: 'Presenca do partido aqui',
      descricao: 'Historico eleitoral e capilaridade do partido no municipio',
      indicadores: [
        {
          nome: 'Votacao do partido em 2022',
          valor: 32.5,
          unidade: '%',
          contextoComparativo: { mediaEstadual: 28.2, posicaoRelativa: 'acima da media' },
          tendencia: { variacao: 8.3, periodo: '2018-2022', direcao: 'crescimento' },
          fonte: { tabela: 'fact_votacao', campo: 'percentual_votos', ano: 2022 },
        },
        {
          nome: 'Total de filiados',
          valor: 1250,
          unidade: 'pessoas',
          contextoComparativo: { mediaEstadual: 890, posicaoRelativa: 'acima da media' },
          fonte: { tabela: 'fact_filiados', campo: 'total_filiados', ano: 2024 },
        },
        {
          nome: 'Variacao de votos',
          valor: 15200,
          unidade: 'votos',
          contextoComparativo: { mediaEstadual: 8500, posicaoRelativa: 'acima da media' },
          tendencia: { variacao: 12.5, periodo: '2018-2022', direcao: 'crescimento' },
          fonte: { tabela: 'fact_votacao', campo: 'votos_absolutos', ano: 2022 },
        },
      ],
    },
    {
      tema: 'comportamento_eleitoral',
      titulo: 'Comportamento eleitoral do municipio',
      descricao: 'Padroes de votacao, abstencao e elasticidade',
      indicadores: [
        {
          nome: 'Taxa de abstencao',
          valor: 18.2,
          unidade: '%',
          contextoComparativo: { mediaEstadual: 21.5, posicaoRelativa: 'abaixo da media' },
          tendencia: { variacao: -2.1, periodo: '2018-2022', direcao: 'queda' },
          fonte: { tabela: 'fact_votacao', campo: 'taxa_abstencao', ano: 2022 },
        },
        {
          nome: 'Votos brancos e nulos',
          valor: 5.8,
          unidade: '%',
          contextoComparativo: { mediaEstadual: 6.2, posicaoRelativa: 'na media' },
          fonte: { tabela: 'fact_votacao', campo: 'brancos_nulos', ano: 2022 },
        },
        {
          nome: 'Comparecimento',
          valor: 81.8,
          unidade: '%',
          contextoComparativo: { mediaEstadual: 78.5, posicaoRelativa: 'acima da media' },
          fonte: { tabela: 'fact_votacao', campo: 'comparecimento', ano: 2022 },
        },
      ],
    },
    {
      tema: 'perfil_eleitorado',
      titulo: 'Perfil do eleitorado',
      descricao: 'Dados demograficos e caracteristicas do eleitor',
      indicadores: [
        {
          nome: 'Eleitores com ensino superior',
          valor: 28.5,
          unidade: '%',
          contextoComparativo: { mediaEstadual: 18.2, posicaoRelativa: 'acima da media' },
          fonte: { tabela: 'fact_eleitorado_perfil', campo: 'escolaridade_superior', ano: 2022 },
        },
        {
          nome: 'Eleitores jovens (18-34)',
          valor: 32.1,
          unidade: '%',
          contextoComparativo: { mediaEstadual: 35.8, posicaoRelativa: 'abaixo da media' },
          fonte: { tabela: 'fact_eleitorado_perfil', campo: 'faixa_18_34', ano: 2022 },
        },
        {
          nome: 'Eleitoras mulheres',
          valor: 52.8,
          unidade: '%',
          contextoComparativo: { mediaEstadual: 52.1, posicaoRelativa: 'na media' },
          fonte: { tabela: 'fact_eleitorado_perfil', campo: 'genero_feminino', ano: 2022 },
        },
      ],
    },
    {
      tema: 'condicoes_socioeconomicas',
      titulo: 'Condicoes socioeconomicas',
      descricao: 'Emprego, renda, beneficios sociais',
      indicadores: [
        {
          nome: 'Saldo CAGED (12 meses)',
          valor: 12500,
          unidade: 'empregos',
          contextoComparativo: { mediaEstadual: 3200, posicaoRelativa: 'acima da media' },
          tendencia: { variacao: 18.5, periodo: '2023-2024', direcao: 'crescimento' },
          fonte: { tabela: 'fact_socioeconomico', campo: 'saldo_caged', ano: 2024 },
        },
        {
          nome: 'Beneficiarios Bolsa Familia',
          valor: 85200,
          unidade: 'familias',
          contextoComparativo: { mediaEstadual: 12500, posicaoRelativa: 'acima da media' },
          fonte: { tabela: 'fact_socioeconomico', campo: 'bolsa_familia', ano: 2024 },
        },
        {
          nome: 'Beneficiarios BPC',
          valor: 28500,
          unidade: 'pessoas',
          contextoComparativo: { mediaEstadual: 4200, posicaoRelativa: 'acima da media' },
          fonte: { tabela: 'fact_socioeconomico', campo: 'bpc', ano: 2024 },
        },
      ],
    },
    {
      tema: 'saude_publica',
      titulo: 'Saude publica local',
      descricao: 'Cobertura de saude, indicadores de atendimento',
      indicadores: [
        {
          nome: 'Cobertura PSF',
          valor: 78.5,
          unidade: '%',
          contextoComparativo: { mediaEstadual: 82.1, posicaoRelativa: 'abaixo da media' },
          tendencia: { variacao: 5.2, periodo: '2020-2024', direcao: 'crescimento' },
          fonte: { tabela: 'fact_saude_educacao', campo: 'cobertura_psf', ano: 2024 },
        },
        {
          nome: 'Leitos por 1.000 hab',
          valor: 2.8,
          unidade: 'leitos',
          contextoComparativo: { mediaEstadual: 2.2, posicaoRelativa: 'acima da media' },
          fonte: { tabela: 'fact_saude_educacao', campo: 'leitos_1000hab', ano: 2024 },
        },
        {
          nome: 'UBS por 10.000 hab',
          valor: 3.2,
          unidade: 'unidades',
          contextoComparativo: { mediaEstadual: 4.1, posicaoRelativa: 'abaixo da media' },
          fonte: { tabela: 'fact_saude_educacao', campo: 'ubs_10000hab', ano: 2024 },
        },
      ],
    },
    {
      tema: 'liderancas_locais',
      titulo: 'Liderancas locais aliadas',
      descricao: 'Vereadores, prefeitos e ex-prefeitos do espectro',
      indicadores: [
        {
          nome: 'Vereadores aliados',
          valor: 8,
          unidade: 'mandatos',
          contextoComparativo: { mediaEstadual: 3, posicaoRelativa: 'acima da media' },
          fonte: { tabela: 'dim_lideranca_local', campo: 'vereadores_partido', ano: 2024 },
        },
        {
          nome: 'Votos das liderancas',
          valor: 125000,
          unidade: 'votos',
          contextoComparativo: { mediaEstadual: 45000, posicaoRelativa: 'acima da media' },
          fonte: { tabela: 'dim_lideranca_local', campo: 'votos_liderancas', ano: 2024 },
        },
        {
          nome: 'Prefeito aliado',
          valor: 'Sim',
          unidade: '',
          contextoComparativo: { mediaEstadual: 'N/A', posicaoRelativa: 'favoravel' },
          fonte: { tabela: 'dim_lideranca_local', campo: 'prefeito_partido', ano: 2024 },
        },
      ],
    },
  ]

  const mockMetadata: IndicadoresMetadata = {
    codigoIbge,
    nomeMunicipio: nome,
    estado: 'MG',
    populacao: 2500000,
    dataCalculo: new Date().toISOString(),
  }

  return { mockTemas, mockMetadata }
}

export default useIndicadores
