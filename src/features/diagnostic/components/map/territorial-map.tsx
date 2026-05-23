/**
 * TerritorialMap
 *
 * Interactive map showing municipalities colored by classification.
 * Uses MapLibre GL JS with GeoJSON from IBGE API.
 */

import { useEffect, useState, useMemo, useCallback, useId, useRef } from 'react'
import { Map as MapComponent, MapControls, MapPopup, useMap } from '@/components/ui/map'
import { StatusBadge } from '@/components/elegehub'
import { BrazilMaskLayer } from '@/components/map/brazil-mask-layer'
import { useBrazilMask } from '@/hooks/use-brazil-mask'
import { BRAZIL_STATES } from '@/features/strategic-map/data/states'
import { Loader2 } from 'lucide-react'
import type { TerritorialMunicipio, TerritorialClassification } from '../../types'
import { CLASSIFICATION_COLORS } from '../../types'
import MapLibreGL from 'maplibre-gl'

// =============================================================================
// Types
// =============================================================================

interface TerritorialMapProps {
  /** Array of municipalities with classification data */
  municipios: TerritorialMunicipio[]
  /** State code (UF) for fetching GeoJSON - e.g., "MG", "SP" */
  uf: string
  /** Map height */
  height?: string | number
  /** Optional className */
  className?: string
  /** Show controls */
  showControls?: boolean
  /** Active classification filters */
  activeFilters?: TerritorialClassification[]
  /** Callback when a municipality is clicked */
  onMunicipioClick?: (municipio: TerritorialMunicipio) => void
  /** Callback when a municipality is hovered */
  onMunicipioHover?: (municipio: TerritorialMunicipio | null) => void
  /** Show fullscreen button */
  showFullscreen?: boolean
}

interface GeoJSONFeature {
  type: 'Feature'
  properties: {
    codarea?: string
    name?: string
    [key: string]: unknown
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

interface PopupInfo {
  municipio: TerritorialMunicipio
  coordinates: [number, number]
}

// =============================================================================
// Constants
// =============================================================================

const IBGE_GEOJSON_URL = (ibgeCode: number) =>
  `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${ibgeCode}?intrarregiao=municipio&formato=application/vnd.geo+json`

const CLASSIFICATION_VARIANTS: Record<TerritorialClassification, 'opportunity' | 'attention' | 'risk' | 'neutral'> = {
  fiel: 'opportunity',
  pendular: 'attention',
  disputavel: 'attention',
  hostil: 'risk',
  alta_abstencao: 'neutral',
}

const CLASSIFICATION_LABELS: Record<TerritorialClassification, string> = {
  fiel: 'Fiel',
  pendular: 'Pendular',
  disputavel: 'Disputável',
  hostil: 'Hostil',
  alta_abstencao: 'Alta Abstenção',
}

// =============================================================================
// GeoJSON Fill Layer Component
// =============================================================================

interface MapFillLayerProps {
  id?: string
  data: GeoJSONFeatureCollection
  /** Function to get fill color for a feature */
  getFillColor: (feature: GeoJSONFeature) => string
  /** Fill opacity */
  fillOpacity?: number
  /** Outline color */
  outlineColor?: string
  /** Outline width */
  outlineWidth?: number
  /** Feature IDs to filter (show only these) */
  visibleIds?: Set<string>
  /** Callback when a feature is clicked */
  onClick?: (feature: GeoJSONFeature, coordinates: [number, number]) => void
  /** Callback when a feature is hovered */
  onHover?: (feature: GeoJSONFeature | null, coordinates: [number, number] | null) => void
}

function MapFillLayer({
  id: propId,
  data,
  getFillColor,
  fillOpacity = 0.7,
  outlineColor = '#ffffff',
  outlineWidth = 1,
  visibleIds,
  onClick,
  onHover,
}: MapFillLayerProps) {
  const { map, isLoaded } = useMap()
  const autoId = useId()
  const id = propId ?? autoId
  const sourceId = `fill-source-${id}`
  const layerId = `fill-layer-${id}`
  const outlineLayerId = `fill-outline-layer-${id}`

  const callbacksRef = useRef({ onClick, onHover })
  callbacksRef.current = { onClick, onHover }

  // Build GeoJSON with color properties
  const processedData = useMemo(() => {
    return {
      ...data,
      features: data.features.map((feature) => {
        const codigoIbge = feature.properties.codarea?.padStart(7, '0') || ''
        const isVisible = !visibleIds || visibleIds.has(codigoIbge)
        return {
          ...feature,
          properties: {
            ...feature.properties,
            _fillColor: isVisible ? getFillColor(feature) : 'rgba(200, 200, 200, 0.3)',
            _codigoIbge: codigoIbge,
            _isVisible: isVisible,
          },
        }
      }),
    }
  }, [data, getFillColor, visibleIds])

  // Add source and layers
  useEffect(() => {
    if (!isLoaded || !map) return

    // Add source
    map.addSource(sourceId, {
      type: 'geojson',
      data: processedData as unknown as GeoJSON.FeatureCollection,
      promoteId: '_codigoIbge',
    })

    // Add fill layer
    map.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': ['get', '_fillColor'],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          Math.min(fillOpacity + 0.2, 1),
          fillOpacity,
        ],
      },
    })

    // Add outline layer
    map.addLayer({
      id: outlineLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#000000',
          outlineColor,
        ],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          outlineWidth + 1,
          outlineWidth,
        ],
      },
    })

    return () => {
      try {
        if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId)
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // Ignore cleanup errors
      }
    }
  }, [isLoaded, map, sourceId, layerId, outlineLayerId, fillOpacity, outlineColor, outlineWidth])

  // Update data when it changes
  useEffect(() => {
    if (!isLoaded || !map) return
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined
    if (source) {
      source.setData(processedData as GeoJSON.FeatureCollection)
    }
  }, [isLoaded, map, sourceId, processedData])

  // Handle interactions
  useEffect(() => {
    if (!isLoaded || !map) return

    let hoveredId: string | null = null

    const setHoverState = (id: string | null, hover: boolean) => {
      if (id && map.getSource(sourceId)) {
        map.setFeatureState({ source: sourceId, id }, { hover })
      }
    }

    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
      const feature = e.features?.[0]
      if (feature) {
        const newHoveredId = feature.properties?._codigoIbge as string

        if (newHoveredId !== hoveredId) {
          if (hoveredId) setHoverState(hoveredId, false)
          hoveredId = newHoveredId
          setHoverState(hoveredId, true)
          map.getCanvas().style.cursor = 'pointer'

          callbacksRef.current.onHover?.(
            feature as unknown as GeoJSONFeature,
            [e.lngLat.lng, e.lngLat.lat]
          )
        }
      }
    }

    const handleMouseLeave = () => {
      if (hoveredId) {
        setHoverState(hoveredId, false)
        hoveredId = null
      }
      map.getCanvas().style.cursor = ''
      callbacksRef.current.onHover?.(null, null)
    }

    const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        callbacksRef.current.onClick?.(
          e.features[0] as unknown as GeoJSONFeature,
          [e.lngLat.lng, e.lngLat.lat]
        )
      }
    }

    map.on('mousemove', layerId, handleMouseMove)
    map.on('mouseleave', layerId, handleMouseLeave)
    map.on('click', layerId, handleClick)

    return () => {
      map.off('mousemove', layerId, handleMouseMove)
      map.off('mouseleave', layerId, handleMouseLeave)
      map.off('click', layerId, handleClick)
      if (hoveredId) setHoverState(hoveredId, false)
      map.getCanvas().style.cursor = ''
    }
  }, [isLoaded, map, layerId, sourceId])

  return null
}

// =============================================================================
// Main Component
// =============================================================================

export function TerritorialMap({
  municipios,
  uf,
  height = 400,
  className,
  showControls = true,
  activeFilters = [],
  onMunicipioClick,
  onMunicipioHover,
  showFullscreen = false,
}: TerritorialMapProps) {
  const [geoJSON, setGeoJSON] = useState<GeoJSONFeatureCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)

  // Load Brazil mask for dark theme
  const { maskData } = useBrazilMask()

  // Build lookup map for municipalities by codigo_ibge
  const municipioLookup = useMemo(() => {
    const lookup = new Map<string, TerritorialMunicipio>()
    for (const m of municipios) {
      const codigo = m.codigo_ibge?.toString().padStart(7, '0') || m.municipio_id?.toString().padStart(7, '0')
      if (codigo) {
        lookup.set(codigo, m)
      }
    }
    return lookup
  }, [municipios])

  // Visible IDs based on filters
  const visibleIds = useMemo(() => {
    if (activeFilters.length === 0) return undefined

    const ids = new Set<string>()
    for (const [codigo, m] of municipioLookup.entries()) {
      const classification = m.classificacao || m.classification || 'pendular'
      if (activeFilters.includes(classification)) {
        ids.add(codigo)
      }
    }
    return ids
  }, [municipioLookup, activeFilters])

  // Get state configuration (center, zoom, ibgeCode)
  const stateConfig = useMemo(() => {
    return BRAZIL_STATES.find(s => s.uf === uf.toUpperCase())
  }, [uf])

  const center = (stateConfig?.centerCoordinates ?? [-55.0, -15.0]) as [number, number]
  const zoom = stateConfig?.zoom ?? 4

  // Fetch GeoJSON from IBGE
  useEffect(() => {
    let cancelled = false

    async function fetchGeoJSON() {
      setLoading(true)
      setError(null)

      if (!stateConfig) {
        setError(`Estado nao encontrado: ${uf}`)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(IBGE_GEOJSON_URL(stateConfig.ibgeCode))
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status}`)
        }
        const data = await response.json()
        if (!cancelled) {
          setGeoJSON(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load map data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchGeoJSON()

    return () => {
      cancelled = true
    }
  }, [uf, stateConfig])

  // Get fill color for a feature
  const getFillColor = useCallback(
    (feature: GeoJSONFeature): string => {
      const codigoIbge = feature.properties.codarea?.padStart(7, '0') || ''
      const municipio = municipioLookup.get(codigoIbge)

      if (!municipio) {
        return 'rgba(200, 200, 200, 0.5)' // Unknown municipality
      }

      const classification = (municipio.classificacao || municipio.classification || 'pendular') as TerritorialClassification
      return CLASSIFICATION_COLORS[classification] || CLASSIFICATION_COLORS.pendular
    },
    [municipioLookup]
  )

  // Handle feature click
  const handleFeatureClick = useCallback(
    (feature: GeoJSONFeature, coordinates: [number, number]) => {
      const codigoIbge = feature.properties.codarea?.padStart(7, '0') || ''
      const municipio = municipioLookup.get(codigoIbge)

      if (municipio) {
        setPopupInfo({ municipio, coordinates })
        onMunicipioClick?.(municipio)
      }
    },
    [municipioLookup, onMunicipioClick]
  )

  // Handle feature hover
  const handleFeatureHover = useCallback(
    (feature: GeoJSONFeature | null, _coordinates: [number, number] | null) => {
      if (!feature) {
        onMunicipioHover?.(null)
        return
      }

      const codigoIbge = feature.properties.codarea?.padStart(7, '0') || ''
      const municipio = municipioLookup.get(codigoIbge)
      onMunicipioHover?.(municipio || null)
    },
    [municipioLookup, onMunicipioHover]
  )

  // Loading state
  if (loading) {
    return (
      <div
        className={className}
        style={{ height }}
      >
        <div className="h-full w-full flex items-center justify-center bg-surface-subtle rounded-lg border border-border">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
            <p className="text-small text-ink-secondary">Carregando mapa de {uf}...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !geoJSON) {
    return (
      <div
        className={className}
        style={{ height }}
      >
        <div className="h-full w-full flex items-center justify-center bg-surface-subtle rounded-lg border border-border">
          <div className="text-center space-y-2">
            <p className="text-body text-ink-secondary">Erro ao carregar mapa</p>
            <p className="text-small text-ink-tertiary">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className} style={{ height }}>
      <MapComponent
        center={center}
        zoom={zoom}
        theme="dark"
        className="h-full w-full rounded-lg overflow-hidden"
      >
        {/* Brazil mask to hide neighboring countries */}
        {maskData && <BrazilMaskLayer maskData={maskData} />}

        <MapFillLayer
          data={geoJSON}
          getFillColor={getFillColor}
          fillOpacity={0.8}
          outlineColor="rgba(255, 255, 255, 0.3)"
          outlineWidth={0.5}
          visibleIds={visibleIds}
          onClick={handleFeatureClick}
          onHover={handleFeatureHover}
        />

        {showControls && (
          <MapControls
            position="bottom-right"
            showZoom
            showFullscreen={showFullscreen}
          />
        )}

        {popupInfo && (
          <MapPopup
            longitude={popupInfo.coordinates[0]}
            latitude={popupInfo.coordinates[1]}
            onClose={() => setPopupInfo(null)}
            closeButton
          >
            <MunicipioPopupContent municipio={popupInfo.municipio} />
          </MapPopup>
        )}
      </MapComponent>
    </div>
  )
}

// =============================================================================
// Popup Content Component
// =============================================================================

function MunicipioPopupContent({ municipio }: { municipio: TerritorialMunicipio }) {
  const classification = municipio.classificacao || municipio.classification || 'pendular'

  return (
    <div className="min-w-[200px]">
      <h4 className="font-semibold text-ink-display mb-2">{municipio.nome}</h4>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-small text-ink-secondary">Classificacao:</span>
          <StatusBadge variant={CLASSIFICATION_VARIANTS[classification]}>
            {CLASSIFICATION_LABELS[classification]}
          </StatusBadge>
        </div>

        {municipio.eleitores !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-small text-ink-secondary">Eleitores:</span>
            <span className="text-small font-mono text-ink-primary">
              {municipio.eleitores.toLocaleString('pt-BR')}
            </span>
          </div>
        )}

        {municipio.score_compatibilidade !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-small text-ink-secondary">Score:</span>
            <span className="text-small font-mono text-ink-primary">
              {municipio.score_compatibilidade}%
            </span>
          </div>
        )}

        {municipio.tendencia && (
          <div className="flex items-center justify-between">
            <span className="text-small text-ink-secondary">Tendencia:</span>
            <span className={`text-small ${
              municipio.tendencia === 'crescimento' || municipio.tendencia === 'crescente'
                ? 'text-success'
                : municipio.tendencia === 'retracao' || municipio.tendencia === 'decrescente'
                ? 'text-danger'
                : 'text-ink-tertiary'
            }`}>
              {municipio.tendencia === 'crescimento' || municipio.tendencia === 'crescente'
                ? '↑ Crescente'
                : municipio.tendencia === 'retracao' || municipio.tendencia === 'decrescente'
                ? '↓ Decrescente'
                : '→ Estavel'}
            </span>
          </div>
        )}

        {municipio.prioridade !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-small text-ink-secondary">Prioridade:</span>
            <span className="text-small font-mono text-ink-primary">
              {municipio.prioridade}/5
            </span>
          </div>
        )}
      </div>

      {municipio.recomendacao_texto && (
        <p className="mt-3 pt-3 border-t text-caption text-ink-secondary">
          {municipio.recomendacao_texto}
        </p>
      )}
    </div>
  )
}

export default TerritorialMap
