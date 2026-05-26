/**
 * BrazilMap - Mapa exploratorio com coloracao por indicador ou classificacao
 *
 * Versao refatorada do mapa que:
 * - Usa coloracao dinamica baseada no indicador selecionado OU categoria de classificacao
 * - Navega para /municipio/:codigoIbge no click
 * - Suporta dois modos: indicadores (gradiente) e classificacao (categorias)
 */

import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Map, useMap, MapControls } from '@/components/ui/map'
import type { FeatureCollection } from 'geojson'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'

import { BRAZIL_STATES } from '../data/states'
import { fetchStateGeoJSON } from '../services/geojson'
import { BrazilMaskLayer } from '@/components/map/brazil-mask-layer'
import { useBrazilMask } from '@/hooks/use-brazil-mask'
import {
  INDICATOR_CONFIGS,
  CATEGORIA_CONFIGS,
  type BrazilState,
  type IndicatorId,
  type MunicipalityWithIndicators,
  type ClassificacaoBulk,
  type CategoriaClassificacao,
} from '../types'
import type { MapMode } from './map-mode-toggle'
import { MunicipalityCard } from './municipality-card'

interface BrazilMapProps {
  selectedState: string
  activeIndicator: IndicatorId
  municipalities: MunicipalityWithIndicators[]
  loading?: boolean
  onMunicipalityHover?: (municipality: MunicipalityWithIndicators | null) => void
  /** Modo de coloracao do mapa */
  mode?: MapMode
  /** Classificacoes por municipio (usado quando mode='classificacao') */
  classificacaoByIbge?: Map<string, ClassificacaoBulk>
}

// ============================================
// Componente interno para layers do mapa
// ============================================

interface MunicipalityLayersProps {
  geojsonData: FeatureCollection
  activeIndicator: IndicatorId
  dataRange: { min: number; max: number }
  municipalitiesMap: Record<string, MunicipalityWithIndicators>
  onMunicipalityHover: (municipality: MunicipalityWithIndicators | null) => void
  onMunicipalityClick: (municipality: MunicipalityWithIndicators) => void
  /** Modo de coloracao */
  mode: MapMode
}

function MunicipalityLayers({
  geojsonData,
  activeIndicator,
  dataRange,
  municipalitiesMap,
  onMunicipalityHover,
  onMunicipalityClick,
  mode,
}: MunicipalityLayersProps) {
  const { map, isLoaded } = useMap()
  const layersAddedRef = useRef(false)
  const eventHandlersRef = useRef<{
    mouseenter?: () => void
    mouseleave?: () => void
    mousemove?: (e: MapLayerMouseEvent) => void
    click?: (e: MapLayerMouseEvent) => void
  }>({})

  const config = INDICATOR_CONFIGS[activeIndicator]

  // Gerar expressao de cor baseada no modo
  const colorExpression = useMemo(() => {
    if (mode === 'classificacao') {
      // Modo classificacao: cor fixa por categoria
      return [
        'match',
        ['get', 'categoria'],
        'prioritaria', CATEGORIA_CONFIGS.prioritaria.bgColor,
        'crescente', CATEGORIA_CONFIGS.crescente.bgColor,
        'exploratoria', CATEGORIA_CONFIGS.exploratoria.bgColor,
        'fora_radar', CATEGORIA_CONFIGS.fora_radar.bgColor,
        '#e5e7eb', // Cor default (cinza) para municipios sem classificacao
      ]
    }

    // Modo indicadores: interpolacao linear
    const { min, max } = dataRange
    const range = max - min || 1
    const colors = config.higherIsBetter
      ? config.colorScale
      : [...config.colorScale].reverse()

    return [
      'interpolate',
      ['linear'],
      ['coalesce', ['get', 'indicatorValue'], min],
      min, colors[0],
      min + range * 0.25, colors[1],
      min + range * 0.5, colors[2],
      min + range * 0.75, colors[3],
      max, colors[4],
    ]
  }, [mode, activeIndicator, dataRange, config])

  // Adicionar source e layers
  useEffect(() => {
    if (!map || !isLoaded) return

    // Adicionar source GeoJSON
    if (!map.getSource('municipalities')) {
      map.addSource('municipalities', {
        type: 'geojson',
        data: geojsonData,
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
          'fill-color': colorExpression as unknown as string,
          'fill-opacity': 0.85,
        },
      })
    } else {
      map.setPaintProperty('municipality-fill', 'fill-color', colorExpression)
    }

    // Adicionar outline layer
    if (!map.getLayer('municipality-outline')) {
      map.addLayer({
        id: 'municipality-outline',
        type: 'line',
        source: 'municipalities',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.5,
        },
      })
    }

    // Adicionar highlight layer (para hover)
    if (!map.getLayer('municipality-highlight')) {
      map.addLayer({
        id: 'municipality-highlight',
        type: 'line',
        source: 'municipalities',
        paint: {
          'line-color': '#1e293b',
          'line-width': 2,
        },
        filter: ['==', ['get', 'codigoIbge'], ''],
      })
    }

    layersAddedRef.current = true

    return () => {
      try {
        if (map.getLayer('municipality-fill')) map.removeLayer('municipality-fill')
        if (map.getLayer('municipality-outline')) map.removeLayer('municipality-outline')
        if (map.getLayer('municipality-highlight')) map.removeLayer('municipality-highlight')
        if (map.getSource('municipalities')) map.removeSource('municipalities')
      } catch {
        // Ignorar erros se o mapa ja foi destruido
      }
      layersAddedRef.current = false
    }
  }, [map, isLoaded, geojsonData, colorExpression])

  // Atualizar cor quando indicador muda
  useEffect(() => {
    if (!map || !isLoaded || !layersAddedRef.current) return
    if (!map.getLayer('municipality-fill')) return

    map.setPaintProperty('municipality-fill', 'fill-color', colorExpression)
  }, [map, isLoaded, colorExpression])

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

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
      map.setFilter('municipality-highlight', ['==', ['get', 'codigoIbge'], ''])
      onMunicipalityHover(null)
    }

    const handleMouseMove = (e: MapLayerMouseEvent) => {
      if (e.features?.[0]) {
        const props = e.features[0].properties
        const codigoIbge = props?.codigoIbge
        const municipality = codigoIbge ? municipalitiesMap[String(codigoIbge)] : null
        if (municipality) {
          map.setFilter('municipality-highlight', ['==', ['get', 'codigoIbge'], codigoIbge])
          onMunicipalityHover(municipality)
        }
      }
    }

    const handleClick = (e: MapLayerMouseEvent) => {
      if (e.features?.[0]) {
        const props = e.features[0].properties
        const codigoIbge = props?.codigoIbge
        const municipality = codigoIbge ? municipalitiesMap[String(codigoIbge)] : null
        if (municipality) {
          onMunicipalityClick(municipality)
        }
      }
    }

    map.on('mouseenter', 'municipality-fill', handleMouseEnter)
    map.on('mouseleave', 'municipality-fill', handleMouseLeave)
    map.on('mousemove', 'municipality-fill', handleMouseMove)
    map.on('click', 'municipality-fill', handleClick)

    eventHandlersRef.current = {
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseLeave,
      mousemove: handleMouseMove,
      click: handleClick,
    }

    return () => {
      map.off('mouseenter', 'municipality-fill', handleMouseEnter)
      map.off('mouseleave', 'municipality-fill', handleMouseLeave)
      map.off('mousemove', 'municipality-fill', handleMouseMove)
      map.off('click', 'municipality-fill', handleClick)
    }
  }, [map, isLoaded, municipalitiesMap, onMunicipalityHover, onMunicipalityClick])

  return null
}

// ============================================
// Componente principal
// ============================================

export function BrazilMap({
  selectedState,
  activeIndicator,
  municipalities,
  loading,
  onMunicipalityHover,
  mode = 'indicadores',
  classificacaoByIbge,
}: BrazilMapProps) {
  const navigate = useNavigate()
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(null)
  const [hoveredMunicipality, setHoveredMunicipality] = useState<MunicipalityWithIndicators | null>(null)
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityWithIndicators | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { maskData } = useBrazilMask()

  const stateConfig = BRAZIL_STATES.find((s) => s.uf === selectedState) as BrazilState | undefined
  const [longitude, latitude] = stateConfig?.centerCoordinates || [-44.5, -18.5]
  const zoom = stateConfig?.zoom || 6

  const indicatorConfig = INDICATOR_CONFIGS[activeIndicator]

  // Obter classificacao do municipio hover (para tooltip)
  const hoveredClassificacao = useMemo(() => {
    if (!hoveredMunicipality || !classificacaoByIbge) return null
    return classificacaoByIbge.get(hoveredMunicipality.codigoIbge) || null
  }, [hoveredMunicipality, classificacaoByIbge])

  // Obter classificacao do municipio selecionado (para card)
  const selectedClassificacao = useMemo((): CategoriaClassificacao | null => {
    if (!selectedMunicipality || !classificacaoByIbge) return null
    const classificacao = classificacaoByIbge.get(selectedMunicipality.codigoIbge)
    return classificacao?.categoria || null
  }, [selectedMunicipality, classificacaoByIbge])

  // Mapa de municipios por codigo IBGE
  const municipalitiesMap = useMemo(() => {
    const record: Record<string, MunicipalityWithIndicators> = {}
    municipalities.forEach((m) => {
      record[m.codigoIbge] = m
    })
    return record
  }, [municipalities])

  // Calcular range de dados para o indicador atual
  const dataRange = useMemo(() => {
    const values = municipalities
      .map((m) => m.indicators[activeIndicator])
      .filter((v): v is number => v !== null && v !== undefined)

    if (values.length === 0) return { min: 0, max: 100 }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }, [municipalities, activeIndicator])

  // Carregar GeoJSON e enriquecer com dados de indicadores e/ou classificacao
  useEffect(() => {
    const loadGeoJSON = async () => {
      if (municipalities.length === 0 || !stateConfig) return

      setIsLoading(true)
      try {
        const data = await fetchStateGeoJSON(stateConfig.ibgeCode)

        const enrichedFeatures = data.features.map((feature) => {
          const props = feature.properties as { codarea?: string } | null
          const ibgeCode = props?.codarea
          const municipality = ibgeCode ? municipalitiesMap[String(ibgeCode)] : null

          const indicatorValue = municipality?.indicators[activeIndicator] ?? null

          // Obter classificacao se disponivel
          const classificacao = ibgeCode && classificacaoByIbge
            ? classificacaoByIbge.get(String(ibgeCode))
            : null

          return {
            ...feature,
            properties: {
              ...feature.properties,
              codigoIbge: ibgeCode,
              nome: municipality?.nome || `Municipio ${ibgeCode}`,
              indicatorValue,
              // Adicionar dados de classificacao
              categoria: classificacao?.categoria || null,
              condicoesDeterminantes: classificacao?.condicoes_determinantes || [],
            },
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
  }, [selectedState, municipalities, municipalitiesMap, activeIndicator, stateConfig, classificacaoByIbge])

  // Handler para hover
  const handleHover = useCallback(
    (municipality: MunicipalityWithIndicators | null) => {
      setHoveredMunicipality(municipality)
      onMunicipalityHover?.(municipality)
    },
    [onMunicipalityHover]
  )

  // Handler para click - abre card com informacoes do municipio
  const handleClick = useCallback(
    (municipality: MunicipalityWithIndicators) => {
      setSelectedMunicipality(municipality)
    },
    []
  )

  // Handler para fechar card
  const handleCloseCard = useCallback(() => {
    setSelectedMunicipality(null)
  }, [])

  // Handler para navegar do card para briefing
  const handleNavigateFromCard = useCallback(() => {
    if (selectedMunicipality) {
      navigate(`/municipio/${selectedMunicipality.codigoIbge}`)
    }
  }, [navigate, selectedMunicipality])

  return (
    <div className="relative w-full h-full">
      <Map center={[longitude, latitude]} zoom={zoom} className="w-full h-full">
        <MapControls position="bottom-right" showZoom />
        {maskData && <BrazilMaskLayer maskData={maskData} />}
        {geojsonData && (
          <MunicipalityLayers
            geojsonData={geojsonData}
            activeIndicator={activeIndicator}
            dataRange={dataRange}
            municipalitiesMap={municipalitiesMap}
            onMunicipalityHover={handleHover}
            onMunicipalityClick={handleClick}
            mode={mode}
          />
        )}
        {(isLoading || loading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
            <div className="text-sm text-muted-foreground">Carregando municipios...</div>
          </div>
        )}
      </Map>

      {/* Card do municipio selecionado */}
      {selectedMunicipality && (
        <div className="absolute top-1/2 left-4 -translate-y-1/2 z-30">
          <MunicipalityCard
            municipality={selectedMunicipality}
            categoria={selectedClassificacao}
            onClose={handleCloseCard}
            onNavigate={handleNavigateFromCard}
          />
        </div>
      )}

      {/* Tooltip */}
      {hoveredMunicipality && !selectedMunicipality && (
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border px-3 py-2 z-10 pointer-events-none max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{hoveredMunicipality.nome}</p>
            <p className="text-sm text-muted-foreground">
              {hoveredMunicipality.mesorregiao} · {hoveredMunicipality.uf}
            </p>

            {mode === 'classificacao' && hoveredClassificacao ? (
              // Tooltip de classificacao
              <div className="pt-1 border-t space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm border"
                    style={{
                      backgroundColor: CATEGORIA_CONFIGS[hoveredClassificacao.categoria].bgColor,
                      borderColor: CATEGORIA_CONFIGS[hoveredClassificacao.categoria].borderColor,
                    }}
                  />
                  <span className="text-sm font-medium">
                    {CATEGORIA_CONFIGS[hoveredClassificacao.categoria].label}
                  </span>
                </div>
                {hoveredClassificacao.condicoes_determinantes.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {hoveredClassificacao.condicoes_determinantes.slice(0, 2).join(' · ')}
                    {hoveredClassificacao.condicoes_determinantes.length > 2 && (
                      <span> +{hoveredClassificacao.condicoes_determinantes.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            ) : mode === 'classificacao' ? (
              // Municipio sem classificacao
              <div className="pt-1 border-t">
                <span className="text-xs text-muted-foreground">Sem classificacao</span>
              </div>
            ) : (
              // Tooltip de indicador
              <div className="flex items-center gap-2 pt-1 border-t">
                <span className="text-sm font-medium">{indicatorConfig.label}:</span>
                <span className="text-sm">
                  {indicatorConfig.format(hoveredMunicipality.indicators[activeIndicator] ?? null)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BrazilMap
