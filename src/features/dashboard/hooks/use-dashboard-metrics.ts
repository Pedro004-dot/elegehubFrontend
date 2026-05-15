import { useMemo } from 'react'
import type {
  DashboardMetrics,
  MapSummary,
  ContentHealth,
  CompetitorSummary,
} from '../types'

// Import data from other features
import {
  ALL_MOCK_MUNICIPALITIES,
  calculateKpis,
} from '@/features/strategic-map/data/mock-municipalities'
import { MOCK_COMPETITORS } from '@/features/analysis/data/mock-competitors'
import {
  MOCK_VIDEO_CUTS,
  calculateKpis as calculateVideoKpis,
} from '@/features/campaign/data/mock-video-cuts'
import {
  useScenarioInterpolation,
  useBaseScenario,
} from '@/features/campaign/hooks/use-scenario-interpolation'
import type { SimulatorState } from '@/features/campaign/types'

// Default simulator state for dashboard
const DEFAULT_SIMULATOR_STATE: SimulatorState = {
  budget: 220000,
  focusCapital: 40,
  activeChannels: ['midia-local', 'porta-a-porta', 'eventos'],
  selectedOpponent: 'esquerda',
}

export function useDashboardMetrics(): DashboardMetrics {
  const currentOutput = useScenarioInterpolation(DEFAULT_SIMULATOR_STATE)
  const baseOutput = useBaseScenario()

  return useMemo(() => {
    const performanceVsBaseline =
      ((currentOutput.projectedVotes / baseOutput.projectedVotes) - 1) * 100

    return {
      projectedVotes: currentOutput.projectedVotes,
      electionProbability: currentOutput.electionProbability,
      performanceVsBaseline: Math.round(performanceVsBaseline),
      voteTrend: 12, // Mock: +12% vs previous period
      probabilityTrend: 8, // Mock: +8pp vs previous period
    }
  }, [currentOutput, baseOutput])
}

export function useMapSummary(): MapSummary {
  return useMemo(() => {
    const kpis = calculateKpis(ALL_MOCK_MUNICIPALITIES)

    const totalPotentialVotes =
      kpis.consolidar.potentialVotes +
      kpis.conquistar.potentialVotes +
      kpis.disputar.potentialVotes

    return {
      classificationCounts: {
        consolidar: kpis.consolidar.count,
        conquistar: kpis.conquistar.count,
        disputar: kpis.disputar.count,
        evitar: kpis.evitar.count,
      },
      totalPotentialVotes,
    }
  }, [])
}

export function useContentHealth(): ContentHealth {
  return useMemo(() => {
    const kpis = calculateVideoKpis(MOCK_VIDEO_CUTS)

    const viralScores = MOCK_VIDEO_CUTS.map((v) => v.viralScore)
    const averageViralScore = Math.round(
      viralScores.reduce((a, b) => a + b, 0) / viralScores.length
    )

    return {
      totalVideos: kpis.totalCuts,
      publishedCount: kpis.publishedCount,
      pendingReviewCount: kpis.reviewCount,
      readyCount: kpis.readyCount,
      averageViralScore,
      viralScoreTrend: 5, // Mock: +5 vs previous period
    }
  }, [])
}

export function useCompetitorSummary(): CompetitorSummary {
  return useMemo(() => {
    // Find highest threat competitor
    const sortedByThreat = [...MOCK_COMPETITORS].sort((a, b) => {
      const threatOrder = { ALTA: 0, MEDIA: 1, BAIXA: 2 }
      return threatOrder[a.threatLevel] - threatOrder[b.threatLevel]
    })

    const primary = sortedByThreat[0]
    const others = sortedByThreat.slice(1, 3) // Get next 2

    if (!primary) {
      return {
        primaryThreat: {
          name: 'Nenhum',
          party: '-',
          threatLevel: 'BAIXA' as const,
          votes2022: 0,
          spending: 0,
          focus: '-',
        },
        otherCompetitors: [],
      }
    }

    return {
      primaryThreat: {
        name: primary.name,
        party: primary.partyAcronym,
        threatLevel: primary.threatLevel,
        votes2022: primary.lastElection.votes,
        spending: primary.lastElection.totalSpending,
        focus: primary.regionalBase,
      },
      otherCompetitors: others.map((c) => ({
        name: c.name,
        party: c.partyAcronym,
      })),
    }
  }, [])
}
