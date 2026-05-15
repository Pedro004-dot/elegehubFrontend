import { useMemo } from 'react'
import type { SimulatorState, ScenarioOutput } from '../types'
import {
  getBudgetRange,
  getFocusRange,
  getChannelProfile,
} from '../types'
import {
  findClosestScenario,
  interpolateOutputs,
  getChannelBonus,
  BASE_SCENARIO,
} from '../data/scenarios'

export function useScenarioInterpolation(state: SimulatorState): ScenarioOutput {
  return useMemo(() => {
    const budgetRange = getBudgetRange(state.budget)
    const focusRange = getFocusRange(state.focusCapital)
    const channelProfile = getChannelProfile(state.activeChannels)

    // Find closest pre-calculated scenario
    const closestScenario = findClosestScenario(
      budgetRange,
      focusRange,
      state.selectedOpponent
    )

    // Calculate interpolation weight based on budget position within range
    let budgetWeight = 0
    if (budgetRange === 'low') {
      budgetWeight = (state.budget - 50000) / 100000
    } else if (budgetRange === 'medium') {
      budgetWeight = (state.budget - 150000) / 150000
    } else {
      budgetWeight = (state.budget - 300000) / 200000
    }
    budgetWeight = Math.max(0, Math.min(1, budgetWeight))

    // Find adjacent scenario for interpolation
    const nextBudgetRange =
      budgetRange === 'low'
        ? 'medium'
        : budgetRange === 'medium'
          ? 'high'
          : 'high'
    const nextScenario = findClosestScenario(
      nextBudgetRange,
      focusRange,
      state.selectedOpponent
    )

    // Interpolate between scenarios
    let output = interpolateOutputs(
      closestScenario.output,
      nextScenario.output,
      budgetWeight
    )

    // Apply channel profile bonus
    const channelBonus = getChannelBonus(channelProfile)
    output = {
      ...output,
      projectedVotes: Math.round(output.projectedVotes * channelBonus.votes),
      electionProbability: Math.min(
        95,
        Math.round(output.electionProbability * channelBonus.prob)
      ),
    }

    return output
  }, [state])
}

export function useBaseScenario(): ScenarioOutput {
  return useMemo(() => BASE_SCENARIO.output, [])
}

export function useScenarioComparison(
  current: ScenarioOutput,
  base: ScenarioOutput
) {
  return useMemo(
    () => ({
      votesDiff: current.projectedVotes - base.projectedVotes,
      votesDiffPercent:
        ((current.projectedVotes / base.projectedVotes) - 1) * 100,
      probabilityDiff: current.electionProbability - base.electionProbability,
    }),
    [current, base]
  )
}
