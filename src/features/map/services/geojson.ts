import type { FeatureCollection } from 'geojson'

const IBGE_API = 'https://servicodados.ibge.gov.br/api/v3/malhas/estados'

// Cache TTL: 7 dias (em milissegundos)
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

interface CacheEntry {
  data: FeatureCollection
  timestamp: number
}

/**
 * Gera a chave de cache para um estado
 */
function getCacheKey(ibgeCode: number): string {
  return `elegehub_geojson_${ibgeCode}`
}

/**
 * Tenta carregar GeoJSON do localStorage
 */
function getFromCache(ibgeCode: number): FeatureCollection | null {
  try {
    const key = getCacheKey(ibgeCode)
    const cached = localStorage.getItem(key)

    if (!cached) return null

    const entry: CacheEntry = JSON.parse(cached)
    const now = Date.now()

    // Verificar se expirou
    if (now - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }

    console.log(`[GeoJSON] Cache hit para estado ${ibgeCode}`)
    return entry.data
  } catch {
    return null
  }
}

/**
 * Salva GeoJSON no localStorage
 */
function saveToCache(ibgeCode: number, data: FeatureCollection): void {
  try {
    const key = getCacheKey(ibgeCode)
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    }

    localStorage.setItem(key, JSON.stringify(entry))
    console.log(`[GeoJSON] Salvo em cache para estado ${ibgeCode}`)
  } catch (error) {
    // Pode falhar se localStorage estiver cheio
    console.warn('[GeoJSON] Falha ao salvar em cache:', error)
  }
}

/**
 * Busca o GeoJSON dos municípios de um estado da API do IBGE
 * Com cache local de 7 dias para evitar requisições repetidas.
 *
 * @param ibgeCode Código IBGE do estado (ex: 31 para MG)
 * @returns FeatureCollection com os polígonos dos municípios
 */
export async function fetchStateGeoJSON(ibgeCode: number): Promise<FeatureCollection> {
  // Tentar cache primeiro
  const cached = getFromCache(ibgeCode)
  if (cached) {
    return cached
  }

  // Buscar da API
  const url = `${IBGE_API}/${ibgeCode}?intrarregiao=municipio&formato=application/vnd.geo+json`
  console.log(`[GeoJSON] Buscando estado ${ibgeCode} da API IBGE...`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erro ao buscar GeoJSON do estado ${ibgeCode}: ${response.statusText}`)
  }

  const data = await response.json()

  // Salvar em cache
  saveToCache(ibgeCode, data)

  return data
}
