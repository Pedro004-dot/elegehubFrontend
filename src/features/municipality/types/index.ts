/**
 * Municipality Feature Types
 *
 * Tipos para briefing e indicadores de municipio.
 * Baseado no CLAUDE.md v2.0 - sem scores, sem projecoes, sem otimizacao.
 */

// =============================================================================
// Tipos Base
// =============================================================================

export type CodigoIBGE = string

export type MesorregiaoMG =
  | 'Noroeste de Minas'
  | 'Norte de Minas'
  | 'Jequitinhonha'
  | 'Vale do Mucuri'
  | 'Triangulo Mineiro/Alto Paranaiba'
  | 'Central Mineira'
  | 'Metropolitana de Belo Horizonte'
  | 'Vale do Rio Doce'
  | 'Oeste de Minas'
  | 'Sul/Sudoeste de Minas'
  | 'Campo das Vertentes'
  | 'Zona da Mata'

// =============================================================================
// Tipos das 6 Secoes do Briefing (conforme CLAUDE.md secao 7.2)
// =============================================================================

/**
 * Secao 1: Por que essa cidade vale atencao
 * 3-5 razoes objetivas com dado especifico e fonte
 */
export interface RazaoVisita {
  titulo: string
  dado: string
  contexto: string
  fonte: string
  prioridade: 1 | 2 | 3 | 4 | 5
}

/**
 * Secao 2: Quem mora aqui - Indicador de perfil demografico
 */
export interface IndicadorPerfil {
  indicador: string
  valor: string
  interpretacao: string
  fonte: string
}

/**
 * Secao 2: Quem mora aqui - Perfil completo
 */
export interface QuemMoraAqui {
  resumo: string
  indicadores: IndicadorPerfil[]
}

/**
 * Secao 3: O que tem pegado - Temas locais com evidencia
 */
export interface TemaLocal {
  tema: string
  porqueRelevante: string
  ganchoDiscurso: string
  fonte: string
}

/**
 * Secao 4: Como meu partido se comporta aqui
 */
export interface MetricaPartido {
  metrica: string
  valor: string
  interpretacao: string
  fonte: string
}

export interface ComportamentoPartido {
  resumo: string
  indicadores: MetricaPartido[]
}

/**
 * Secao 5: Quem pode abrir portas - Liderancas locais
 */
export interface LiderancaLocal {
  nome: string
  cargo: string
  partido: string
  votosRecebidos: number | null
  anoEleicao: number
}

/**
 * Secao 6: Honestidades - O que torna essa cidade dificil
 */
export interface Honestidade {
  titulo: string
  descricao: string
  fonte: string
}

/**
 * Fonte consultada para rastreabilidade (principio 3.5 CLAUDE.md)
 */
export interface FonteConsultada {
  tabela: string
  campos: string[]
  ano: number
}

/**
 * Briefing completo do municipio com as 6 secoes obrigatorias
 */
export interface BriefingMunicipio {
  municipioId: number
  codigoIbge: string
  nomeMunicipio: string
  estado: string
  mesorregiao: MesorregiaoMG
  populacao: number | null
  totalEleitores: number | null

  // === 6 SECOES OBRIGATORIAS (conforme CLAUDE.md secao 7.2) ===

  /** Secao 1: Por que essa cidade vale atencao */
  porQueEstarAqui: RazaoVisita[]

  /** Secao 2: Quem mora aqui */
  quemMoraAqui: QuemMoraAqui

  /** Secao 3: O que tem pegado */
  oQueTePegado: TemaLocal[]

  /** Secao 4: Como meu partido se comporta aqui */
  comoPartidoSeComporta: ComportamentoPartido

  /** Secao 5: Quem pode abrir portas */
  quemPodeAbrirPortas: LiderancaLocal[]

  /** Secao 6: Honestidades */
  honestidades: Honestidade[]

  // === METADADOS ===
  fontesConsultadas: FonteConsultada[]
  indicadoresUsados: number
  geradoEm: string
  versao: string
  cacheExpiraEm: string // briefing cacheado por 7 dias
}

// =============================================================================
// Indicadores por Tema (conforme CLAUDE.md secao 7.3)
// =============================================================================

/**
 * Indicador individual com valor, contexto e fonte
 */
export interface Indicador {
  nome: string
  valor: number | string
  unidade: string
  contextoComparativo: {
    mediaEstadual: number | string
    posicaoRelativa: string // ex: "acima da media", "top 20%"
  }
  tendencia?: {
    variacao: number
    periodo: string // ex: "2018-2022"
    direcao: 'crescimento' | 'estavel' | 'queda'
  }
  fonte: {
    tabela: string
    campo: string
    ano: number
  }
}

/**
 * Tema com seus indicadores (6 temas conforme CLAUDE.md)
 */
export interface TemaIndicadores {
  tema: TemaType
  titulo: string
  descricao: string
  indicadores: Indicador[]
}

export type TemaType =
  | 'presenca_partido'
  | 'comportamento_eleitoral'
  | 'perfil_eleitorado'
  | 'condicoes_socioeconomicas'
  | 'saude_publica'
  | 'liderancas_locais'

export const TEMA_INFO: Record<TemaType, { titulo: string; descricao: string }> = {
  presenca_partido: {
    titulo: 'Presenca do partido aqui',
    descricao: 'Historico eleitoral e capilaridade do partido no municipio',
  },
  comportamento_eleitoral: {
    titulo: 'Comportamento eleitoral do municipio',
    descricao: 'Padroes de votacao, abstencao e elasticidade',
  },
  perfil_eleitorado: {
    titulo: 'Perfil do eleitorado',
    descricao: 'Dados demograficos e caracteristicas do eleitor',
  },
  condicoes_socioeconomicas: {
    titulo: 'Condicoes socioeconomicas',
    descricao: 'Emprego, renda, beneficios sociais',
  },
  saude_publica: {
    titulo: 'Saude publica local',
    descricao: 'Cobertura de saude, indicadores de atendimento',
  },
  liderancas_locais: {
    titulo: 'Liderancas locais aliadas',
    descricao: 'Vereadores, prefeitos e ex-prefeitos do espectro',
  },
}

// =============================================================================
// Sugestao da IA (conforme CLAUDE.md secao 6)
// =============================================================================

/**
 * Os 3 escopos legitimos da Sugestao da IA
 */
export type SugestaoEscopo = 'sumario' | 'narrativa' | 'pauta'

export const SUGESTAO_ESCOPOS: Record<SugestaoEscopo, { titulo: string; descricao: string }> = {
  sumario: {
    titulo: 'Sumarizar',
    descricao: 'Resumir o que esta na tela em 3-5 frases',
  },
  narrativa: {
    titulo: 'Conectar em narrativa',
    descricao: 'Justificativa de por que esse municipio merece atencao',
  },
  pauta: {
    titulo: 'Recomendar pauta',
    descricao: 'Temas de discurso baseados nos dados',
  },
}

export interface SugestaoIA {
  escopo: SugestaoEscopo
  conteudo: string
  indicadoresConsultados: string[]
  geradoEm: string
}

// =============================================================================
// Historico de Briefings
// =============================================================================

export interface BriefingHistoricoItem {
  codigoIbge: string
  nomeMunicipio: string
  geradoEm: string
  cacheValido: boolean
  cacheExpiraEm: string
}

// =============================================================================
// Configuracao de Mesorregioes
// =============================================================================

export const MESORREGIAO_CONFIG: Record<MesorregiaoMG, { shortName: string; color: string }> = {
  'Noroeste de Minas': { shortName: 'Noroeste', color: '#8b5cf6' },
  'Norte de Minas': { shortName: 'Norte', color: '#f97316' },
  'Jequitinhonha': { shortName: 'Jequitinhonha', color: '#ef4444' },
  'Vale do Mucuri': { shortName: 'Mucuri', color: '#ec4899' },
  'Triangulo Mineiro/Alto Paranaiba': { shortName: 'Triangulo', color: '#06b6d4' },
  'Central Mineira': { shortName: 'Central', color: '#84cc16' },
  'Metropolitana de Belo Horizonte': { shortName: 'RMBH', color: '#3b82f6' },
  'Vale do Rio Doce': { shortName: 'Rio Doce', color: '#f59e0b' },
  'Oeste de Minas': { shortName: 'Oeste', color: '#10b981' },
  'Sul/Sudoeste de Minas': { shortName: 'Sul', color: '#22c55e' },
  'Campo das Vertentes': { shortName: 'Vertentes', color: '#a855f7' },
  'Zona da Mata': { shortName: 'Zona da Mata', color: '#14b8a6' },
}
