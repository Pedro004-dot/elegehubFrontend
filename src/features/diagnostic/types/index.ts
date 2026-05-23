/**
 * Diagnostic Feature Types
 *
 * Types for the diagnostic feature based on backend agent outputs.
 */

// =============================================================================
// Core Types
// =============================================================================

export type SectionType =
  | 'executive_summary'
  | 'candidate_profile'
  | 'territorial'
  | 'competitors'
  | 'benchmark'
  | 'narrative'
  | 'action_plan'

export type DiagnosticStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type ToneProfileId = 'tecnico' | 'marketeiro' | 'estrategista' | 'custom'

export type TerritorialClassification =
  | 'fiel'
  | 'pendular'
  | 'disputavel'
  | 'hostil'
  | 'alta_abstencao'

export type TerritorialTendency = 'crescimento' | 'estavel' | 'retracao'

// =============================================================================
// Diagnostic Run
// =============================================================================

export interface DiagnosticRun {
  id: string
  campaign_id: string
  version: number
  tone_profile: ToneProfileId
  status: DiagnosticStatus
  started_at?: string
  completed_at?: string
  duration_ms?: number
  error_message?: string
  pdf_storage_path?: string
  web_url?: string
  total_cost_usd: number
  total_tokens_input: number
  total_tokens_output: number
  triggered_by: 'auto_after_onboarding' | 'manual' | 'scheduled'
  created_at: string
}

export interface DiagnosticSection {
  id: string
  diagnostic_run_id: string
  section_type: SectionType
  content_json: unknown
  content_markdown: string
  agent_model: string
  agent_version: string
  generated_at: string
  duration_ms: number
  tokens_input: number
  tokens_output: number
  cost_usd: number
  quality_score: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  error_message?: string
}

// =============================================================================
// Executive Summary Section
// =============================================================================

export interface ExecutiveSummaryData {
  estado_atual_candidatura: string
  principal_forca: {
    titulo: string
    frase: string
  }
  maior_risco: {
    titulo: string
    frase: string
  }
  aposta_estrategica_recomendada: string
  top_3_acoes_30_dias: Array<{
    acao: string
    prazo: string
    impacto_esperado: string
  }>
  resumo_numerico: {
    votos_meta: number
    votos_projecao: number
    orcamento_recomendado: number
    regioes_prioritarias: number
    adversarios_principais: number
  }
}

// =============================================================================
// Candidate Profile Section
// =============================================================================

export interface CandidateProfileData {
  // Backend field names
  pontos_fortes?: Array<{
    titulo: string
    descricao: string
    dado_suporte?: string
  }>
  // UI-friendly field names
  forcas?: Array<{
    titulo: string
    descricao: string
    como_explorar?: string
  }>
  vulnerabilidades?: Array<{
    titulo: string
    descricao: string
    gravidade?: number // 1-5
    severidade?: 'alta' | 'media' | 'baixa'
    mitigacao?: string
  }>
  adequacao_partido_territorio?: {
    score: number // 1-10
    justificativa: string
    riscos: string[]
  }
  partido_territorio?: {
    alinhamento_score: number
    analise: string
    oportunidades?: string[]
    riscos?: string[]
  }
  alertas_imagem?: Array<{
    tipo: string
    descricao: string
    recomendacao: string
  }>
  alertas?: Array<{
    tipo: string
    descricao: string
    recomendacao?: string
  }>
  comparacao_perfil_vencedor?: {
    diferencas_chave: string[]
    proximidade_score: number // 1-100
    interpretacao: string
  }
  comparacao_vencedor?: {
    proximidade_score: number
    gaps_principais?: Array<{
      dimensao: string
      descricao: string
    }>
    vantagens?: Array<{
      dimensao: string
      descricao: string
    }>
    recomendacao?: string
  }
}

// =============================================================================
// Territorial Section
// =============================================================================

export interface TerritorialMunicipio {
  municipio_id: number
  codigo_ibge?: string
  nome: string
  classification: TerritorialClassification
  classificacao?: TerritorialClassification // legacy

  // Dados básicos
  eleitorado: number
  eleitores?: number // legacy alias
  abstencao_pct?: number
  latitude?: number
  longitude?: number

  // Score de afinidade (calculado deterministicamente)
  score: number // 0-1 (decimal)
  score_percentual: number // 0-100
  score_base?: number
  score_compatibilidade?: number // legacy
  modifiers?: {
    abstencao_boost: number
    tendencia_boost: number
    partido_presente_boost: number
  }

  // Votos potenciais
  votos_potenciais: {
    total: number
    por_partido: Array<{
      partido: string
      espectro: string | null
      votos: number
      distancia: number
      taxa_captura: number
      votos_potenciais: number
    }>
    penetracao_pct: number
  }
  votos_potenciais_ajustado: number

  // Custo e ROI
  custo: {
    custo_base: number
    fator_distancia: number
    fator_presenca: number
    custo_estimado: number
    distancia_km: number | null
    tem_lideranca: boolean
  }
  roi: number

  // Histórico do candidato
  historico: {
    tem_historico: boolean
    votos_historico_2022: number
    votos_historico_2018: number
    tendencia_historico: 'crescimento' | 'estavel' | 'retracao' | null
    variacao_historico_pct: number
    fonte: 'tse' | 'base_territorial' | 'estimado' | null
  }

  // Top 3 partidos no município
  top3_partidos: Array<{
    sigla: string
    espectro: string | null
    votos_2022: number
    votos_2018: number
    variacao_pct: number
    ranking: number
  }>

  // Campos legados (compatibilidade)
  tendencia?: TerritorialTendency | 'crescente' | 'decrescente' | 'estavel'
  delta_2018_2022?: number
  prioridade?: number // 1-5
  recomendacao_texto?: string
}

export interface TerritorialData {
  municipios_classificados: TerritorialMunicipio[]
  visao_macro?: {
    forca_geografica_principal: string
    vulnerabilidade_geografica_principal: string
    zonas_oportunidade: Array<{ regiao: string; justificativa: string }>
    zonas_evitar: Array<{ regiao: string; justificativa: string }>
  }
  recomendacao_alocacao_esforco?: {
    por_regiao: Array<{ regiao: string; percentual: number; justificativa: string }>
    municipios_top_10_investir: string[]
    municipios_top_5_evitar: string[]
  }
  recomendacoes?: string
}

// =============================================================================
// Municipality Analysis Types (Deterministic Algorithm)
// =============================================================================

export interface MunicipalityAnalysisStatistics {
  total_municipios: number
  por_classificacao: Record<TerritorialClassification, number>
  votos_potenciais_total: number
  votos_potenciais_ajustado_total: number
  score_medio: number
  custo_total_estimado: number
  roi_medio: number
  municipios_com_historico: number
  municipios_com_lideranca: number
}

export interface MunicipalityAnalysisMeta {
  campaign_id: string
  partido_sigla: string
  partido_espectro: string | null
  cargo: string
  uf: string
  generated_at: string
  version: string
}

export interface MunicipalityAnalysisRankings {
  top10_votos_potenciais: TerritorialMunicipio[]
  top10_roi: TerritorialMunicipio[]
  top10_score: TerritorialMunicipio[]
}

export interface MunicipalityAnalysisResponse {
  success: boolean
  data: {
    municipios: TerritorialMunicipio[]
    municipios_raw: TerritorialMunicipio[]
    estatisticas: MunicipalityAnalysisStatistics
    rankings: MunicipalityAnalysisRankings
    meta: MunicipalityAnalysisMeta
  }
}

// =============================================================================
// Competitors Section
// =============================================================================

export interface CompetitorDimension {
  voce: number
  ele: number
  vantagem: 'voce' | 'ele'
}

export interface CompetitorAnalysisData {
  competitor_id?: number
  competitor_name?: string
  competitor_party?: string
  perfil_resumo: string
  base_territorial_forte: Array<{
    municipio_id: number
    votos_2022: number
    dominancia_pct: number
  }>
  vulnerabilidades_exploraveis: Array<{
    tipo: string
    descricao: string
    evidencia: string
  }>
  forcas_principais: string[]
  como_se_diferenciar: {
    narrativa: string
    territorio: string
    publico: string
  }
  comparativo_5_dimensoes: {
    base_eleitoral: CompetitorDimension
    recursos_estimados: CompetitorDimension
    perfil_publico: CompetitorDimension
    diferencial_narrativo: CompetitorDimension
    rede_apoio: CompetitorDimension
  }
}

// UI-friendly competitor analysis type
export interface CompetitorAnalysis {
  nome: string
  partido: string
  cargo_atual?: string
  nivel_ameaca?: number // 0-1
  pontos_fortes?: string[]
  vulnerabilidades?: string[]
  base_territorial?: {
    municipios_principais?: string[]
    eleitorado_estimado?: number
  }
  estrategia_recomendada?: string
}

export interface CompetitorsData {
  competitors?: CompetitorAnalysisData[]
  adversarios?: CompetitorAnalysis[]
  placeholder?: boolean
  message?: string
}

// =============================================================================
// Benchmark Section
// =============================================================================

export interface BudgetAllocation {
  pct: number
  justificativa: string
}

export interface BenchmarkData {
  // Backend structure
  benchmark_eleitos?: {
    votos_minimos_eleito: number
    votos_medianos_eleitos: number
    votos_topo_eleitos: number
    gasto_mediano_eleitos: number
    cac_mediano: number
    distribuicao_gastos_pct: {
      midia: number
      pessoal: number
      transporte: number
      eventos: number
      outros: number
    }
  }
  sua_projecao_realista?: {
    votos_estimados: number
    intervalo_confianca: [number, number]
    justificativa: string
    premissas_usadas: string[]
  }
  gap_meta_vs_projecao?: {
    meta_declarada: number
    projecao: number
    gap_votos: number
    gap_orcamento_estimado: number
    recomendacao: string
  }
  alocacao_orcamento_sugerida?: {
    midia: BudgetAllocation
    pessoal: BudgetAllocation
    transporte: BudgetAllocation
    eventos: BudgetAllocation
    outros: BudgetAllocation
  }
  // UI-friendly structure
  meta_votos: number
  media_eleitos: number
  cac_historico?: number
  orcamento_minimo?: number
  projecao?: {
    votos: number
    descricao: string
  }
  comparativo_historico?: Array<{
    nome: string
    cargo: string
    ano: number
    votos: number
    caracteristicas?: string[]
  }>
  dimensoes?: Array<{
    nome: string
    score: number
    media_eleitos: number
  }>
  recomendacao?: string
}

// =============================================================================
// Narrative Section
// =============================================================================

export interface NarrativePillar {
  tema?: string
  titulo?: string
  frase_sintese?: string
  descricao?: string
  justificativa?: string
  publicos_alvo?: string[]
  tom_sugerido?: string
  exemplos_mensagem?: string[]
  exemplos?: string[]
}

export interface NarrativeData {
  // Backend structure
  pilares_narrativos?: NarrativePillar[]
  slogans_sugeridos?: string[]
  posicionamento_vs_adversarios?: {
    espaco_narrativo_livre: string
    como_ocupar: string
  }
  alertas_narrativos?: Array<{
    tipo: string
    descricao: string
  }>
  // UI-friendly structure
  frase_sintese?: string
  pilares?: Array<{
    titulo: string
    descricao: string
    exemplos?: string[]
  }>
  slogans?: Array<{
    texto: string
    contexto?: string
    score?: number
  }>
  mensagens_chave?: Array<{
    mensagem: string
    publico_alvo?: string
    canal_recomendado?: string
  }>
  alertas?: Array<{
    titulo: string
    descricao: string
    recomendacao?: string
  }>
  tom_recomendado?: string
  caracteristicas_tom?: string[]
}

// =============================================================================
// Action Plan Section
// =============================================================================

export interface ActionPhase {
  semanas: string
  objetivos: string[]
  acoes: string[]
}

export interface BudgetChannel {
  pct: number
  valor: number
}

// UI-friendly action item type
export interface ActionItem {
  titulo: string
  descricao?: string
  prioridade?: 'alta' | 'media' | 'baixa'
  prazo?: string
  orcamento?: number
  impacto_esperado?: string
  fase?: 'pre-campanha' | 'campanha' | 'pos-campanha'
}

export interface ActionPlanData {
  // Backend structure
  cronograma_90_dias?: {
    fase_1_pre_convencao: ActionPhase
    fase_2_pos_convencao: ActionPhase
    fase_3_pre_campanha: ActionPhase
  }
  distribuicao_orcamento_canais?: {
    midia_digital: BudgetChannel
    midia_tradicional: BudgetChannel
    rua_corpo_a_corpo: BudgetChannel
    equipe_logistica: BudgetChannel
  }
  metricas_monitorar?: Array<{
    nome: string
    frequencia: string
    meta: string
  }>
  riscos_compliance?: Array<{
    tipo: string
    prazo_tse: string
    acao: string
  }>
  top_10_acoes_concretas?: Array<{
    ordem: number
    acao: string
    prazo: string
    responsavel_sugerido: string
    indicador_sucesso: string
  }>
  // UI-friendly structure
  acoes?: ActionItem[]
  orcamento_total?: number
  duracao_meses?: number
  orcamento_por_canal?: Array<{
    canal: string
    valor: number
  }>
  recomendacao_principal?: string
  quick_win?: {
    titulo: string
    descricao: string
    prazo: string
  }
}

// =============================================================================
// Full Diagnostic Response
// =============================================================================

export interface DiagnosticFull {
  run: DiagnosticRun
  sections: {
    executive_summary?: ExecutiveSummaryData
    candidate_profile?: CandidateProfileData
    territorial?: TerritorialData
    competitors?: CompetitorsData
    benchmark?: BenchmarkData
    narrative?: NarrativeData
    action_plan?: ActionPlanData
  }
  raw_sections: DiagnosticSection[]
}

// =============================================================================
// Diagnostic Status Response (for polling)
// =============================================================================

export interface DiagnosticStatusResponse {
  status: DiagnosticStatus
  progress_pct: number
  current_step: string
  sections_completed: SectionType[]
  sections_running: SectionType[]
  estimated_remaining_seconds?: number
  error_message?: string
}

// =============================================================================
// Settings & Tone Profiles
// =============================================================================

export interface ToneProfile {
  id: ToneProfileId
  name: string
  description: string
  system_prompt_addition?: string
}

export interface DiagnosticSettings {
  campaign_id: string
  preferred_tone_profile: ToneProfileId
  custom_tone_instructions?: string
  auto_regenerate_monthly: boolean
  last_regenerated_at?: string
  created_at?: string
  updated_at?: string
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface StartDiagnosticRequest {
  toneOverride?: ToneProfileId
  triggeredBy?: 'manual' | 'auto_after_onboarding'
}

export interface StartDiagnosticResponse {
  diagnostic_run_id: string
  status: DiagnosticStatus
  version: number
  estimated_duration_seconds: number
}

export interface UpdateSettingsRequest {
  preferred_tone_profile?: ToneProfileId
  custom_tone_instructions?: string
  auto_regenerate_monthly?: boolean
}

// =============================================================================
// Notification Types
// =============================================================================

export interface DiagnosticNotification {
  id: string
  user_id: string
  campaign_id?: string
  type: 'diagnostic_completed' | 'diagnostic_failed'
  title: string
  message?: string
  link_url?: string
  read_at?: string
  created_at: string
}

// =============================================================================
// UI Helper Types
// =============================================================================

export interface SectionInfo {
  type: SectionType
  title: string
  icon: string
  description: string
}

export const SECTION_INFO: Record<SectionType, Omit<SectionInfo, 'type'>> = {
  executive_summary: {
    title: 'Sumario Executivo',
    icon: 'FileText',
    description: 'Visao geral e principais recomendacoes',
  },
  candidate_profile: {
    title: 'Perfil do Candidato',
    icon: 'User',
    description: 'Forcas, vulnerabilidades e adequacao',
  },
  territorial: {
    title: 'Analise Territorial',
    icon: 'Map',
    description: 'Classificacao de municipios e estrategia geografica',
  },
  competitors: {
    title: 'Analise de Adversarios',
    icon: 'Users',
    description: 'Comparativo com principais concorrentes',
  },
  benchmark: {
    title: 'Benchmark Eleitoral',
    icon: 'BarChart',
    description: 'Comparacao com historico e projecoes',
  },
  narrative: {
    title: 'Estrategia Narrativa',
    icon: 'MessageSquare',
    description: 'Pilares de comunicacao e posicionamento',
  },
  action_plan: {
    title: 'Plano de Acao',
    icon: 'ListTodo',
    description: 'Cronograma 90 dias e acoes concretas',
  },
}

export const CLASSIFICATION_COLORS: Record<TerritorialClassification, string> = {
  fiel: '#22c55e', // Verde
  pendular: '#eab308', // Amarelo
  disputavel: '#f97316', // Laranja
  hostil: '#ef4444', // Vermelho
  alta_abstencao: '#71717a', // Cinza
}

export const CLASSIFICATION_LABELS: Record<TerritorialClassification, string> = {
  fiel: 'Fiel',
  pendular: 'Pendular',
  disputavel: 'Disputável',
  hostil: 'Hostil',
  alta_abstencao: 'Alta Abstenção',
}
