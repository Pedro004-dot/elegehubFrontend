import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface BigNumberProps {
  value: string | number
  label: string
  prefix?: string
  suffix?: string
  trend?: number // percentage, positive or negative
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: {
    label: 'text-caption',
    value: 'text-h2',
    trend: 'text-small',
  },
  md: {
    label: 'text-caption',
    value: 'text-display-sm',
    trend: 'text-small',
  },
  lg: {
    label: 'text-small',
    value: 'text-display',
    trend: 'text-body',
  },
}

export function BigNumber({
  value,
  label,
  prefix,
  suffix,
  trend,
  size = 'md',
  className,
}: BigNumberProps) {
  const classes = sizeClasses[size]
  const isNumeric = typeof value === 'number' || !isNaN(Number(value))

  const formattedValue = isNumeric
    ? new Intl.NumberFormat('pt-BR').format(Number(value))
    : value

  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn(
        classes.label,
        'text-eyebrow text-ink-tertiary'
      )}>
        {label}
      </span>

      <div className="flex items-baseline gap-2 mt-1">
        <span className={cn(
          classes.value,
          'font-bold text-ink-display',
          isNumeric && 'tabular-nums font-mono'
        )}>
          {prefix}{formattedValue}{suffix}
        </span>

        {trend !== undefined && trend !== 0 && (
          <span className={cn(
            classes.trend,
            'flex items-center gap-0.5 font-medium',
            trend > 0 ? 'text-success' : 'text-danger'
          )}>
            {trend > 0 ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}
