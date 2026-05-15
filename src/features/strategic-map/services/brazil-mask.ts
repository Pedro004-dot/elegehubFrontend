import type { FeatureCollection, Polygon, MultiPolygon, Position } from 'geojson'

const IBGE_API = 'https://servicodados.ibge.gov.br/api/v3/malhas/paises'

/**
 * Busca o contorno do Brasil da API do IBGE
 * @returns FeatureCollection com o polígono do Brasil
 */
export async function fetchBrazilOutline(): Promise<FeatureCollection> {
  const url = `${IBGE_API}/BR?formato=application/vnd.geo+json`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erro ao buscar contorno do Brasil: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Cria um GeoJSON de máscara que cobre o mundo inteiro exceto o Brasil
 * Isso faz com que os países vizinhos fiquem "escondidos" pela cor de fundo
 *
 * @param brazilGeoJSON GeoJSON com o contorno do Brasil
 * @returns FeatureCollection com a máscara
 */
export function createMaskGeoJSON(brazilGeoJSON: FeatureCollection): FeatureCollection {
  // Polígono que cobre o mundo inteiro
  const worldBounds: Position[] = [
    [-180, -90],
    [-180, 90],
    [180, 90],
    [180, -90],
    [-180, -90]
  ]

  // Extrair as coordenadas do Brasil (pode ser Polygon ou MultiPolygon)
  const brazilFeature = brazilGeoJSON.features[0]
  if (!brazilFeature) {
    throw new Error('GeoJSON do Brasil não contém features')
  }

  const geometry = brazilFeature.geometry as Polygon | MultiPolygon

  // Criar o polígono com buraco(s) no formato do Brasil
  let coordinates: Position[][][]

  if (geometry.type === 'Polygon') {
    // Se for um Polygon simples, o exterior é o mundo e o interior é o Brasil
    coordinates = [[worldBounds, ...geometry.coordinates]]
  } else if (geometry.type === 'MultiPolygon') {
    // Se for MultiPolygon, precisamos criar um MultiPolygon com o mundo e buracos
    // Cada polígono do Brasil vira um buraco no mundo
    const holes: Position[][] = []
    for (const polygon of geometry.coordinates) {
      // Pegar apenas o anel exterior de cada polígono
      const exterior = polygon[0]
      if (exterior) {
        holes.push(exterior)
      }
    }
    coordinates = [[worldBounds, ...holes]]
  } else {
    // Cast para acessar type em casos não esperados
    const unknownGeometry = geometry as { type?: string }
    throw new Error(`Tipo de geometria não suportado: ${unknownGeometry.type ?? 'desconhecido'}`)
  }

  const finalCoordinates = coordinates[0]
  if (!finalCoordinates) {
    throw new Error('Erro ao criar coordenadas da máscara')
  }

  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: finalCoordinates
      }
    }]
  }
}
