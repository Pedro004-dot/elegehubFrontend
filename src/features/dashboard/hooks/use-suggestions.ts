import { useMemo } from 'react'
import type { SuggestedAction } from '../types'

// Import data from other features
import { MOCK_COMPETITORS } from '@/features/analysis/data/mock-competitors'
import { ALL_MOCK_MUNICIPALITIES } from '@/features/strategic-map/data/mock-municipalities'

export function useSuggestions(): SuggestedAction[] {
  return useMemo(() => {
    const suggestions: SuggestedAction[] = []

    // Suggestion 1: Region with high potential
    const conquistarByRegion = ALL_MOCK_MUNICIPALITIES
      .filter((m) => m.classification === 'conquistar')
      .reduce<Record<string, { count: number; votes: number }>>((acc, m) => {
        const existing = acc[m.region] ?? { count: 0, votes: 0 }
        acc[m.region] = {
          count: existing.count + 1,
          votes: existing.votes + m.potentialVotes,
        }
        return acc
      }, {})

    const sortedRegions = Object.entries(conquistarByRegion).sort(
      (a, b) => b[1].votes - a[1].votes
    )
    const topRegion = sortedRegions[0]

    if (topRegion && topRegion[1]) {
      suggestions.push({
        id: 'region-opportunity',
        icon: '🎯',
        title: `Aumente presença no ${topRegion[0]}`,
        description: `${topRegion[1].count} municípios "conquistar" com alto potencial de conversão`,
        metric: `${(topRegion[1].votes / 1000).toFixed(0)}k votos potenciais`,
        actionPath: '/mapa/plano-acao',
      })
    }

    // Suggestion 2: Competitor opportunity
    const primaryThreat = MOCK_COMPETITORS.find((c) => c.threatLevel === 'ALTA')
    if (primaryThreat && primaryThreat.opportunities.length > 0) {
      const opportunity = primaryThreat.opportunities[0]
      if (opportunity) {
        suggestions.push({
          id: 'competitor-opportunity',
          icon: '📹',
          title: `Explore fraqueza de ${primaryThreat.name}`,
          description: opportunity.description,
          actionPath: '/campanha/cortes',
        })
      }
    }

    // Suggestion 3: Simulator scenario test
    suggestions.push({
      id: 'simulator-test',
      icon: '💰',
      title: 'Teste cenário com mais mídia digital',
      description:
        'Simulador projeta aumento de probabilidade com canais digitais',
      metric: '+12% probabilidade estimada',
      actionPath: '/campanha/simulador',
    })

    return suggestions.slice(0, 3)
  }, [])
}
