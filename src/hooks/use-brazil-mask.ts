import { useState, useEffect } from 'react'
import type { FeatureCollection } from 'geojson'
import { fetchBrazilOutline, createMaskGeoJSON } from '@/features/strategic-map/services/brazil-mask'

/**
 * Hook para carregar a máscara do Brasil.
 * A máscara é um GeoJSON que cobre o mundo inteiro com um "buraco" no formato do Brasil.
 * Usado para ocultar países vizinhos no mapa.
 *
 * @returns { maskData, isLoading } - O GeoJSON da máscara e o estado de carregamento
 */
export function useBrazilMask() {
  const [maskData, setMaskData] = useState<FeatureCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadMask() {
      try {
        setIsLoading(true)
        setError(null)

        const brazilOutline = await fetchBrazilOutline()
        const mask = createMaskGeoJSON(brazilOutline)

        if (!cancelled) {
          setMaskData(mask)
        }
      } catch (err) {
        console.error('Erro ao carregar máscara do Brasil:', err)
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadMask()

    return () => {
      cancelled = true
    }
  }, [])

  return { maskData, isLoading, error }
}
