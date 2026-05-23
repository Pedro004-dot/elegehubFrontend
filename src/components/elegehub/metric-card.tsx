import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { BigNumber } from './big-number'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  value: string | number
  label: string
  prefix?: string
  suffix?: string
  trend?: number
  description?: string
  icon?: LucideIcon
  accentColor?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral'
  className?: string
}

const accentClasses = {
  brand: 'border-l-brand',
  success: 'border-l-success',
  warning: 'border-l-warning',
  danger: 'border-l-danger',
  neutral: 'border-l-border',
}

export function MetricCard({
  value,
  label,
  prefix,
  suffix,
  trend,
  description,
  icon: Icon,
  accentColor,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn(
      'p-6',
      accentColor && `border-l-4 ${accentClasses[accentColor]}`,
      className
    )}>
      <div className="flex items-start justify-between">
        <BigNumber
          value={value}
          label={label}
          prefix={prefix}
          suffix={suffix}
          trend={trend}
          size="md"
        />
        {Icon && (
          <Icon className="w-6 h-6 text-ink-muted flex-shrink-0" />
        )}
      </div>
      {description && (
        <p className="text-small text-ink-secondary mt-3">
          {description}
        </p>
      )}
    </Card>
  )
}
