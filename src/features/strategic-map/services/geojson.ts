import type { FeatureCollection } from 'geojson'

const IBGE_API = 'https://servicodados.ibge.gov.br/api/v3/malhas/estados'

/**
 * Busca o GeoJSON dos municípios de um estado da API do IBGE
 * @param ibgeCode Código IBGE do estado (ex: 31 para MG)
 * @returns FeatureCollection com os polígonos dos municípios
 */
export async function fetchStateGeoJSON(ibgeCode: number): Promise<FeatureCollection> {
  const url = `${IBGE_API}/${ibgeCode}?intrarregiao=municipio&formato=application/vnd.geo+json`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erro ao buscar GeoJSON do estado ${ibgeCode}: ${response.statusText}`)
  }

  return response.json()
}
