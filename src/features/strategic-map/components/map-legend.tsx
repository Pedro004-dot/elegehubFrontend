import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { MunicipalityClassification } from '../types'
import { CLASSIFICATION_CONFIG } from '../types'

export function MapLegend() {
  const classifications: MunicipalityClassification[] = ['consolidar', 'conquistar', 'disputar', 'evitar']

  return (
    <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border p-3 z-10">
      <div className="flex items-center gap-4">
        {classifications.map((classification) => {
          const config = CLASSIFICATION_CONFIG[classification]

          return (
            <Tooltip key={classification}>
              <TooltipTrigger>
                <div className="flex items-center gap-1.5 cursor-help">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs font-medium">{config.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-sm">{config.description}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
