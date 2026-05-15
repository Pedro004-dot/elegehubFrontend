import type { PreCalculatedScenario, BudgetRange, FocusRange, ChannelProfile, OpponentId } from '../types'

// Base scenario for comparison
export const BASE_SCENARIO: PreCalculatedScenario = {
  id: 'base',
  inputs: {
    budgetRange: 'low',
    focusRange: 'balanced',
    channelProfile: 'traditional',
    opponent: 'esquerda',
  },
  output: {
    projectedVotes: 100000,
    electionProbability: 26,
    municipalityModifiers: {},
  },
}

// Generate all 18 pre-calculated scenarios
function generateScenarios(): PreCalculatedScenario[] {
  const budgetRanges: BudgetRange[] = ['low', 'medium', 'high']
  const focusRanges: FocusRange[] = ['capital', 'balanced', 'interior']
  const opponents: OpponentId[] = ['esquerda', 'direita', 'centro']

  const scenarios: PreCalculatedScenario[] = []

  // Base votes and probability multipliers
  const budgetMultipliers: Record<BudgetRange, { votes: number; prob: number }> = {
    low: { votes: 1.0, prob: 1.0 },
    medium: { votes: 1.35, prob: 1.4 },
    high: { votes: 1.7, prob: 1.8 },
  }

  const focusMultipliers: Record<FocusRange, { votes: number; prob: number }> = {
    capital: { votes: 0.9, prob: 0.95 },
    balanced: { votes: 1.0, prob: 1.0 },
    interior: { votes: 1.15, prob: 1.1 },
  }

  const opponentMultipliers: Record<OpponentId, { votes: number; prob: number }> = {
    esquerda: { votes: 1.0, prob: 1.0 },
    direita: { votes: 1.05, prob: 1.02 },
    centro: { votes: 0.95, prob: 0.98 },
  }

  // Generate municipality modifiers based on focus
  const generateModifiers = (focus: FocusRange): Record<string, number> => {
    const modifiers: Record<string, number> = {}

    // Capital region codes (simplified - BH and surroundings)
    const capitalCodes = ['3106200', '3118601', '3106705', '3144805']
    // Interior region codes (simplified - major interior cities)
    const interiorCodes = ['3170206', '3170107', '3136702', '3143302']

    if (focus === 'capital') {
      capitalCodes.forEach(code => { modifiers[code] = 1.3 })
      interiorCodes.forEach(code => { modifiers[code] = 0.7 })
    } else if (focus === 'interior') {
      capitalCodes.forEach(code => { modifiers[code] = 0.7 })
      interiorCodes.forEach(code => { modifiers[code] = 1.4 })
    } else {
      capitalCodes.forEach(code => { modifiers[code] = 1.0 })
      interiorCodes.forEach(code => { modifiers[code] = 1.0 })
    }

    return modifiers
  }

  const baseVotes = 100000
  const baseProbability = 26

  budgetRanges.forEach(budget => {
    focusRanges.forEach(focus => {
      opponents.forEach(opponent => {
        const bm = budgetMultipliers[budget]
        const fm = focusMultipliers[focus]
        const om = opponentMultipliers[opponent]

        const votes = Math.round(baseVotes * bm.votes * fm.votes * om.votes)
        const probability = Math.min(
          95,
          Math.round(baseProbability * bm.prob * fm.prob * om.prob)
        )

        scenarios.push({
          id: `${budget}-${focus}-${opponent}`,
          inputs: {
            budgetRange: budget,
            focusRange: focus,
            channelProfile: 'traditional', // Default, will be refined by interpolation
            opponent,
          },
          output: {
            projectedVotes: votes,
            electionProbability: probability,
            municipalityModifiers: generateModifiers(focus),
          },
        })
      })
    })
  })

  return scenarios
}

export const PRECALCULATED_SCENARIOS = generateScenarios()

// Find the closest scenario based on current state
export function findClosestScenario(
  budgetRange: BudgetRange,
  focusRange: FocusRange,
  opponent: OpponentId
): PreCalculatedScenario {
  const found = PRECALCULATED_SCENARIOS.find(
    s =>
      s.inputs.budgetRange === budgetRange &&
      s.inputs.focusRange === focusRange &&
      s.inputs.opponent === opponent
  )
  return found || BASE_SCENARIO
}

// Interpolate between two scenario outputs
export function interpolateOutputs(
  output1: PreCalculatedScenario['output'],
  output2: PreCalculatedScenario['output'],
  weight: number // 0 = output1, 1 = output2
): PreCalculatedScenario['output'] {
  const w1 = 1 - weight
  const w2 = weight

  const votes = Math.round(output1.projectedVotes * w1 + output2.projectedVotes * w2)
  const probability = Math.round(
    output1.electionProbability * w1 + output2.electionProbability * w2
  )

  // Merge modifiers with weighted average
  const allCodes = new Set([
    ...Object.keys(output1.municipalityModifiers),
    ...Object.keys(output2.municipalityModifiers),
  ])

  const modifiers: Record<string, number> = {}
  allCodes.forEach(code => {
    const m1 = output1.municipalityModifiers[code] ?? 1.0
    const m2 = output2.municipalityModifiers[code] ?? 1.0
    modifiers[code] = m1 * w1 + m2 * w2
  })

  return {
    projectedVotes: votes,
    electionProbability: probability,
    municipalityModifiers: modifiers,
  }
}

// Channel profile bonus
export function getChannelBonus(profile: ChannelProfile): { votes: number; prob: number } {
  switch (profile) {
    case 'digital':
      return { votes: 1.05, prob: 1.03 }
    case 'mixed':
      return { votes: 1.12, prob: 1.08 }
    case 'traditional':
    default:
      return { votes: 1.0, prob: 1.0 }
  }
}
