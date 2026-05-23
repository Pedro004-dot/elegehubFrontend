/**
 * @deprecated Este modulo sera removido na v2.
 * O Dashboard usa dados mockados e foi removido do menu.
 * Usar dados reais da API quando disponivel.
 */

import { DashboardHeader } from '../components/dashboard-header'
import { HeroMetrics } from '../components/hero-metrics'
import { AlertsPanel } from '../components/alerts-panel'
import { CompactMap } from '../components/compact-map'
import { ContentHealth } from '../components/content-health'
import { CompetitorSpotlight } from '../components/competitor-spotlight'
import { SuggestedActions } from '../components/suggested-actions'

import {
  useDashboardMetrics,
  useMapSummary,
  useContentHealth,
  useCompetitorSummary,
} from '../hooks/use-dashboard-metrics'
import { useAlerts } from '../hooks/use-alerts'
import { useSuggestions } from '../hooks/use-suggestions'

export function DashboardPage() {
  const metrics = useDashboardMetrics()
  const mapSummary = useMapSummary()
  const contentHealth = useContentHealth()
  const competitorSummary = useCompetitorSummary()
  const alerts = useAlerts()
  const suggestions = useSuggestions()

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <DashboardHeader candidateName="João" state="MG" />

      {/* Hero Metrics */}
      <HeroMetrics metrics={metrics} />

      {/* Middle Row: Alerts + Map */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AlertsPanel alerts={alerts} />
        <CompactMap summary={mapSummary} />
      </div>

      {/* Content + Competitors Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ContentHealth health={contentHealth} />
        <CompetitorSpotlight summary={competitorSummary} />
      </div>

      {/* Suggested Actions */}
      <SuggestedActions actions={suggestions} />
    </div>
  )
}
