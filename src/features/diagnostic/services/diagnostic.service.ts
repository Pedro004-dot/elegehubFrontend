/**
 * Diagnostic Service
 *
 * API communication layer for diagnostic features.
 */

import { api } from '@/services/api'
import type {
  DiagnosticRun,
  DiagnosticFull,
  DiagnosticStatusResponse,
  DiagnosticSettings,
  ToneProfile,
  StartDiagnosticRequest,
  StartDiagnosticResponse,
  UpdateSettingsRequest,
  ExecutiveSummaryData,
  CandidateProfileData,
  TerritorialData,
  CompetitorsData,
  CompetitorAnalysisData,
  BenchmarkData,
  NarrativeData,
  ActionPlanData,
  DiagnosticSection,
  MunicipalityAnalysisResponse,
  TerritorialMunicipio,
} from '../types'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: { message: string }
}

// =============================================================================
// Diagnostic Generation
// =============================================================================

/**
 * Start a new diagnostic generation
 */
export async function startDiagnostic(
  campaignId: string,
  options?: StartDiagnosticRequest
): Promise<StartDiagnosticResponse> {
  const response = await api.post<ApiResponse<StartDiagnosticResponse>>(
    `/campaigns/${campaignId}/diagnostics`,
    options
  )
  return response.data.data
}

/**
 * Cancel a running diagnostic
 */
export async function cancelDiagnostic(
  campaignId: string,
  runId: string
): Promise<void> {
  await api.post(`/campaigns/${campaignId}/diagnostics/${runId}/cancel`)
}

// =============================================================================
// Diagnostic Retrieval
// =============================================================================

/**
 * Get a specific diagnostic by run ID
 */
export async function getDiagnostic(
  campaignId: string,
  runId: string
): Promise<DiagnosticFull> {
  const response = await api.get<ApiResponse<{
    run: DiagnosticRun
    sections: DiagnosticSection[]
  }>>(
    `/campaigns/${campaignId}/diagnostics/${runId}`
  )

  const { run, sections } = response.data.data

  // Parse sections into typed data
  const parsedSections = parseSections(sections)

  return {
    run,
    sections: parsedSections,
    raw_sections: sections,
  }
}

/**
 * Get the latest completed diagnostic for a campaign
 */
export async function getLatestDiagnostic(
  campaignId: string
): Promise<DiagnosticFull | null> {
  try {
    const response = await api.get<ApiResponse<{
      run: DiagnosticRun
      sections: DiagnosticSection[]
    }>>(
      `/campaigns/${campaignId}/diagnostics/latest`
    )

    const { run, sections } = response.data.data

    // Parse sections into typed data
    const parsedSections = parseSections(sections)

    return {
      run,
      sections: parsedSections,
      raw_sections: sections,
    }
  } catch (error: unknown) {
    // 404 means no diagnostic found
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      if (axiosError.response?.status === 404) {
        return null
      }
    }
    throw error
  }
}

/**
 * List all diagnostics for a campaign
 */
export async function listDiagnostics(
  campaignId: string
): Promise<DiagnosticRun[]> {
  const response = await api.get<ApiResponse<DiagnosticRun[]>>(
    `/campaigns/${campaignId}/diagnostics`
  )
  return response.data.data
}

// =============================================================================
// Status Polling
// =============================================================================

/**
 * Get the current status of a running diagnostic
 */
export async function getDiagnosticStatus(
  campaignId: string,
  runId: string
): Promise<DiagnosticStatusResponse> {
  const response = await api.get<ApiResponse<DiagnosticStatusResponse>>(
    `/campaigns/${campaignId}/diagnostics/${runId}/status`
  )
  return response.data.data
}

// =============================================================================
// PDF
// =============================================================================

/**
 * Get a signed URL for the PDF download
 */
export async function getPdfUrl(
  campaignId: string,
  runId: string
): Promise<string> {
  const response = await api.get<ApiResponse<{ url: string }>>(
    `/campaigns/${campaignId}/diagnostics/${runId}/pdf`
  )
  return response.data.data.url
}

// =============================================================================
// Settings
// =============================================================================

/**
 * Get diagnostic settings for a campaign
 */
export async function getSettings(
  campaignId: string
): Promise<DiagnosticSettings> {
  const response = await api.get<ApiResponse<DiagnosticSettings>>(
    `/campaigns/${campaignId}/diagnostic-settings`
  )
  return response.data.data
}

/**
 * Update diagnostic settings for a campaign
 */
export async function updateSettings(
  campaignId: string,
  settings: UpdateSettingsRequest
): Promise<DiagnosticSettings> {
  const response = await api.put<ApiResponse<DiagnosticSettings>>(
    `/campaigns/${campaignId}/diagnostic-settings`,
    settings
  )
  return response.data.data
}

// =============================================================================
// Tone Profiles
// =============================================================================

/**
 * List all available tone profiles
 */
export async function listToneProfiles(): Promise<ToneProfile[]> {
  const response = await api.get<ApiResponse<ToneProfile[]>>('/tone-profiles')
  return response.data.data
}

// =============================================================================
// Municipality Analysis (Deterministic Algorithm)
// =============================================================================

/**
 * Get full municipality analysis with scores, costs, and ROI
 */
export async function getMunicipalityAnalysis(
  campaignId: string
): Promise<MunicipalityAnalysisResponse> {
  const response = await api.get<MunicipalityAnalysisResponse>(
    `/campaigns/${campaignId}/municipality-analysis`
  )
  return response.data
}

/**
 * Get top municipalities by a specific criterion
 */
export async function getTopMunicipios(
  campaignId: string,
  criterio: 'votos' | 'roi' | 'score' | 'eleitorado' = 'votos',
  limit: number = 50
): Promise<TerritorialMunicipio[]> {
  const response = await api.get<{ success: boolean; data: { municipios: TerritorialMunicipio[] } }>(
    `/campaigns/${campaignId}/municipality-analysis/top`,
    { params: { criterio, limit } }
  )
  return response.data.data.municipios
}

/**
 * Get municipalities filtered by classification
 */
export async function getMunicipiosByClassification(
  campaignId: string,
  classification: 'fiel' | 'pendular' | 'disputavel' | 'hostil'
): Promise<TerritorialMunicipio[]> {
  const response = await api.get<{ success: boolean; data: { municipios: TerritorialMunicipio[] } }>(
    `/campaigns/${campaignId}/municipality-analysis/classification/${classification}`
  )
  return response.data.data.municipios
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Parse raw sections into typed data objects
 */
function parseSections(sections: DiagnosticSection[]): DiagnosticFull['sections'] {
  const result: DiagnosticFull['sections'] = {}

  for (const section of sections) {
    const { section_type, content_json } = section

    switch (section_type) {
      case 'executive_summary':
        result.executive_summary = content_json as ExecutiveSummaryData
        break
      case 'candidate_profile':
        result.candidate_profile = content_json as CandidateProfileData
        break
      case 'territorial':
        result.territorial = content_json as TerritorialData
        break
      case 'competitors':
        // Competitors section may contain multiple competitor analyses or a placeholder
        result.competitors = parseCompetitorsSection(content_json)
        break
      case 'benchmark':
        result.benchmark = content_json as BenchmarkData
        break
      case 'narrative':
        result.narrative = content_json as NarrativeData
        break
      case 'action_plan':
        result.action_plan = content_json as ActionPlanData
        break
    }
  }

  return result
}

/**
 * Parse competitors section which may have different formats
 */
function parseCompetitorsSection(content: unknown): CompetitorsData {
  if (!content || typeof content !== 'object') {
    return { competitors: [], placeholder: true, message: 'Dados nao disponiveis' }
  }

  const obj = content as Record<string, unknown>

  // Check if it's a placeholder
  if (obj.placeholder) {
    return {
      competitors: [],
      placeholder: true,
      message: obj.message as string || 'Sem adversarios cadastrados',
    }
  }

  // Check if it's an array of competitor analyses
  if (Array.isArray(content)) {
    return { competitors: content }
  }

  // Check if it has an adversarios array (new combined format from orchestrator)
  if (Array.isArray(obj.adversarios)) {
    return {
      competitors: obj.adversarios as CompetitorAnalysisData[],
      placeholder: false,
    }
  }

  // Check if it has a competitors array
  if (Array.isArray(obj.competitors)) {
    return {
      competitors: obj.competitors,
      placeholder: obj.placeholder as boolean,
      message: obj.message as string,
    }
  }

  // Single competitor analysis
  return { competitors: [content as CompetitorAnalysisData] }
}

// =============================================================================
// Export all functions
// =============================================================================

export const diagnosticService = {
  startDiagnostic,
  cancelDiagnostic,
  getDiagnostic,
  getLatestDiagnostic,
  listDiagnostics,
  getDiagnosticStatus,
  getPdfUrl,
  getSettings,
  updateSettings,
  listToneProfiles,
  // Municipality Analysis
  getMunicipalityAnalysis,
  getTopMunicipios,
  getMunicipiosByClassification,
}
