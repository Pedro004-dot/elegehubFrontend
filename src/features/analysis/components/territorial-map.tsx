import { useEffect, useRef, useMemo, useState } from 'react'
import { Map, useMap, MapControls } from '@/components/ui/map'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BrazilMaskLayer } from '@/components/map/brazil-mask-layer'
import { useBrazilMask } from '@/hooks/use-brazil-mask'
import type { TerritorialPresence } from '../types'
import type { FeatureCollection, Point } from 'geojson'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'

interface TerritorialMapProps {
  territorialData: TerritorialPresence[]
  competitorName: string
}

interface HoveredRegion {
  regionName: string
  votes: number
  percentage: number
  x: number
  y: number
}

// Criar GeoJSON de pontos a partir dos dados
function createPointsGeoJSON(data: TerritorialPresence[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: data.map(item => ({
      type: 'Feature' as const,
      properties: {
        regionName: item.regionName,
        votes: item.votes,
        percentage: item.percentage
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [item.coordinates[1], item.coordinates[0]] // lng, lat (MapLibre usa lng, lat)
      }
    }))
  }
}

// Componente de camada de circulos
function TerritorialCirclesLayer({
  data,
  onHover
}: {
  data: TerritorialPresence[]
  onHover: (region: HoveredRegion | null) => void
}) {
  const { map, isLoaded } = useMap()
  const layersAddedRef = useRef(false)

  const geojson = useMemo(() => createPointsGeoJSON(data), [data])

  useEffect(() => {
    if (!map || !isLoaded) return

    // Add source
    if (!map.getSource('territorial-points')) {
      map.addSource('territorial-points', {
        type: 'geojson',
        data: geojson
      })
    } else {
      const source = map.getSource('territorial-points') as GeoJSONSource
      source.setData(geojson)
    }

    // Add circles layer
    if (!map.getLayer('territorial-circles')) {
      map.addLayer({
        id: 'territorial-circles',
        type: 'circle',
        source: 'territorial-points',
        paint: {
          'circle-radius': [
            'case',
            ['>=', ['get', 'percentage'], 30], 25,
            ['>=', ['get', 'percentage'], 20], 20,
            ['>=', ['get', 'percentage'], 10], 15,
            10
          ],
          'circle-color': [
            'case',
            ['>=', ['get', 'percentage'], 30], '#ef4444',
            ['>=', ['get', 'percentage'], 20], '#f97316',
            ['>=', ['get', 'percentage'], 10], '#eab308',
            '#22c55e'
          ],
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'case',
            ['>=', ['get', 'percentage'], 30], '#ef4444',
            ['>=', ['get', 'percentage'], 20], '#f97316',
            ['>=', ['get', 'percentage'], 10], '#eab308',
            '#22c55e'
          ]
        }
      })
    }

    layersAddedRef.current = true

    // Event handlers
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
      onHover(null)
    }

    const handleMouseMove = (e: MapLayerMouseEvent) => {
      if (e.features?.[0]) {
        const props = e.features[0].properties
        if (props) {
          onHover({
            regionName: props.regionName,
            votes: props.votes,
            percentage: props.percentage,
            x: e.point.x,
            y: e.point.y
          })
        }
      }
    }

    map.on('mouseenter', 'territorial-circles', handleMouseEnter)
    map.on('mouseleave', 'territorial-circles', handleMouseLeave)
    map.on('mousemove', 'territorial-circles', handleMouseMove)

    return () => {
      try {
        map.off('mouseenter', 'territorial-circles', handleMouseEnter)
        map.off('mouseleave', 'territorial-circles', handleMouseLeave)
        map.off('mousemove', 'territorial-circles', handleMouseMove)

        if (map.getLayer('territorial-circles')) map.removeLayer('territorial-circles')
        if (map.getSource('territorial-points')) map.removeSource('territorial-points')
      } catch {
        // Ignore errors if map already destroyed
      }
      layersAddedRef.current = false
    }
  }, [map, isLoaded, geojson, onHover])

  return null
}

export function TerritorialMap({
  territorialData,
  competitorName,
}: TerritorialMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<HoveredRegion | null>(null)

  // Hook para mascara do Brasil
  const { maskData } = useBrazilMask()

  // Calcular centro baseado nos dados
  const center = useMemo((): [number, number] => {
    if (territorialData.length === 0) return [-44.5, -18.5]

    const centerLat = territorialData.reduce((sum, t) => sum + t.coordinates[0], 0) / territorialData.length
    const centerLng = territorialData.reduce((sum, t) => sum + t.coordinates[1], 0) / territorialData.length

    return [centerLng, centerLat] // MapLibre usa [lng, lat]
  }, [territorialData])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Presenca Territorial</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuicao geografica dos votos de {competitorName}
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
          <Map
            center={center}
            zoom={7}
            className="h-full w-full"
          >
            <MapControls position="top-right" showZoom showCompass={false} />
            {maskData && <BrazilMaskLayer maskData={maskData} beforeLayerId="territorial-circles" />}
            <TerritorialCirclesLayer
              data={territorialData}
              onHover={setHoveredRegion}
            />
          </Map>

          {/* Tooltip */}
          {hoveredRegion && (
            <div
              className="absolute bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border px-3 py-2 z-10 pointer-events-none text-sm"
              style={{
                left: hoveredRegion.x + 10,
                top: hoveredRegion.y - 10,
                transform: 'translateY(-100%)'
              }}
            >
              <p className="font-semibold">{hoveredRegion.regionName}</p>
              <p>{hoveredRegion.votes.toLocaleString('pt-BR')} votos</p>
              <p>{hoveredRegion.percentage.toFixed(1)}% do total</p>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Alta concentracao (30%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span>Media-alta (20-30%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span>Media (10-20%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Baixa (&lt;10%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
