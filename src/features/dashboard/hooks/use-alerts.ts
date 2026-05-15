import { useMemo } from 'react'
import type { Alert } from '../types'

// Import data from other features
import { MOCK_COMPETITORS } from '@/features/analysis/data/mock-competitors'
import { MOCK_VIDEO_CUTS } from '@/features/campaign/data/mock-video-cuts'
import {
  ALL_MOCK_MUNICIPALITIES,
} from '@/features/strategic-map/data/mock-municipalities'

export function useAlerts(): Alert[] {
  return useMemo(() => {
    const alerts: Alert[] = []

    // Check for high threat competitors
    const highThreatCount = MOCK_COMPETITORS.filter(
      (c) => c.threatLevel === 'ALTA'
    ).length
    if (highThreatCount > 0) {
      alerts.push({
        id: 'competitors-high-threat',
        type: 'critical',
        title: `${highThreatCount} adversário${highThreatCount > 1 ? 's' : ''} com ameaça alta`,
        description: 'Monitore as movimentações e ajuste sua estratégia',
        actionLabel: 'Ver análise',
        actionPath: '/analise/radar-adversarios',
      })
    }

    // Check for videos pending review
    const pendingReviewCount = MOCK_VIDEO_CUTS.filter(
      (v) => v.status === 'review'
    ).length
    if (pendingReviewCount > 0) {
      alerts.push({
        id: 'videos-pending-review',
        type: 'warning',
        title: `${pendingReviewCount} vídeo${pendingReviewCount > 1 ? 's' : ''} aguardando revisão`,
        description: 'Conteúdo pronto para aprovação e publicação',
        actionLabel: 'Revisar',
        actionPath: '/campanha/cortes',
      })
    }

    // Check for high potential regions not fully explored
    const conquistarCount = ALL_MOCK_MUNICIPALITIES.filter(
      (m) => m.classification === 'conquistar'
    ).length
    const conquistarVotes = ALL_MOCK_MUNICIPALITIES
      .filter((m) => m.classification === 'conquistar')
      .reduce((sum, m) => sum + m.potentialVotes, 0)

    if (conquistarCount > 30) {
      alerts.push({
        id: 'regions-opportunity',
        type: 'opportunity',
        title: `${conquistarCount} municípios com potencial alto`,
        description: `${(conquistarVotes / 1000).toFixed(0)}k votos potenciais para conquistar`,
        actionLabel: 'Explorar',
        actionPath: '/mapa/plano-acao',
      })
    }

    // Sort by type priority and return max 3
    const typeOrder: Record<Alert['type'], number> = {
      critical: 0,
      warning: 1,
      opportunity: 2,
    }

    return alerts
      .sort((a, b) => typeOrder[a.type] - typeOrder[b.type])
      .slice(0, 3)
  }, [])
}
