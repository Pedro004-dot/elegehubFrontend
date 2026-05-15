export type ChannelId =
  | 'midia-local'
  | 'porta-a-porta'
  | 'eventos'
  | 'midia-digital'
  | 'caravana'

export type OpponentId = 'esquerda' | 'direita' | 'centro'

export type BudgetRange = 'low' | 'medium' | 'high'
export type FocusRange = 'capital' | 'balanced' | 'interior'
export type ChannelProfile = 'traditional' | 'digital' | 'mixed'

export interface SimulatorState {
  budget: number
  focusCapital: number
  activeChannels: ChannelId[]
  selectedOpponent: OpponentId
}

export interface Channel {
  id: ChannelId
  label: string
  description: string
  defaultActive: boolean
}

export interface Opponent {
  id: OpponentId
  name: string
  party: string
  partyAcronym: string
}

export interface ScenarioOutput {
  projectedVotes: number
  electionProbability: number
  municipalityModifiers: Record<string, number>
}

export interface PreCalculatedScenario {
  id: string
  inputs: {
    budgetRange: BudgetRange
    focusRange: FocusRange
    channelProfile: ChannelProfile
    opponent: OpponentId
  }
  output: ScenarioOutput
}

export interface SavedScenario {
  id: string
  name: string
  emoji: string
  state: SimulatorState
  projectedVotes: number
}

export interface SimulatorComparison {
  votesDiff: number
  votesDiffPercent: number
  probabilityDiff: number
}

export const BUDGET_CONFIG = {
  min: 50000,
  max: 500000,
  step: 10000,
  default: 220000,
  format: (v: number) => {
    if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`
    return `R$ ${(v / 1000).toFixed(0)}k`
  },
}

export const FOCUS_CONFIG = {
  min: 0,
  max: 100,
  default: 40,
  formatCapital: (v: number) => `${v}%`,
  formatInterior: (v: number) => `${100 - v}%`,
}

export function getBudgetRange(budget: number): BudgetRange {
  if (budget <= 150000) return 'low'
  if (budget <= 300000) return 'medium'
  return 'high'
}

export function getFocusRange(focusCapital: number): FocusRange {
  if (focusCapital <= 33) return 'interior'
  if (focusCapital <= 66) return 'balanced'
  return 'capital'
}

export function getChannelProfile(channels: ChannelId[]): ChannelProfile {
  const hasTraditional =
    channels.includes('midia-local') ||
    channels.includes('porta-a-porta') ||
    channels.includes('eventos')
  const hasDigital =
    channels.includes('midia-digital') || channels.includes('caravana')

  if (hasTraditional && hasDigital) return 'mixed'
  if (hasDigital) return 'digital'
  return 'traditional'
}
