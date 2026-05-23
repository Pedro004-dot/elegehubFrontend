import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { Map, useMap, MapControls } from '@/components/ui/map'
import type { FeatureCollection } from 'geojson'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'

import { BRAZIL_STATES } from '../data/states'
import { ALL_MOCK_MUNICIPALITIES } from '../data/mock-municipalities'
import { fetchMunicipalitiesByState } from '../services/municipalities'
import { fetchStateGeoJSON } from '../services/geojson'
import { fetchMunicipiosMG, transformMunicipioToMapFormat, type CandidatoResumo } from '../services/analytics'
import { BrazilMaskLayer } from '@/components/map/brazil-mask-layer'
import { useBrazilMask } from '@/hooks/use-brazil-mask'
import type { Municipality, MunicipalityClassification } from '../types'
import { CLASSIFICATION_CONFIG } from '../types'

interface BrazilMapProps {
  selectedState: string
  activeFilters: MunicipalityClassification[]
  onMunicipalityClick: (municipality: Municipality | null) => void
  onHoverMunicipality: (municipality: Municipality | null) => void
  selectedCandidato?: CandidatoResumo | null
  cargo?: string
  municipalitiesData?: Municipality[]
  loading?: boolean
}

// Componente filho para adicionar layers (precisa estar dentro do Map)
function MunicipalityLayers({
  geojsonData,
  activeFilters,
  municipalitiesMap,
  onMunicipalityClick,
  onHoverMunicipality
}: {
  geojsonData: FeatureCollection
  activeFilters: MunicipalityClassification[]
  municipalitiesMap: Record<string, Municipality>
  onMunicipalityClick: (municipality: Municipality | null) => void
  onHoverMunicipality: (municipality: Municipality | null) => void
}) {
  const { map, isLoaded } = useMap()
  const layersAddedRef = useRef(false)
  const eventHandlersRef = useRef<{
    mouseenter?: () => void
    mouseleave?: () => void
    mousemove?: (e: MapLayerMouseEvent) => void
    click?: (e: MapLayerMouseEvent) => void
  }>({})

  // Adicionar source e layers quando o mapa estiver carregado
  useEffect(() => {
    if (!map || !isLoaded) return

    // Adicionar source GeoJSON
    if (!map.getSource('municipalities')) {
      map.addSource('municipalities', {
        type: 'geojson',
        data: geojsonData
      })
    } else {
      const source = map.getSource('municipalities') as GeoJSONSource
      source.setData(geojsonData)
    }

    // Adicionar fill layer
    if (!map.getLayer('municipality-fill')) {
      map.addLayer({
        id: 'municipality-fill',
        type: 'fill',
        source: 'municipalities',
        paint: {
          'fill-color': [
            'match',
            ['get', 'classification'],
            'consolidar', CLASSIFICATION_CONFIG.consolidar.color,
            'conquistar', CLASSIFICATION_CONFIG.conquistar.color,
            'disputar', CLASSIFICATION_CONFIG.disputar.color,
            'evitar', CLASSIFICATION_CONFIG.evitar.color,
            '#cccccc'
          ],
          'fill-opacity': 0.7
        }
      })
    }

    // Adicionar outline layer
    if (!map.getLayer('municipality-outline')) {
      map.addLayer({
        id: 'municipality-outline',
        type: 'line',
        source: 'municipalities',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.5
        }
      })
    }

    layersAddedRef.current = true

    return () => {
      // Cleanup layers e source quando o componente desmontar
      try {
        if (map.getLayer('municipality-fill')) map.removeLayer('municipality-fill')
        if (map.getLayer('municipality-outline')) map.removeLayer('municipality-outline')
        if (map.getSource('municipalities')) map.removeSource('municipalities')
      } catch {
        // Ignorar erros se o mapa já foi destruído
      }
      layersAddedRef.current = false
    }
  }, [map, isLoaded, geojsonData])

  // Aplicar filtros quando activeFilters mudar
  useEffect(() => {
    if (!map || !isLoaded || !layersAddedRef.current) return
    if (!map.getLayer('municipality-fill')) return

    if (activeFilters.length > 0) {
      map.setFilter('municipality-fill', ['in', ['get', 'classification'], ['literal', activeFilters]])
      map.setFilter('municipality-outline', ['in', ['get', 'classification'], ['literal', activeFilters]])
    } else {
      map.setFilter('municipality-fill', null)
      map.setFilter('municipality-outline', null)
    }
  }, [map, isLoaded, activeFilters])

  // Configurar event handlers
  useEffect(() => {
    if (!map || !isLoaded || !layersAddedRef.current) return
    if (!map.getLayer('municipality-fill')) return

    // Remover handlers antigos
    const oldHandlers = eventHandlersRef.current
    if (oldHandlers.mouseenter) map.off('mouseenter', 'municipality-fill', oldHandlers.mouseenter)
    if (oldHandlers.mouseleave) map.off('mouseleave', 'municipality-fill', oldHandlers.mouseleave)
    if (oldHandlers.mousemove) map.off('mousemove', 'municipality-fill', oldHandlers.mousemove)
    if (oldHandlers.click) map.off('click', 'municipality-fill', oldHandlers.click)

    // Criar novos handlers
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
      onHoverMunicipality(null)
    }

    const handleMouseMove = (e: MapLayerMouseEvent) => {
      if (e.features?.[0]) {
        const props = e.features[0].properties
        const ibgeCode = props?.codarea
        const municipality = ibgeCode ? municipalitiesMap[String(ibgeCode)] : null
        onHoverMunicipality(municipality || null)
      }
    }

    const handleClick = (e: MapLayerMouseEvent) => {
      if (e.features?.[0]) {
        const props = e.features[0].properties
        const ibgeCode = props?.codarea
        const municipality = ibgeCode ? municipalitiesMap[String(ibgeCode)] : null
        onMunicipalityClick(municipality || null)
      }
    }

    // Registrar handlers
    map.on('mouseenter', 'municipality-fill', handleMouseEnter)
    map.on('mouseleave', 'municipality-fill', handleMouseLeave)
    map.on('mousemove', 'municipality-fill', handleMouseMove)
    map.on('click', 'municipality-fill', handleClick)

    // Salvar referências para cleanup
    eventHandlersRef.current = {
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseLeave,
      mousemove: handleMouseMove,
      click: handleClick
    }

    return () => {
      map.off('mouseenter', 'municipality-fill', handleMouseEnter)
      map.off('mouseleave', 'municipality-fill', handleMouseLeave)
      map.off('mousemove', 'municipality-fill', handleMouseMove)
      map.off('click', 'municipality-fill', handleClick)
    }
  }, [map, isLoaded, municipalitiesMap, onHoverMunicipality, onMunicipalityClick])

  return null
}

export function BrazilMap({
  selectedState,
  activeFilters,
  onMunicipalityClick,
  onHoverMunicipality,
  selectedCandidato,
  cargo,
  municipalitiesData,
  loading: externalLoading
}: BrazilMapProps) {
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(null)
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [hoveredMunicipality, setHoveredMunicipality] = useState<Municipality | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Usar hook compartilhado para máscara do Brasil
  const { maskData } = useBrazilMask()

  const stateConfig = BRAZIL_STATES.find(s => s.uf === selectedState)
  const [longitude, latitude] = stateConfig?.centerCoordinates || [-44.5, -18.5]
  const zoom = stateConfig?.zoom || 6

  // Mapa de municípios por código IBGE para busca rápida
  const municipalitiesMap = useMemo(() => {
    const record: Record<string, Municipality> = {}
    municipalities.forEach(m => { record[m.ibgeCode] = m })
    return record
  }, [municipalities])

  // Usar dados externos ou buscar da API (fallback)
  useEffect(() => {
    const loadMunicipalities = async () => {
      // Se dados externos foram fornecidos, usar eles (elimina fetch duplicado)
      if (municipalitiesData) {
        setMunicipalities(municipalitiesData)
        return
      }

      // Fallback: buscar da API (para compatibilidade se usado standalone)
      try {
        // Para MG, usar API de analytics com dados reais
        if (selectedState === 'MG') {
          const analyticsData = await fetchMunicipiosMG({ cargo })
          // Passar o candidato selecionado para a classificação
          const transformed = analyticsData.map(m => transformMunicipioToMapFormat(m, selectedCandidato))
          setMunicipalities(transformed)
          return
        }

        // Para outros estados, usar API de municipios + mock
        const data = await fetchMunicipalitiesByState(selectedState)

        // Enriquecer com classificações do mock (temporário)
        const enrichedData = data.map(m => {
          const mockData = ALL_MOCK_MUNICIPALITIES.find(mock => mock.ibgeCode === m.ibgeCode)
          return {
            ...m,
            classification: mockData?.classification || 'disputar' as const,
            score: mockData?.score || Math.floor(Math.random() * 100),
            potentialVotes: mockData?.potentialVotes || Math.floor(Math.random() * 50000)
          }
        })

        setMunicipalities(enrichedData)
      } catch (error) {
        console.error('Erro ao buscar municípios da API:', error)
        // Fallback para mock em caso de erro
        setMunicipalities(ALL_MOCK_MUNICIPALITIES.filter(m => m.state === selectedState))
      }
    }

    loadMunicipalities()
  }, [selectedState, selectedCandidato, cargo, municipalitiesData])

  // Carregar GeoJSON da API do IBGE e enriquecer com dados da nossa API
  useEffect(() => {
    const loadGeoJSON = async () => {
      if (municipalities.length === 0 || !stateConfig) return

      setIsLoading(true)
      try {
        // Buscar GeoJSON da API do IBGE
        const data = await fetchStateGeoJSON(stateConfig.ibgeCode)

        const enrichedFeatures = data.features.map((feature) => {
          const props = feature.properties as { codarea?: string } | null
          const ibgeCode = props?.codarea
          const municipality = ibgeCode ? municipalitiesMap[String(ibgeCode)] : null

          return {
            ...feature,
            properties: {
              ...feature.properties,
              municipalityId: municipality?.id,
              name: municipality?.name || `Município ${ibgeCode}`,
              classification: municipality?.classification || 'disputar',
              score: municipality?.score || 50,
              potentialVotes: municipality?.potentialVotes || 0
            }
          }
        })

        setGeojsonData({ type: 'FeatureCollection', features: enrichedFeatures })
      } catch (error) {
        console.error('Erro ao carregar GeoJSON:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGeoJSON()
  }, [selectedState, municipalities, municipalitiesMap, stateConfig])

  // Wrapper para hover que também atualiza estado local
  const handleHover = useCallback((municipality: Municipality | null) => {
    setHoveredMunicipality(municipality)
    onHoverMunicipality(municipality)
  }, [onHoverMunicipality])

  return (
    <div className="relative w-full h-full">
      <Map
        center={[longitude, latitude]}
        zoom={zoom}
        className="w-full h-full"
      >
        <MapControls position="bottom-right" showZoom />
        {maskData && <BrazilMaskLayer maskData={maskData} />}
        {geojsonData && (
          <MunicipalityLayers
            geojsonData={geojsonData}
            activeFilters={activeFilters}
            municipalitiesMap={municipalitiesMap}
            onMunicipalityClick={onMunicipalityClick}
            onHoverMunicipality={handleHover}
          />
        )}
        {(isLoading || externalLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
            <div className="text-sm text-muted-foreground">Carregando municípios...</div>
          </div>
        )}
      </Map>

      {/* Tooltip */}
      {hoveredMunicipality && (
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border px-3 py-2 z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: CLASSIFICATION_CONFIG[hoveredMunicipality.classification].color }}
            />
            <span className="font-medium">{hoveredMunicipality.name}</span>
            <span className="text-muted-foreground text-sm">
              Score: {hoveredMunicipality.score}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
