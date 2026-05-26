/**
 * Map Feature Types
 *
 * Tipos para o mapa exploratorio com filtros por indicador.
 * Sem classificacoes (consolidar/conquistar/etc) ou scores.
 * Coloracao dinamica baseada no indicador selecionado.
 */

export interface BrazilState {
  uf: string
  ibgeCode: number
  name: string
  capital: string
  region: string
  municipalityCount: number
  centerCoordinates: [number, number]
  zoom: number
}

export interface MunicipalityBasic {
  codigoIbge: string
  nome: string
  uf: string
  mesorregiao: string
  populacao: number
  latitude: number
  longitude: number
}

// ============================================
// Indicadores para coloracao do mapa
// ============================================

/**
 * Indicadores disponiveis para filtro/coloracao do mapa
 */
export type IndicatorId =
  | 'percentual_voto_partido'  // % voto do partido no municipio
  | 'saldo_caged'              // Saldo CAGED (empregos)
  | 'cobertura_psf'            // Cobertura PSF (saude)
  | 'populacao'                // Populacao
  | 'taxa_abstencao'           // Taxa de abstencao eleitoral
  | 'ideb'                     // IDEB educacao

export interface IndicatorConfig {
  id: IndicatorId
  label: string
  description: string
  unit: string
  /** Funcao para formatar o valor */
  format: (value: number | null) => string
  /** Cores para gradiente (do menor para maior valor) */
  colorScale: [string, string, string, string, string]
  /** Se true, valores maiores sao melhores (inverte escala de cor) */
  higherIsBetter: boolean
}

export const INDICATOR_CONFIGS: Record<IndicatorId, IndicatorConfig> = {
  percentual_voto_partido: {
    id: 'percentual_voto_partido',
    label: '% Voto do Partido',
    description: 'Percentual de votos do seu partido no municipio',
    unit: '%',
    format: (v) => v !== null ? `${v.toFixed(1)}%` : 'N/D',
    colorScale: ['#fef3c7', '#fcd34d', '#f59e0b', '#d97706', '#92400e'],
    higherIsBetter: true,
  },
  saldo_caged: {
    id: 'saldo_caged',
    label: 'Saldo CAGED',
    description: 'Saldo de empregos formais (admissoes - demissoes)',
    unit: 'empregos',
    format: (v) => v !== null ? v.toLocaleString('pt-BR') : 'N/D',
    colorScale: ['#ef4444', '#f97316', '#fcd34d', '#84cc16', '#22c55e'],
    higherIsBetter: true,
  },
  cobertura_psf: {
    id: 'cobertura_psf',
    label: 'Cobertura PSF',
    description: 'Cobertura do Programa Saude da Familia',
    unit: '%',
    format: (v) => v !== null ? `${v.toFixed(1)}%` : 'N/D',
    colorScale: ['#ef4444', '#f97316', '#fcd34d', '#84cc16', '#22c55e'],
    higherIsBetter: true,
  },
  populacao: {
    id: 'populacao',
    label: 'Populacao',
    description: 'Populacao total do municipio',
    unit: 'hab',
    format: (v) => {
      if (v === null) return 'N/D'
      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
      if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
      return v.toLocaleString('pt-BR')
    },
    colorScale: ['#e0f2fe', '#7dd3fc', '#38bdf8', '#0284c7', '#0369a1'],
    higherIsBetter: true, // Neutro, mas maior = mais votos potenciais
  },
  taxa_abstencao: {
    id: 'taxa_abstencao',
    label: 'Taxa de Abstencao',
    description: 'Percentual de eleitores que nao compareceram',
    unit: '%',
    format: (v) => v !== null ? `${v.toFixed(1)}%` : 'N/D',
    colorScale: ['#22c55e', '#84cc16', '#fcd34d', '#f97316', '#ef4444'],
    higherIsBetter: false, // Menor abstencao e melhor
  },
  ideb: {
    id: 'ideb',
    label: 'IDEB',
    description: 'Indice de Desenvolvimento da Educacao Basica',
    unit: '',
    format: (v) => v !== null ? v.toFixed(1) : 'N/D',
    colorScale: ['#ef4444', '#f97316', '#fcd34d', '#84cc16', '#22c55e'],
    higherIsBetter: true,
  },
}

// ============================================
// Municipio com dados de indicadores
// ============================================

export interface MunicipalityWithIndicators extends MunicipalityBasic {
  /** Valores dos indicadores para este municipio */
  indicators: Partial<Record<IndicatorId, number | null>>
}

// ============================================
// Estado do mapa exploratorio
// ============================================

export interface MapFilters {
  state: string
  /** Indicador selecionado para coloracao */
  activeIndicator: IndicatorId
  /** Filtro de regiao (opcional) */
  region?: string
  /** Faixa de populacao (opcional) */
  populationRange?: [number, number]
}

export interface MapTooltipData {
  municipio: MunicipalityBasic
  indicatorValue: number | null
  indicatorConfig: IndicatorConfig
}

// ============================================
// Sistema de Classificacao (v2.1)
// ============================================

/**
 * Categorias de classificacao de municipios.
 * Baseado em condicoes booleanas, nao em scores opacos.
 */
export type CategoriaClassificacao =
  | 'prioritaria'   // Maxima prioridade
  | 'crescente'     // Em crescimento, potencial
  | 'exploratoria'  // Vale investigar
  | 'fora_radar'    // Nao priorizar agora

/**
 * Configuracao visual de cada categoria.
 */
export interface CategoriaConfig {
  id: CategoriaClassificacao
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
}

export const CATEGORIA_CONFIGS: Record<CategoriaClassificacao, CategoriaConfig> = {
  prioritaria: {
    id: 'prioritaria',
    label: 'Prioritaria',
    description: 'Municipio com alto potencial, estrutura local e historico favoravel',
    color: '#16a34a',      // green-600
    bgColor: '#22c55e',    // green-500 (mais vivo)
    borderColor: '#16a34a', // green-600
  },
  crescente: {
    id: 'crescente',
    label: 'Crescente',
    description: 'Municipio em crescimento, trajetoria positiva nos ultimos ciclos',
    color: '#2563eb',      // blue-600
    bgColor: '#3b82f6',    // blue-500 (mais vivo)
    borderColor: '#2563eb', // blue-600
  },
  exploratoria: {
    id: 'exploratoria',
    label: 'Exploratoria',
    description: 'Municipio viavel, vale investigar mais a fundo',
    color: '#d97706',      // amber-600
    bgColor: '#f59e0b',    // amber-500 (mais vivo)
    borderColor: '#d97706', // amber-600
  },
  fora_radar: {
    id: 'fora_radar',
    label: 'Fora do Radar',
    description: 'Municipio sem prioridade no momento',
    color: '#6b7280',      // gray-500
    bgColor: '#9ca3af',    // gray-400 (mais vivo)
    borderColor: '#6b7280', // gray-500
  },
}

/**
 * Condicao avaliada com resultado e justificativa.
 */
export interface CondicaoAvaliada {
  id: string
  nome: string
  resultado: boolean
  valor_bruto: any
  criterio: string
}

/**
 * Classificacao completa de um municipio.
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

/**
 * Versao resumida para o mapa (bulk).
 */
export interface ClassificacaoBulk {
  codigo_ibge: string
  nome: string
  categoria: CategoriaClassificacao
  condicoes_determinantes: string[]
}
