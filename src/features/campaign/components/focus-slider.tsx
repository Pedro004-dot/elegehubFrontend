import { Slider } from '@/components/ui/slider'
import { FOCUS_CONFIG } from '../types'

interface FocusSliderProps {
  value: number
  onChange: (value: number) => void
}

export function FocusSlider({ value, onChange }: FocusSliderProps) {
  const capitalPercent = value
  const interiorPercent = 100 - value

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Foco Geografico
        </label>
      </div>

      <div className="space-y-2">
        <Slider
          min={FOCUS_CONFIG.min}
          max={FOCUS_CONFIG.max}
          step={1}
          value={[value]}
          onValueChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v
            onChange(val)
          }}
        />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">100% Capital</span>
          <span className="text-sm font-semibold text-foreground">
            {capitalPercent}% / {interiorPercent}%
          </span>
          <span className="text-muted-foreground">100% Interior</span>
        </div>
      </div>
    </div>
  )
}
