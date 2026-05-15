import { Slider } from '@/components/ui/slider'
import { BUDGET_CONFIG } from '../types'

interface BudgetSliderProps {
  value: number
  onChange: (value: number) => void
}

export function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Orcamento de Campanha
        </label>
      </div>

      <div className="space-y-2">
        <Slider
          min={BUDGET_CONFIG.min}
          max={BUDGET_CONFIG.max}
          step={BUDGET_CONFIG.step}
          value={[value]}
          onValueChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v
            onChange(val)
          }}
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{BUDGET_CONFIG.format(BUDGET_CONFIG.min)}</span>
          <span className="text-base font-semibold text-foreground">
            {BUDGET_CONFIG.format(value)}
          </span>
          <span>{BUDGET_CONFIG.format(BUDGET_CONFIG.max)}</span>
        </div>
      </div>
    </div>
  )
}
