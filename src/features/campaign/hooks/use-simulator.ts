import { useState, useCallback } from 'react'
import type { SimulatorState, ChannelId, OpponentId, SavedScenario } from '../types'
import {
  DEFAULT_SIMULATOR_STATE,
  DEFAULT_SAVED_SCENARIOS,
} from '../data/channels'
import {
  useScenarioInterpolation,
  useBaseScenario,
  useScenarioComparison,
} from './use-scenario-interpolation'

export function useSimulator() {
  const [state, setState] = useState<SimulatorState>(DEFAULT_SIMULATOR_STATE)
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(
    DEFAULT_SAVED_SCENARIOS
  )

  // Computed outputs
  const currentOutput = useScenarioInterpolation(state)
  const baseOutput = useBaseScenario()
  const comparison = useScenarioComparison(currentOutput, baseOutput)

  // State updaters
  const updateBudget = useCallback((budget: number) => {
    setState((s) => ({ ...s, budget }))
  }, [])

  const updateFocus = useCallback((focusCapital: number) => {
    setState((s) => ({ ...s, focusCapital }))
  }, [])

  const toggleChannel = useCallback((channelId: ChannelId) => {
    setState((s) => ({
      ...s,
      activeChannels: s.activeChannels.includes(channelId)
        ? s.activeChannels.filter((c) => c !== channelId)
        : [...s.activeChannels, channelId],
    }))
  }, [])

  const selectOpponent = useCallback((opponentId: OpponentId) => {
    setState((s) => ({ ...s, selectedOpponent: opponentId }))
  }, [])

  // Scenario management
  const loadScenario = useCallback((scenarioId: string) => {
    const scenario = savedScenarios.find((s) => s.id === scenarioId)
    if (scenario) {
      setState(scenario.state)
    }
  }, [savedScenarios])

  const saveCurrentScenario = useCallback(() => {
    const newScenario: SavedScenario = {
      id: `custom-${Date.now()}`,
      name: `Cenario ${savedScenarios.length + 1}`,
      emoji: '💡',
      state: { ...state },
      projectedVotes: currentOutput.projectedVotes,
    }
    setSavedScenarios((s) => [...s, newScenario])
  }, [state, currentOutput.projectedVotes, savedScenarios.length])

  return {
    // State
    state,
    savedScenarios,

    // Outputs
    currentOutput,
    baseOutput,
    comparison,

    // Actions
    updateBudget,
    updateFocus,
    toggleChannel,
    selectOpponent,
    loadScenario,
    saveCurrentScenario,
  }
}
