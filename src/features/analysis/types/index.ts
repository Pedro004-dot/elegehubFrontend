export type ThreatLevel = 'ALTA' | 'MEDIA' | 'BAIXA'

export type PoliticalSpectrum =
  | 'extrema-esquerda'
  | 'esquerda'
  | 'centro-esquerda'
  | 'centro'
  | 'centro-direita'
  | 'direita'
  | 'extrema-direita'

export type SpendingCategory =
  | 'pessoal'
  | 'midia'
  | 'eventos'
  | 'material'
  | 'transporte'
  | 'outros'

export interface LastElectionData {
  year: number
  position: string
  votes: number
  totalSpending: number
  costPerVote: number
  result: 'eleito' | 'nao-eleito' | 'suplente'
  stateRanking: number
}

export interface TerritorialPresence {
  regionName: string
  votes: number
  percentage: number
  coordinates: [number, number]
}

export interface CompetitorAttribute {
  id: string
  title: string
  description: string
}

export interface SpendingHistoryItem {
  category: SpendingCategory
  label: string
  amount: number
  percentage: number
}

export interface SuggestedStrategy {
  id: string
  emoji: string
  title: string
  description: string
}

export interface Competitor {
  id: string
  name: string
  party: string
  partyAcronym: string
  photoUrl: string | null
  age: number
  currentPosition: string | null
  profession: string
  education: string
  regionalBase: string
  politicalSpectrum: PoliticalSpectrum
  threatLevel: ThreatLevel
  lastElection: LastElectionData
  territorialPresence: TerritorialPresence[]
  strengths: CompetitorAttribute[]
  opportunities: CompetitorAttribute[]
  spendingHistory: SpendingHistoryItem[]
  suggestedStrategies: SuggestedStrategy[]
}

export const THREAT_LEVEL_CONFIG: Record<
  ThreatLevel,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  ALTA: {
    label: 'Ameaca Alta',
    color: '#ef4444',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
  },
  MEDIA: {
    label: 'Ameaca Media',
    color: '#f59e0b',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
  },
  BAIXA: {
    label: 'Ameaca Baixa',
    color: '#22c55e',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-500',
  },
}

export const POLITICAL_SPECTRUM_CONFIG: Record<
  PoliticalSpectrum,
  { label: string; position: number }
> = {
  'extrema-esquerda': { label: 'Extrema Esquerda', position: 0 },
  esquerda: { label: 'Esquerda', position: 17 },
  'centro-esquerda': { label: 'Centro-Esquerda', position: 33 },
  centro: { label: 'Centro', position: 50 },
  'centro-direita': { label: 'Centro-Direita', position: 67 },
  direita: { label: 'Direita', position: 83 },
  'extrema-direita': { label: 'Extrema Direita', position: 100 },
}

export const SPENDING_CATEGORY_CONFIG: Record<
  SpendingCategory,
  { label: string; color: string }
> = {
  pessoal: { label: 'Pessoal', color: '#3b82f6' },
  midia: { label: 'Midia', color: '#8b5cf6' },
  eventos: { label: 'Eventos', color: '#10b981' },
  material: { label: 'Material Grafico', color: '#f59e0b' },
  transporte: { label: 'Transporte', color: '#ec4899' },
  outros: { label: 'Outros', color: '#6b7280' },
}

export const ELECTION_RESULT_CONFIG: Record<
  LastElectionData['result'],
  { label: string; bgColor: string; textColor: string }
> = {
  eleito: {
    label: 'Eleito',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-500',
  },
  'nao-eleito': {
    label: 'Nao Eleito',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
  },
  suplente: {
    label: 'Suplente',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
  },
}
