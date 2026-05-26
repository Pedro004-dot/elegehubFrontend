/**
 * IndicatorFilter - Seletor de indicador para coloracao do mapa
 *
 * Permite ao usuario escolher qual indicador sera usado para
 * colorir os municipios no mapa exploratorio.
 */

import { Layers } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { INDICATOR_CONFIGS, type IndicatorId } from '../types'

interface IndicatorFilterProps {
  value: IndicatorId
  onChange: (indicator: IndicatorId) => void
  disabled?: boolean
}

const AVAILABLE_INDICATORS: IndicatorId[] = [
  'percentual_voto_partido',
  'saldo_caged',
  'cobertura_psf',
  'populacao',
  'taxa_abstencao',
]

export function IndicatorFilter({ value, onChange, disabled }: IndicatorFilterProps) {
  const currentConfig = INDICATOR_CONFIGS[value]

  const handleValueChange = (newValue: string | null) => {
    if (newValue) {
      onChange(newValue as IndicatorId)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-help">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Colorir por:</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Escolha o indicador para colorir o mapa
        </TooltipContent>
      </Tooltip>

      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione o indicador" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_INDICATORS.map((indicatorId) => {
            const config = INDICATOR_CONFIGS[indicatorId]
            return (
              <SelectItem key={indicatorId} value={indicatorId}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{
                      background: `linear-gradient(90deg, ${config.colorScale[0]}, ${config.colorScale[4]})`,
                    }}
                  />
                  <span>{config.label}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <span className="text-xs text-muted-foreground hidden md:inline">
        {currentConfig.description}
      </span>
    </div>
  )
}

export default IndicatorFilter
