import { api } from '@/services/api'
import type { Municipality, MunicipalityClassification } from '../types'

// ============================================
// API Response Types
// ============================================

export interface CandidatoResumo {
  id: number
  nome: string
  nome_urna: string
  sq_candidato: string
  cargo: string
  numero_candidato: number
  resultado: string | null
  genero: string | null
  ano_eleicao: number
  partido_sigla: string | null
  partido_nome: string | null
  espectro: string | null
  total_votos: number
  municipios_com_votos: number
  total_gastos: number
  custo_por_voto: number | null
}

/**
 * Gera URL da foto do candidato no TSE
 */
export function getCandidatoFotoUrl(sqCandidato: string): string {
  return `https://divulgacandcontas.tse.jus.br/candidaturas/oficial/2022/BR/MG/${sqCandidato}/foto.jpg`
}

export interface CandidatoVotosMunicipio {
  candidato_id: number
  municipio_id: number
  votos: number
  turno: number
  ano_eleicao: number
  municipio_nome: string
  codigo_ibge: string
  latitude: number | null
  longitude: number | null
  populacao: number | null
  regiao_nome: string | null
  votos_por_mil_hab: number | null
}

export interface MunicipioRanking {
  municipio_id: number
  municipio_nome: string
  codigo_ibge: string
  candidato_id: number
  nome_urna: string
  cargo: string
  partido: string | null
  votos: number
  ano_eleicao: number
  turno: number
  posicao: number
}

export interface MapaMunicipioMG {
  id: number
  codigo_ibge: string
  nome: string
  latitude: number | null
  longitude: number | null
  populacao: number | null
  regiao: string | null
  cargo: string | null
  total_votos_validos: number
  total_candidatos: number
  vencedor_votos: number | null
  vencedor_nome: string | null
  vencedor_partido: string | null
  vencedor_espectro: string | null
}

export interface GastoCategoria {
  candidato_id: number
  nome_urna: string
  cargo: string
  partido: string | null
  categoria: string
  total: number
  percentual: number | null
}

export interface FiltersData {
  partidos: string[]
  cargos: string[]
  regioes: string[]
}

interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: { total: number }
}

// ============================================
// API Functions
// ============================================

export async function fetchFilters(): Promise<FiltersData> {
  const { data } = await api.get<ApiResponse<FiltersData>>('/analytics/filters')
  return data.data
}

export async function fetchCandidatos(params?: {
  cargo?: string
  partido?: string
  limit?: number
  offset?: number
}): Promise<CandidatoResumo[]> {
  const { data } = await api.get<ApiResponse<CandidatoResumo[]>>('/analytics/candidatos', { params })
  return data.data
}

export async function fetchCandidato(id: number): Promise<CandidatoResumo> {
  const { data } = await api.get<ApiResponse<CandidatoResumo>>(`/analytics/candidatos/${id}`)
  return data.data
}

export async function fetchCandidatoVotos(candidatoId: number): Promise<CandidatoVotosMunicipio[]> {
  const { data } = await api.get<ApiResponse<CandidatoVotosMunicipio[]>>(`/analytics/candidatos/${candidatoId}/votos`)
  return data.data
}

export async function fetchCandidatoGastos(candidatoId: number): Promise<GastoCategoria[]> {
  const { data } = await api.get<ApiResponse<GastoCategoria[]>>(`/analytics/candidatos/${candidatoId}/gastos`)
  return data.data
}

/**
 * Busca municipios de um estado com dados eleitorais
 * @param uf - Sigla do estado (ex: MG, SP, RJ)
 * @param cargo - Cargo politico (DEPUTADO ESTADUAL, etc)
 * @param ano - Ano da eleicao (default: 2022)
 * @param regiao - Filtro opcional por regiao
 */
export async function fetchMunicipios(params?: {
  uf?: string
  cargo?: string
  ano?: number
  regiao?: string
}): Promise<MapaMunicipioMG[]> {
  const { data } = await api.get<ApiResponse<MapaMunicipioMG[]>>('/analytics/municipios', { params })
  return data.data
}

/**
 * @deprecated Use fetchMunicipios com parametro uf
 */
export async function fetchMunicipiosMG(params?: {
  cargo?: string
  regiao?: string
}): Promise<MapaMunicipioMG[]> {
  return fetchMunicipios({ ...params, uf: 'MG' })
}

export async function fetchMunicipioRanking(
  municipioId: number,
  cargo?: string
): Promise<MunicipioRanking[]> {
  const params = cargo ? { cargo } : undefined
  const { data } = await api.get<ApiResponse<MunicipioRanking[]>>(
    `/analytics/municipios/${municipioId}/ranking`,
    { params }
  )
  return data.data
}

// ============================================
// Transform Functions
// ============================================

/**
 * Classifica um municipio baseado na posicao do candidato selecionado
 */
export function classifyMunicipality(
  votos: number,
  posicao: number,
  totalVotos: number
): MunicipalityClassification {
  if (totalVotos === 0) return 'evitar'

  const percentual = (votos / totalVotos) * 100

  if (posicao === 1 && percentual > 30) return 'consolidar' // Lider com margem
  if (posicao <= 3 && percentual > 15) return 'disputar' // Competitivo
  if (posicao <= 5 && percentual > 5) return 'conquistar' // Potencial
  return 'evitar' // Baixo retorno
}

/**
 * Calcula o score de um municipio para um candidato
 */
export function calculateMunicipalityScore(
  votos: number,
  posicao: number,
  totalVotos: number,
  populacao: number
): number {
  if (totalVotos === 0 || populacao === 0) return 0

  const percentualVotos = (votos / totalVotos) * 100
  const posicaoScore = Math.max(0, 100 - (posicao - 1) * 20) // 1st=100, 2nd=80, 3rd=60...
  const penetracaoScore = Math.min(100, (votos / populacao) * 1000 * 10) // votos por mil hab normalizado

  // Ponderacao: 40% posicao, 40% percentual, 20% penetracao
  return Math.round(posicaoScore * 0.4 + percentualVotos * 0.4 + penetracaoScore * 0.2)
}

type Espectro = 'esquerda' | 'centro-esquerda' | 'centro' | 'centro-direita' | 'direita'

/**
 * Verifica se dois espectros sao adjacentes
 */
function isEspectroAdjacente(a: string | null, b: string | null): boolean {
  if (!a || !b) return false

  const ordem: Espectro[] = ['esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita']
  const indexA = ordem.indexOf(a as Espectro)
  const indexB = ordem.indexOf(b as Espectro)

  if (indexA === -1 || indexB === -1) return false

  return Math.abs(indexA - indexB) === 1
}

/**
 * Verifica se dois espectros sao opostos (esquerda vs direita)
 */
function isEspectroOposto(a: string | null, b: string | null): boolean {
  if (!a || !b) return false

  const esquerda = ['esquerda', 'centro-esquerda']
  const direita = ['direita', 'centro-direita']

  return (esquerda.includes(a) && direita.includes(b)) ||
         (direita.includes(a) && esquerda.includes(b))
}

/**
 * Classifica um municipio baseado na compatibilidade politica
 * entre o candidato selecionado e o vencedor local
 */
export function classificarPorCompatibilidade(
  candidatoEspectro: string | null,
  candidatoPartido: string | null,
  vencedorEspectro: string | null,
  vencedorPartido: string | null,
  dominancia: number // % votos do vencedor
): MunicipalityClassification {
  // Mesmo partido = territorio amigo
  if (candidatoPartido && candidatoPartido === vencedorPartido) {
    return dominancia > 30 ? 'consolidar' : 'conquistar'
  }

  // Mesmo espectro = oportunidade
  if (candidatoEspectro && candidatoEspectro === vencedorEspectro) {
    return dominancia > 40 ? 'disputar' : 'conquistar'
  }

  // Espectro adjacente (ex: esquerda-centro ou centro-direita)
  if (isEspectroAdjacente(candidatoEspectro, vencedorEspectro)) {
    return dominancia > 35 ? 'disputar' : 'conquistar'
  }

  // Espectro oposto (esquerda vs direita)
  if (isEspectroOposto(candidatoEspectro, vencedorEspectro)) {
    return dominancia > 25 ? 'evitar' : 'disputar'
  }

  // Fallback: sem dados suficientes
  return 'disputar'
}

/**
 * Calcula score baseado na compatibilidade politica
 */
export function calculateCompatibilityScore(
  candidatoEspectro: string | null,
  candidatoPartido: string | null,
  vencedorEspectro: string | null,
  vencedorPartido: string | null,
  dominancia: number,
  populacao: number
): number {
  let baseScore = 50

  // Mesmo partido = +30
  if (candidatoPartido && candidatoPartido === vencedorPartido) {
    baseScore += 30
  }
  // Mesmo espectro = +20
  else if (candidatoEspectro && candidatoEspectro === vencedorEspectro) {
    baseScore += 20
  }
  // Espectro adjacente = +10
  else if (isEspectroAdjacente(candidatoEspectro, vencedorEspectro)) {
    baseScore += 10
  }
  // Espectro oposto = -20
  else if (isEspectroOposto(candidatoEspectro, vencedorEspectro)) {
    baseScore -= 20
  }

  // Ajuste pela dominancia do vencedor
  // Quanto mais dominante, mais dificil conquistar se for oposicao
  if (candidatoPartido !== vencedorPartido) {
    baseScore -= Math.round(dominancia / 5)
  }

  // Bonus por populacao (municipios maiores = mais votos potenciais)
  if (populacao > 100000) baseScore += 5
  else if (populacao > 50000) baseScore += 3
  else if (populacao > 20000) baseScore += 1

  return Math.max(0, Math.min(100, baseScore))
}

/**
 * Transforma dados da API em formato do mapa
 * Quando candidatoSelecionado eh passado, usa classificacao por compatibilidade politica
 * @param municipio - Dados do municipio da API
 * @param candidatoSelecionado - Candidato selecionado para classificacao
 * @param uf - Sigla do estado (default: MG para compatibilidade)
 */
export function transformMunicipioToMapFormat(
  municipio: MapaMunicipioMG,
  candidatoSelecionado?: CandidatoResumo | null,
  uf: string = 'MG'
): Municipality {
  let classification: MunicipalityClassification = 'disputar'
  let score = 50
  let potentialVotes = 0

  const dominancia = municipio.vencedor_votos && municipio.total_votos_validos
    ? (municipio.vencedor_votos / municipio.total_votos_validos) * 100
    : 0

  if (candidatoSelecionado) {
    // Classificacao baseada na compatibilidade politica
    classification = classificarPorCompatibilidade(
      candidatoSelecionado.espectro,
      candidatoSelecionado.partido_sigla,
      municipio.vencedor_espectro,
      municipio.vencedor_partido,
      dominancia
    )
    score = calculateCompatibilityScore(
      candidatoSelecionado.espectro,
      candidatoSelecionado.partido_sigla,
      municipio.vencedor_espectro,
      municipio.vencedor_partido,
      dominancia,
      municipio.populacao || 0
    )
    // Votos potenciais baseado no score
    const baseVotos = municipio.vencedor_votos || 0
    potentialVotes = Math.round(baseVotos * (score / 100))
  } else if (municipio.vencedor_votos && municipio.total_votos_validos) {
    // Sem candidato selecionado, classifica baseado na dominancia do vencedor
    potentialVotes = municipio.vencedor_votos

    // Classificacao baseada na forca do vencedor local
    if (dominancia > 40) {
      classification = 'consolidar'
      score = 70 + Math.round(dominancia / 3)
    } else if (dominancia > 25) {
      classification = 'conquistar'
      score = 50 + Math.round(dominancia)
    } else if (dominancia > 15) {
      classification = 'disputar'
      score = 30 + Math.round(dominancia * 1.5)
    } else {
      classification = 'evitar'
      score = 10 + Math.round(dominancia * 2)
    }
  }

  return {
    id: String(municipio.id),
    ibgeCode: municipio.codigo_ibge,
    name: municipio.nome,
    state: uf,
    region: municipio.regiao || 'Sem regiao',
    population: municipio.populacao || 0,
    classification,
    score,
    potentialVotes,
    factors: [], // Sera preenchido depois
    historicalData: [], // Sera preenchido depois
  }
}

/**
 * Transforma lista de municipios para o formato do mapa
 * Se candidatoSelecionado for passado, usa classificacao por compatibilidade politica
 * @param municipios - Lista de municipios da API
 * @param candidatoSelecionado - Candidato selecionado para classificacao
 * @param uf - Sigla do estado (default: MG para compatibilidade)
 */
export function transformMunicipiosForMap(
  municipios: MapaMunicipioMG[],
  candidatoSelecionado?: CandidatoResumo | null,
  uf: string = 'MG'
): Municipality[] {
  return municipios.map((m) => transformMunicipioToMapFormat(m, candidatoSelecionado, uf))
}
