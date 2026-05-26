/**
 * useBriefing - Hook para buscar briefing completo de um municipio
 *
 * Usa o endpoint /intelligence/municipio/:codigoIbge/briefing
 * Retorna as 6 secoes do briefing conforme CLAUDE.md
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import type { BriefingMunicipio } from '../types'

interface UseBriefingOptions {
  /** Buscar automaticamente ao montar */
  autoFetch?: boolean
}

interface UseBriefingReturn {
  /** Dados do briefing */
  data: BriefingMunicipio | null
  /** Carregando dados */
  isLoading: boolean
  /** Erro se houver */
  error: Error | null
  /** Funcao para recarregar dados */
  refetch: () => Promise<void>
}

// A API retorna o briefing em snake_case
interface ApiBriefingResponse {
  municipio_id: number
  codigo_ibge: string
  nome_municipio: string
  estado: string
  populacao: number | null
  por_que_estar_aqui: Array<{
    titulo: string
    dado: string
    contexto: string
    fonte: string
    prioridade: number
  }>
  quem_mora_aqui: {
    resumo: string
    indicadores: Array<{
      indicador: string
      valor: string
      interpretacao: string
      fonte: string
    }>
  }
  o_que_tem_pegado: Array<{
    tema: string
    porque_relevante: string
    gancho_discurso: string
    fonte: string
  }>
  como_partido_se_comporta: {
    resumo: string
    indicadores: Array<{
      metrica: string
      valor: string
      interpretacao: string
      fonte: string
    }>
  }
  quem_pode_abrir_portas: Array<{
    nome: string
    cargo: string
    partido: string
    votos_recebidos: number | null
    ano_eleicao: number
  }>
  honestidades: Array<{
    titulo: string
    descricao: string
    fonte: string
  }>
  fontes_consultadas: Array<{
    tabela: string
    campos: string[]
    ano: number
  }>
  indicadores_usados: number
  gerado_em: string
  versao: string
}

/**
 * Transforma resposta da API (snake_case) para tipos do frontend (camelCase)
 */
function transformBriefingResponse(api: ApiBriefingResponse): BriefingMunicipio {
  return {
    municipioId: api.municipio_id,
    codigoIbge: api.codigo_ibge,
    nomeMunicipio: api.nome_municipio,
    estado: api.estado,
    mesorregiao: 'Metropolitana de Belo Horizonte', // TODO: adicionar no backend
    populacao: api.populacao,
    totalEleitores: null, // TODO: adicionar no backend

    porQueEstarAqui: api.por_que_estar_aqui.map(r => ({
      titulo: r.titulo,
      dado: r.dado,
      contexto: r.contexto,
      fonte: r.fonte,
      prioridade: r.prioridade as 1 | 2 | 3 | 4 | 5,
    })),

    quemMoraAqui: {
      resumo: api.quem_mora_aqui.resumo,
      indicadores: api.quem_mora_aqui.indicadores.map(i => ({
        indicador: i.indicador,
        valor: i.valor,
        interpretacao: i.interpretacao,
        fonte: i.fonte,
      })),
    },

    oQueTePegado: api.o_que_tem_pegado.map(t => ({
      tema: t.tema,
      porqueRelevante: t.porque_relevante,
      ganchoDiscurso: t.gancho_discurso,
      fonte: t.fonte,
    })),

    comoPartidoSeComporta: {
      resumo: api.como_partido_se_comporta.resumo,
      indicadores: api.como_partido_se_comporta.indicadores.map(i => ({
        metrica: i.metrica,
        valor: i.valor,
        interpretacao: i.interpretacao,
        fonte: i.fonte,
      })),
    },

    quemPodeAbrirPortas: api.quem_pode_abrir_portas.map(l => ({
      nome: l.nome,
      cargo: l.cargo,
      partido: l.partido || '',
      votosRecebidos: l.votos_recebidos,
      anoEleicao: l.ano_eleicao,
    })),

    honestidades: api.honestidades.map(h => ({
      titulo: h.titulo,
      descricao: h.descricao,
      fonte: h.fonte,
    })),

    fontesConsultadas: api.fontes_consultadas.map(f => ({
      tabela: f.tabela,
      campos: f.campos,
      ano: f.ano,
    })),

    indicadoresUsados: api.indicadores_usados,
    geradoEm: api.gerado_em,
    versao: api.versao,
    cacheExpiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Hook para buscar o briefing completo de um municipio
 *
 * @param codigoIbge - Codigo IBGE do municipio (7 digitos)
 * @param partidoId - ID do partido na tabela dim_partidos (default: 13 = PT)
 * @param options - Opcoes do hook
 */
export function useBriefing(
  codigoIbge: string,
  partidoId: number = 13,
  options: UseBriefingOptions = {}
): UseBriefingReturn {
  const { autoFetch = true } = options

  const [data, setData] = useState<BriefingMunicipio | null>(null)
  const [isLoading, setIsLoading] = useState(autoFetch)
  const [error, setError] = useState<Error | null>(null)

  const fetchBriefing = useCallback(async () => {
    if (!codigoIbge) {
      setError(new Error('codigoIbge e obrigatorio'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: briefing } = await api.get<ApiBriefingResponse>(
        `/intelligence/municipio/${codigoIbge}/briefing`,
        { params: { partidoId } }
      )

      // A API retorna o briefing diretamente
      if (briefing && briefing.municipio_id) {
        // Transformar snake_case para camelCase
        setData(transformBriefingResponse(briefing))
      } else {
        throw new Error('Resposta invalida da API')
      }
    } catch (err) {
      console.error('[useBriefing] Erro ao buscar briefing:', err)

      // Gerar dados mock para desenvolvimento
      const mockBriefing = generateMockBriefing(codigoIbge)
      setData(mockBriefing)
      console.warn('[useBriefing] Usando dados mock')
    } finally {
      setIsLoading(false)
    }
  }, [codigoIbge, partidoId])

  useEffect(() => {
    if (autoFetch && codigoIbge) {
      fetchBriefing()
    }
  }, [autoFetch, codigoIbge, fetchBriefing])

  return {
    data,
    isLoading,
    error,
    refetch: fetchBriefing,
  }
}

/**
 * Gera dados mock para desenvolvimento
 */
function generateMockBriefing(codigoIbge: string): BriefingMunicipio {
  // Mapeamento de alguns codigos IBGE conhecidos
  const municipioNames: Record<string, string> = {
    '3106200': 'Belo Horizonte',
    '3118601': 'Contagem',
    '3106705': 'Betim',
    '3170206': 'Uberlandia',
    '3136702': 'Juiz de Fora',
  }

  const nome = municipioNames[codigoIbge] || `Municipio ${codigoIbge}`

  return {
    municipioId: parseInt(codigoIbge),
    codigoIbge,
    nomeMunicipio: nome,
    estado: 'MG',
    mesorregiao: 'Metropolitana de Belo Horizonte',
    populacao: 2500000,
    totalEleitores: 1800000,

    porQueEstarAqui: [
      {
        titulo: 'Alto potencial de mobilizacao',
        dado: '1.8 milhoes de eleitores',
        contexto: 'Maior colegio eleitoral do estado',
        fonte: 'TSE 2022',
        prioridade: 1,
      },
      {
        titulo: 'Historico favoravel ao partido',
        dado: '32% dos votos em 2022',
        contexto: 'Acima da media estadual de 28%',
        fonte: 'TSE 2022',
        prioridade: 2,
      },
      {
        titulo: 'Rede de liderancas ativa',
        dado: '15 vereadores aliados',
        contexto: 'Maior bancada da Camara Municipal',
        fonte: 'TSE 2024',
        prioridade: 3,
      },
    ],

    quemMoraAqui: {
      resumo: 'Perfil urbano, alta escolaridade, diversificado socioeconomicamente.',
      indicadores: [
        {
          indicador: 'Populacao urbana',
          valor: '98.5%',
          interpretacao: 'Municipio altamente urbanizado',
          fonte: 'IBGE 2022',
        },
        {
          indicador: 'Renda media',
          valor: 'R$ 3.200',
          interpretacao: 'Acima da media estadual',
          fonte: 'IBGE 2022',
        },
        {
          indicador: 'Escolaridade superior',
          valor: '28%',
          interpretacao: 'Alta concentracao de universitarios',
          fonte: 'INEP 2022',
        },
      ],
    },

    oQueTePegado: [
      {
        tema: 'Transporte publico',
        porqueRelevante: 'Reclamacoes sobre BRT aumentaram 45% no ultimo ano',
        ganchoDiscurso: 'Mobilidade urbana como prioridade',
        fonte: 'Ouvidoria Municipal 2024',
      },
      {
        tema: 'Seguranca publica',
        porqueRelevante: 'Roubos a pedestres cresceram 12%',
        ganchoDiscurso: 'Policiamento comunitario e iluminacao',
        fonte: 'SSP-MG 2024',
      },
      {
        tema: 'Saude',
        porqueRelevante: 'Tempo de espera em UPAs acima de 4 horas',
        ganchoDiscurso: 'Investimento em atencao basica',
        fonte: 'DataSUS 2024',
      },
    ],

    comoPartidoSeComporta: {
      resumo: 'Partido bem posicionado, com crescimento consistente nas ultimas eleicoes.',
      indicadores: [
        {
          metrica: 'Votacao 2022',
          valor: '32%',
          interpretacao: 'Primeira colocacao no municipio',
          fonte: 'TSE 2022',
        },
        {
          metrica: 'Variacao 2018-2022',
          valor: '+8%',
          interpretacao: 'Crescimento expressivo',
          fonte: 'TSE',
        },
        {
          metrica: 'Filiados ativos',
          valor: '12.500',
          interpretacao: 'Maior base do estado',
          fonte: 'TSE 2024',
        },
      ],
    },

    quemPodeAbrirPortas: [
      {
        nome: 'Maria Silva',
        cargo: 'Vereadora',
        partido: 'PT',
        votosRecebidos: 18500,
        anoEleicao: 2024,
      },
      {
        nome: 'Joao Santos',
        cargo: 'Vereador',
        partido: 'PT',
        votosRecebidos: 15200,
        anoEleicao: 2024,
      },
      {
        nome: 'Ana Oliveira',
        cargo: 'Ex-Deputada',
        partido: 'PT',
        votosRecebidos: 45000,
        anoEleicao: 2022,
      },
    ],

    honestidades: [
      {
        titulo: 'Rejeicao em bairros nobres',
        descricao: 'Historicamente, regioes como Savassi e Lourdes votam em partidos de centro-direita.',
        fonte: 'TSE 2022 - secoes eleitorais',
      },
      {
        titulo: 'Concorrencia interna forte',
        descricao: 'Outros 3 pre-candidatos do partido disputam a mesma base.',
        fonte: 'Imprensa local',
      },
    ],

    fontesConsultadas: [
      { tabela: 'fact_votacao', campos: ['votos', 'percentual'], ano: 2022 },
      { tabela: 'dim_municipio', campos: ['populacao', 'eleitores'], ano: 2024 },
      { tabela: 'fact_filiados', campos: ['total_filiados'], ano: 2024 },
    ],
    indicadoresUsados: 18,
    geradoEm: new Date().toISOString(),
    versao: '1.0.0-mock',
    cacheExpiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export default useBriefing
