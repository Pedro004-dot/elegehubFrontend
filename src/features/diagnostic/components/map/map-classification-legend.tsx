/**
 * MapClassificationLegend
 *
 * Floating legend showing classification colors and counts.
 */

import { cn } from '@/lib/utils'
import type { TerritorialClassification } from '../../types'

interface ClassificationCount {
  classification: TerritorialClassification
  count: number
  eleitores: number
}

interface MapClassificationLegendProps {
  counts: ClassificationCount[]
  className?: string
}

const CLASSIFICATION_CONFIG: Record<
  TerritorialClassification,
  { label: string; color: string }
> = {
  fiel: { label: 'Fiel', color: '#22c55e' },
  pendular: { label: 'Pendular', color: '#eab308' },
  disputavel: { label: 'Disputável', color: '#f97316' },
  hostil: { label: 'Hostil', color: '#ef4444' },
  alta_abstencao: { label: 'Alta Abstenção', color: '#71717a' },
}

export function MapClassificationLegend({
  counts,
  className,
}: MapClassificationLegendProps) {
  const total = counts.reduce((sum, c) => sum + c.count, 0)

  return (
    <div
      className={cn(
        'bg-white/95 backdrop-blur-sm rounded-lg border border-border shadow-lg p-4',
        className
      )}
    >
      <h4 className="text-small font-medium text-ink-display mb-3">
        Classificacao Territorial
      </h4>
      <div className="space-y-2">
        {counts.map(({ classification, count, eleitores }) => {
          const config = CLASSIFICATION_CONFIG[classification]
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0'

          return (
            <div key={classification} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-small text-ink-primary">
                    {config.label}
                  </span>
                  <span className="text-small font-mono text-ink-secondary tabular-nums">
                    {count}
                  </span>
                </div>
                <div className="flex items-center justify-between text-caption text-ink-tertiary">
                  <span>{percentage}%</span>
                  <span className="font-mono tabular-nums">
                    {eleitores.toLocaleString('pt-BR')} eleitores
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-small font-medium text-ink-display">Total</span>
        <span className="text-small font-mono text-ink-display tabular-nums">
          {total} municipios
        </span>
      </div>
    </div>
  )
}
