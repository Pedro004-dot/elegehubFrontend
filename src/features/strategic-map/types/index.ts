export type MunicipalityClassification = 'consolidar' | 'conquistar' | 'disputar' | 'evitar'

export interface ScoreFactor {
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

export interface HistoricalVote {
  year: number
  votes: number
  candidate: string
}

export interface Municipality {
  id: string
  ibgeCode: string
  name: string
  state: string
  region: string
  population: number
  classification: MunicipalityClassification
  score: number
  potentialVotes: number
  factors: ScoreFactor[]
  historicalData: HistoricalVote[]
}

export interface MapFilters {
  state: string
  regions: string[]
  sizes: string[]
  classifications: MunicipalityClassification[]
  minScore: number
  onlySimilarWinners: boolean
}

export interface KpiData {
  classification: MunicipalityClassification
  label: string
  count: number
  potentialVotes: number
  color: string
  bgColor: string
}

export interface BrazilState {
  uf: string
  ibgeCode: number
  name: string
  capital: string
  region: string
  municipalityCount: number
  centerCoordinates: [number, number]
  zoom: number
}

export const CLASSIFICATION_CONFIG: Record<MunicipalityClassification, {
  label: string
  color: string
  bgColor: string
  description: string
}> = {
  consolidar: {
    label: 'Consolidar',
    color: '#22c55e',
    bgColor: 'bg-green-500',
    description: 'Onde sua base já está forte'
  },
  conquistar: {
    label: 'Conquistar',
    color: '#eab308',
    bgColor: 'bg-yellow-500',
    description: 'Alto potencial, pouca presença'
  },
  disputar: {
    label: 'Disputar',
    color: '#f97316',
    bgColor: 'bg-orange-500',
    description: 'Território disputado'
  },
  evitar: {
    label: 'Evitar',
    color: '#ef4444',
    bgColor: 'bg-red-500',
    description: 'Baixo retorno sobre investimento'
  }
}
