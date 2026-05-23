import { api } from '@/services/api'
import type {
  OnboardingStatus,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
  Step7Data,
  SuggestedAdversario,
  TseMatchResponse,
  AIBandeirasResponse,
  AIRefinedHistoria,
  AIMetaVotosResponse,
  EnrichmentJob,
} from '../types'

const BASE_URL = (campaignId: string) => `/campaigns/${campaignId}/onboarding`

/**
 * Busca status atual do onboarding
 */
export async function getOnboardingStatus(campaignId: string): Promise<OnboardingStatus> {
  const response = await api.get(`${BASE_URL(campaignId)}/status`)
  return response.data.data
}

/**
 * Salva dados do Step 1 - Identidade Politica
 */
export async function saveStep1(campaignId: string, data: Step1Data): Promise<{ step: number; tseMatchAvailable: boolean }> {
  const response = await api.post(`${BASE_URL(campaignId)}/step/1`, data)
  return response.data.data
}

/**
 * Salva dados do Step 2 - Historico Eleitoral
 */
export async function saveStep2(campaignId: string, data: Step2Data): Promise<{ step: number }> {
  const response = await api.post(`${BASE_URL(campaignId)}/step/2`, data)
  return response.data.data
}

/**
 * Busca match do TSE pelo CPF
 */
export async function getTseMatch(campaignId: string): Promise<TseMatchResponse> {
  const response = await api.get(`${BASE_URL(campaignId)}/step/2/tse-match`)
  return response.data.data
}

/**
 * Salva dados do Step 3 - Perfil e Bandeiras
 */
export async function saveStep3(campaignId: string, data: Step3Data): Promise<{ step: number }> {
  const response = await api.post(`${BASE_URL(campaignId)}/step/3`, data)
  return response.data.data
}

/**
 * Salva dados do Step 4 - Rede e Territorio
 */
export async function saveStep4(campaignId: string, data: Step4Data): Promise<{ step: number }> {
  const response = await api.post(`${BASE_URL(campaignId)}/step/4`, data)
  return response.data.data
}

/**
 * Salva dados do Step 5 - Recursos
 */
export async function saveStep5(campaignId: string, data: Step5Data): Promise<{ step: number }> {
  const response = await api.post(`${BASE_URL(campaignId)}/step/5`, data)
  return response.data.data
}

/**
 * Busca adversarios sugeridos
 */
export async function getSuggestedAdversarios(campaignId: string): Promise<SuggestedAdversario[]> {
  const response = await api.get(`${BASE_URL(campaignId)}/step/6/suggested`)
  return response.data.data
}

/**
 * Salva dados do Step 6 - Adversarios
 */
export async function saveStep6(campaignId: string, data: Step6Data): Promise<{ step: number }> {
  const response = await api.post(`${BASE_URL(campaignId)}/step/6`, data)
  return response.data.data
}

/**
 * Salva dados do Step 7 - Objetivos (e dispara job de enriquecimento)
 */
export async function saveStep7(campaignId: string, data: Step7Data): Promise<{ step: number; enrichmentJobId: string }> {
  const response = await api.post(`${BASE_URL(campaignId)}/step/7`, data)
  return response.data.data
}

/**
 * Busca status de conclusao do onboarding
 */
export async function getCompleteStatus(campaignId: string): Promise<{ job: EnrichmentJob | null; readyForDiagnostic: boolean }> {
  const response = await api.get(`${BASE_URL(campaignId)}/complete`)
  return response.data.data
}

// ============================================
// AI Endpoints
// ============================================

/**
 * Sugere bandeiras de campanha usando IA
 */
export async function aiSuggestBandeiras(
  campaignId: string,
  context: {
    profissao?: string
    idade?: number
    cidadeBase?: string
    historico?: string
  }
): Promise<AIBandeirasResponse> {
  const response = await api.post(`${BASE_URL(campaignId)}/ai/suggest-bandeiras`, context)
  return response.data.data
}

/**
 * Refina historia usando IA
 */
export async function aiRefineHistoria(
  campaignId: string,
  data: {
    textoOriginal: string
    bandeiras?: string[]
  }
): Promise<AIRefinedHistoria> {
  const response = await api.post(`${BASE_URL(campaignId)}/ai/refine-historia`, data)
  return response.data.data
}

/**
 * Gera contexto sobre adversarios usando IA
 */
export async function aiAdversariosContext(
  campaignId: string,
  adversarios: Array<{ nome: string; partido: string; votos2022?: number }>
): Promise<{ analise: string; adversarios: Array<{ nome: string; pontos_fortes: string[]; vulnerabilidades: string[]; diferencial_competitivo: string }> }> {
  const response = await api.post(`${BASE_URL(campaignId)}/ai/adversarios-context`, { adversarios })
  return response.data.data
}

/**
 * Sugere meta de votos usando IA
 */
export async function aiSuggestMetaVotos(campaignId: string): Promise<AIMetaVotosResponse> {
  const response = await api.post(`${BASE_URL(campaignId)}/ai/suggest-meta-votos`, {})
  return response.data.data
}
