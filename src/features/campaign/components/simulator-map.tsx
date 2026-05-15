import { useEffect, useState, useRef, useMemo } from 'react'
import { Map, useMap, MapControls } from '@/components/ui/map'
import type { FeatureCollection } from 'geojson'
import type { GeoJSONSource } from 'maplibre-gl'

import { BRAZIL_STATES } from '@/features/strategic-map/data/states'
import { ALL_MOCK_MUNICIPALITIES } from '@/features/strategic-map/data/mock-municipalities'
import { CLASSIFICATION_CONFIG } from '@/features/strategic-map/types'
import { fetchStateGeoJSON } from '@/features/strategic-map/services/geojson'
import { BrazilMaskLayer } from '@/components/map/brazil-mask-layer'
import { useBrazilMask } from '@/hooks/use-brazil-mask'
import type { ScenarioOutput } from '../types'

interface SimulatorMapProps {
  scenarioOutput: ScenarioOutput
}

// Componente filho para gerenciar os layers
function SimulatorLayers({
  geojsonData,
}: {
  geojsonData: FeatureCollection
}) {
  const { map, isLoaded } = useMap()
  const layersAddedRef = useRef(false)

  useEffect(() => {
    if (!map || !isLoaded) return

    // Add or update source
    if (!map.getSource('simulator-municipalities')) {
      map.addSource('simulator-municipalities', {
        type: 'geojson',
        data: geojsonData,
      })
    } else {
      const source = map.getSource('simulator-municipalities') as GeoJSONSource
      source.setData(geojsonData)
    }

    // Add fill layer
    if (!map.getLayer('simulator-fill')) {
      map.addLayer({
        id: 'simulator-fill',
        type: 'fill',
        source: 'simulator-municipalities',
        paint: {
          'fill-color': [
            'match',
            ['get', 'classification'],
            'consolidar', CLASSIFICATION_CONFIG.consolidar.color,
            'conquistar', CLASSIFICATION_CONFIG.conquistar.color,
            'disputar', CLASSIFICATION_CONFIG.disputar.color,
            'evitar', CLASSIFICATION_CONFIG.evitar.color,
            '#cccccc',
          ],
          'fill-opacity': [
            'case',
            ['>', ['get', 'modifier'], 1.2], 0.9,
            ['>', ['get', 'modifier'], 1.0], 0.7,
            ['<', ['get', 'modifier'], 0.8], 0.4,
            0.6,
          ],
        },
      })
    }

    // Add outline layer
    if (!map.getLayer('simulator-outline')) {
      map.addLayer({
        id: 'simulator-outline',
        type: 'line',
        source: 'simulator-municipalities',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.5,
        },
      })
    }

    layersAddedRef.current = true

    return () => {
      try {
        if (map.getLayer('simulator-fill')) map.removeLayer('simulator-fill')
        if (map.getLayer('simulator-outline')) map.removeLayer('simulator-outline')
        if (map.getSource('simulator-municipalities')) {
          map.removeSource('simulator-municipalities')
        }
      } catch {
        // Ignore errors if map already destroyed
      }
      layersAddedRef.current = false
    }
  }, [map, isLoaded, geojsonData])

  return null
}

export function SimulatorMap({ scenarioOutput }: SimulatorMapProps) {
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hook para máscara do Brasil
  const { maskData } = useBrazilMask()

  const mgState = BRAZIL_STATES.find((s) => s.uf === 'MG')
  const center: [number, number] = mgState?.centerCoordinates || [-44.5, -18.5]
  const zoom = mgState?.zoom || 6

  // Build enriched GeoJSON with modifiers
  const enrichedGeojson = useMemo(() => {
    if (!geojsonData) return null

    const enriched: FeatureCollection = {
      type: 'FeatureCollection',
      features: geojsonData.features.map((feature) => {
        const ibgeCode = feature.properties?.codarea
        const mockData = ALL_MOCK_MUNICIPALITIES.find(
          (m) => m.ibgeCode === ibgeCode
        )
        const modifier = scenarioOutput.municipalityModifiers[ibgeCode] ?? 1.0

        return {
          ...feature,
          properties: {
            ...feature.properties,
            name: mockData?.name || feature.properties?.name,
            classification: mockData?.classification || 'evitar',
            score: mockData?.score || 0,
            modifier,
          },
        }
      }),
    }

    return enriched
  }, [geojsonData, scenarioOutput.municipalityModifiers])

  // Load GeoJSON from IBGE API
  useEffect(() => {
    async function loadGeoJSON() {
      if (!mgState) return

      setIsLoading(true)
      try {
        const data = await fetchStateGeoJSON(mgState.ibgeCode)
        setGeojsonData(data)
      } catch (error) {
        console.error('Error loading GeoJSON:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadGeoJSON()
  }, [mgState])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <Map
        viewport={{
          center,
          zoom,
          bearing: 0,
          pitch: 0,
        }}
        className="h-full w-full"
      >
        <MapControls position="top-right" showZoom showCompass={false} />
        {maskData && <BrazilMaskLayer maskData={maskData} beforeLayerId="simulator-fill" />}
        {enrichedGeojson && <SimulatorLayers geojsonData={enrichedGeojson} />}
      </Map>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
          <p className="text-sm text-muted-foreground">Carregando mapa...</p>
        </div>
      )}
    </div>
  )
}
