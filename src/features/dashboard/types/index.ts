export interface DashboardMetrics {
  projectedVotes: number
  electionProbability: number
  performanceVsBaseline: number
  voteTrend: number // % change vs previous period
  probabilityTrend: number // pp change
}

export type AlertType = 'critical' | 'warning' | 'opportunity'

export interface Alert {
  id: string
  type: AlertType
  title: string
  description: string
  actionLabel: string
  actionPath: string
}

export type ThreatLevel = 'ALTA' | 'MEDIA' | 'BAIXA'

export interface MapSummary {
  classificationCounts: {
    consolidar: number
    conquistar: number
    disputar: number
    evitar: number
  }
  totalPotentialVotes: number
}

export interface ContentHealth {
  totalVideos: number
  publishedCount: number
  pendingReviewCount: number
  readyCount: number
  averageViralScore: number
  viralScoreTrend: number
}

export interface CompetitorSummary {
  primaryThreat: {
    name: string
    party: string
    threatLevel: ThreatLevel
    votes2022: number
    spending: number
    focus: string
  }
  otherCompetitors: { name: string; party: string }[]
}

export interface SuggestedAction {
  id: string
  icon: string
  title: string
  description: string
  metric?: string
  actionPath: string
}

export interface DashboardData {
  metrics: DashboardMetrics
  alerts: Alert[]
  mapSummary: MapSummary
  contentHealth: ContentHealth
  competitorSummary: CompetitorSummary
  suggestedActions: SuggestedAction[]
}
