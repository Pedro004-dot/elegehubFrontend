import { api } from '@/services/api'
import type { Municipality } from '../types'

interface ApiMunicipality {
  codigoIbge: number
  nome: string
  latitude: number | null
  longitude: number | null
  capital: boolean
  codigoUf: number
  uf: string
  ddd: number
}

interface ApiResponse {
  success: boolean
  data: ApiMunicipality[]
  meta: { total: number }
}

export async function fetchMunicipalitiesByState(
  uf: string
): Promise<Municipality[]> {
  const { data } = await api.get<ApiResponse>(`/municipalities/state/${uf}`)

  return data.data.map((m) => ({
    id: String(m.codigoIbge),
    ibgeCode: String(m.codigoIbge),
    name: m.nome,
    state: m.uf,
    region: 'Central', // Placeholder until we have real region data
    population: 0, // Placeholder until we have population data
    classification: 'disputar' as const,
    score: 50,
    potentialVotes: 0,
    factors: [],
    historicalData: [],
  }))
}
