/**
 * DiagnosticSectionPage
 *
 * Container page for viewing individual diagnostic sections.
 * Uses sidebar navigation + content area layout.
 */

import { useParams, Navigate } from 'react-router-dom'
import { useCurrentCampaign } from '@/features/auth/hooks/useCurrentCampaign'
import { useDiagnostic } from '../hooks'
import { DiagnosticNavSidebar } from '../components/shared/diagnostic-nav-sidebar'
import { ExecutiveSummarySection } from '../components/sections/executive-summary-section'
import { CandidateProfileSection } from '../components/sections/candidate-profile-section'
import { TerritorialSection } from '../components/sections/territorial-section'
import { CompetitorsSection } from '../components/sections/competitors-section'
import { BenchmarkSection } from '../components/sections/benchmark-section'
import { NarrativeSection } from '../components/sections/narrative-section'
import { ActionPlanSection } from '../components/sections/action-plan-section'
import { EmptyState } from '@/components/elegehub'
import { FileText } from 'lucide-react'
import type { SectionType } from '../types'

export function DiagnosticSectionPage() {
  const { sectionType } = useParams<{ sectionType: SectionType }>()
  const campaign = useCurrentCampaign()
  const { diagnostic, loading, error, refetch } = useDiagnostic({
    campaignId: campaign.id,
  })

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body text-ink-secondary">Carregando secao...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Erro ao carregar secao"
        description={error.message}
        action={{ label: 'Tentar novamente', onClick: refetch }}
      />
    )
  }

  // No diagnostic
  if (!diagnostic) {
    return <Navigate to="/diagnostico" replace />
  }

  // Invalid section type
  if (!sectionType || !isValidSectionType(sectionType)) {
    return <Navigate to="/diagnostico" replace />
  }

  // Section not available
  const sectionData = diagnostic.sections[sectionType]
  if (!sectionData) {
    return <Navigate to="/diagnostico" replace />
  }

  // Get available sections for sidebar
  const availableSections = (Object.keys(diagnostic.sections) as SectionType[]).filter(
    (type) => diagnostic.sections[type] !== undefined
  )

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <div className="flex gap-12">
        <DiagnosticNavSidebar availableSections={availableSections} />

        <main className="flex-1 min-w-0">
          {renderSection(sectionType, diagnostic.sections, campaign.state, campaign.id)}
        </main>
      </div>
    </div>
  )
}

function isValidSectionType(type: string): type is SectionType {
  const validTypes: SectionType[] = [
    'executive_summary',
    'candidate_profile',
    'territorial',
    'competitors',
    'benchmark',
    'narrative',
    'action_plan',
  ]
  return validTypes.includes(type as SectionType)
}

function renderSection(
  type: SectionType,
  sections: Record<string, unknown>,
  uf: string,
  campaignId: string
) {
  switch (type) {
    case 'executive_summary':
      return <ExecutiveSummarySection data={sections.executive_summary} />
    case 'candidate_profile':
      return <CandidateProfileSection data={sections.candidate_profile} />
    case 'territorial':
      return <TerritorialSection data={sections.territorial} uf={uf} campaignId={campaignId} />
    case 'competitors':
      return <CompetitorsSection data={sections.competitors} />
    case 'benchmark':
      return <BenchmarkSection data={sections.benchmark} />
    case 'narrative':
      return <NarrativeSection data={sections.narrative} />
    case 'action_plan':
      return <ActionPlanSection data={sections.action_plan} />
    default:
      return null
  }
}
