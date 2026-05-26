/**
 * IndicatorLegend - Legenda dinamica para o indicador selecionado
 *
 * Mostra a escala de cores do indicador atual no mapa,
 * com valores de referencia para facilitar a leitura.
 */

import { INDICATOR_CONFIGS, type IndicatorId } from '../types'

interface IndicatorLegendProps {
  indicatorId: IndicatorId
  /** Valores min/max observados nos dados atuais */
  dataRange?: { min: number; max: number }
}

export function IndicatorLegend({ indicatorId, dataRange }: IndicatorLegendProps) {
  const config = INDICATOR_CONFIGS[indicatorId]
  const { colorScale, higherIsBetter, format, label, unit } = config

  // Calcular valores de referencia para a legenda
  const min = dataRange?.min ?? 0
  const max = dataRange?.max ?? 100
  const mid = (min + max) / 2

  // Se menor e melhor, invertemos a ordem visual
  const colors = higherIsBetter ? colorScale : [...colorScale].reverse()

  return (
    <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border p-3 z-10">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">{label}</span>
          {unit && <span className="text-xs text-muted-foreground">({unit})</span>}
        </div>

        {/* Barra de gradiente */}
        <div
          className="h-3 w-48 rounded-sm"
          style={{
            background: `linear-gradient(90deg, ${colors.join(', ')})`,
          }}
        />

        {/* Valores de referencia */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{format(min)}</span>
          <span>{format(mid)}</span>
          <span>{format(max)}</span>
        </div>

        {/* Indicacao de melhor/pior */}
        <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
          <span>{higherIsBetter ? 'Menor' : 'Melhor'}</span>
          <span>{higherIsBetter ? 'Maior' : 'Pior'}</span>
        </div>
      </div>
    </div>
  )
}

export default IndicatorLegend
