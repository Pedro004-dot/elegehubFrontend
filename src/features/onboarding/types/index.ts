/**
 * Tipos para o wizard de onboarding de 7 etapas
 */

export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface OnboardingStatus {
  currentStep: OnboardingStep
  completedAt?: string
  readyForDiagnostic: boolean
  profile?: CandidateProfile
  bandeiras?: CandidateBandeira[]
  historico?: CandidateHistoricoEleitoral[]
  basesTerritorial?: CandidateBaseTerritorial[]
  liderancas?: CandidateLideranca[]
  basesOrganizadas?: CandidateBaseOrganizada[]
  recursos?: CandidateRecursos
  adversarios?: CandidateAdversario[]
  objetivos?: CandidateObjetivos
  enrichmentJob?: EnrichmentJob
}

export interface CandidateProfile {
  campaignId: string
  cpf?: string
  idade?: number
  escolaridade?: 'fundamental' | 'medio' | 'superior' | 'pos'
  profissao?: string
  cidadeNatalId?: number
  cidadeBaseId?: number
  religiao?: string
  denominacao?: string
  historiaTexto?: string
  onboardingStep: number
  onboardingCompletedAt?: string
  readyForDiagnostic: boolean
}

export interface CandidateBandeira {
  id: string
  campaignId: string
  bandeira: string
  ordem: number
}

export interface CandidateHistoricoEleitoral {
  id: string
  campaignId: string
  ano: number
  cargo: string
  partidoSigla?: string
  uf?: string
  votosObtidos?: number
  eleito: boolean
  origem: 'tse' | 'manual'
  tseCandidatoId?: number
}

export interface CandidateBaseTerritorial {
  id: string
  campaignId: string
  municipioId: number
  tipo: 'base_solida' | 'presenca'
  forca?: number
}

export interface CandidateLideranca {
  id: string
  campaignId: string
  nome: string
  cargo?: string
  municipioId?: number
  observacoes?: string
}

export interface CandidateBaseOrganizada {
  id: string
  campaignId: string
  tipo: 'igreja_evangelica' | 'igreja_catolica' | 'sindicato' | 'associacao_empresarial' | 'movimento_social' | 'universidade' | 'outro'
  descricao?: string
}

export interface CandidateRecursos {
  campaignId: string
  orcamentoFaixa?: 'ate_100k' | '100k_500k' | '500k_2m' | '2m_5m' | '5m_plus'
  fundoPartidarioFaixa?: 'ate_100k' | '100k_500k' | '500k_2m' | '2m_5m' | '5m_plus'
  temTv: boolean
  temRadio: boolean
  equipeAtual: Array<{ nome: string; funcao: string }>
}

export interface CandidateAdversario {
  id: string
  campaignId: string
  adversarioCandidatoId?: number
  nomeManual?: string
  prioridade?: number
  origem: 'sugerido' | 'manual'
}

export interface CandidateObjetivos {
  campaignId: string
  metaVotos?: number
  preocupacaoPrincipal?: string
  prioridadesDiagnostico: string[]
}

export interface EnrichmentJob {
  id: string
  campaignId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  stepsCompleted: string[]
  error?: string
  startedAt?: string
  completedAt?: string
}

// Step data types
export interface Step1Data {
  nomeUrna: string
  cargo: string
  uf: string
  partidoId?: number
  cpf?: string
}

export interface Step2Data {
  historico: Array<{
    ano: number
    cargo: string
    partidoSigla?: string
    uf?: string
    votosObtidos?: number
    eleito?: boolean
    origem: 'tse' | 'manual'
    tseCandidatoId?: number
  }>
}

export interface Step3Data {
  idade?: number
  escolaridade?: 'fundamental' | 'medio' | 'superior' | 'pos'
  profissao?: string
  cidadeNatalId?: number
  cidadeBaseId?: number
  religiao?: string
  denominacao?: string
  historiaTexto?: string
  bandeiras: Array<{ bandeira: string; ordem: number }>
}

export interface Step4Data {
  basesTerritorial: Array<{
    municipioId: number
    tipo: 'base_solida' | 'presenca'
    forca?: number
  }>
  liderancas: Array<{
    nome: string
    cargo?: string
    municipioId?: number
    observacoes?: string
  }>
  basesOrganizadas: Array<{
    tipo: 'igreja_evangelica' | 'igreja_catolica' | 'sindicato' | 'associacao_empresarial' | 'movimento_social' | 'universidade' | 'outro'
    descricao?: string
  }>
}

export interface Step5Data {
  orcamentoFaixa?: 'ate_100k' | '100k_500k' | '500k_2m' | '2m_5m' | '5m_plus'
  fundoPartidarioFaixa?: 'ate_100k' | '100k_500k' | '500k_2m' | '2m_5m' | '5m_plus'
  temTv?: boolean
  temRadio?: boolean
  equipeAtual?: Array<{ nome: string; funcao: string }>
}

export interface Step6Data {
  adversarios: Array<{
    adversarioCandidatoId?: number
    nomeManual?: string
    prioridade?: number
    origem: 'sugerido' | 'manual'
  }>
}

export interface Step7Data {
  metaVotos?: number
  preocupacaoPrincipal?: string
  prioridadesDiagnostico?: string[]
}

// AI Suggestion types
export interface AISuggestedBandeira {
  texto: string
  justificativa: string
}

export interface AIBandeirasResponse {
  bandeiras: AISuggestedBandeira[]
}

export interface AIRefinedHistoria {
  texto_refinado: string
  sugestoes_adicionais: string[]
}

export interface AIMetaVotosResponse {
  meta_minima: number
  meta_realista: number
  meta_otimista: number
  justificativa: string
  benchmarks: Array<{ referencia: string; votos: number }>
}

export interface SuggestedAdversario {
  candidatoId: number
  nome: string
  nomeUrna: string
  partido: string
  votos2022: number
  fotoUrl?: string
  score?: number
}

export interface TseMatchResponse {
  found: boolean
  nome?: string
  historico: Array<{
    ano: number
    cargo: string
    partido: string
    uf: string
    votos: number
    eleito: boolean
    id: number
  }>
}

// Step metadata
export const STEP_LABELS = [
  '', // Step 0 doesn't exist
  'Identidade Politica',
  'Historico Eleitoral',
  'Perfil e Bandeiras',
  'Rede e Territorio',
  'Recursos',
  'Adversarios',
  'Objetivos',
] as const

export const STEP_DESCRIPTIONS = [
  '',
  'Defina o cargo, estado e partido da candidatura',
  'Registre seu historico em eleicoes anteriores',
  'Complete seu perfil pessoal e defina suas bandeiras',
  'Mapeie sua rede de apoio e bases territoriais',
  'Informe os recursos disponiveis para campanha',
  'Identifique seus principais adversarios',
  'Defina suas metas e prioridades',
] as const
