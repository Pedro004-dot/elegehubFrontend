import { useEffect, useRef } from 'react'
import { useMap } from '@/components/ui/map'
import type { FeatureCollection } from 'geojson'
import type { GeoJSONSource } from 'maplibre-gl'

interface BrazilMaskLayerProps {
  maskData: FeatureCollection
  /** ID do layer que deve ficar ACIMA da máscara (a máscara será inserida antes dele) */
  beforeLayerId?: string
}

/**
 * Componente que adiciona uma máscara sobre o mapa para ocultar países vizinhos do Brasil.
 * A máscara é um polígono que cobre o mundo inteiro com um "buraco" no formato do Brasil.
 *
 * Deve ser usado dentro de um componente Map.
 */
export function BrazilMaskLayer({ maskData, beforeLayerId }: BrazilMaskLayerProps) {
  const { map, isLoaded } = useMap()
  const layerAddedRef = useRef(false)

  useEffect(() => {
    if (!map || !isLoaded) return

    // Adicionar source da máscara
    if (!map.getSource('brazil-mask')) {
      map.addSource('brazil-mask', {
        type: 'geojson',
        data: maskData
      })
    } else {
      const source = map.getSource('brazil-mask') as GeoJSONSource
      source.setData(maskData)
    }

    // Adicionar layer da máscara
    if (!map.getLayer('brazil-mask-fill')) {
      // Determinar qual layer deve ficar acima da máscara
      const beforeLayer = beforeLayerId && map.getLayer(beforeLayerId)
        ? beforeLayerId
        : map.getLayer('municipality-fill')
          ? 'municipality-fill'
          : map.getLayer('simulator-fill')
            ? 'simulator-fill'
            : map.getLayer('territorial-circles')
              ? 'territorial-circles'
              : undefined

      map.addLayer({
        id: 'brazil-mask-fill',
        type: 'fill',
        source: 'brazil-mask',
        paint: {
          'fill-color': '#0e1014', // Cor de fundo do Carto Dark Matter
          'fill-opacity': 1
        }
      }, beforeLayer)
    }

    layerAddedRef.current = true

    return () => {
      try {
        if (map.getLayer('brazil-mask-fill')) map.removeLayer('brazil-mask-fill')
        if (map.getSource('brazil-mask')) map.removeSource('brazil-mask')
      } catch {
        // Ignorar erros se o mapa já foi destruído
      }
      layerAddedRef.current = false
    }
  }, [map, isLoaded, maskData, beforeLayerId])

  return null
}
