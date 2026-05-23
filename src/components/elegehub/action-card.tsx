import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface ActionCardProps {
  icon: LucideIcon
  title: string
  description?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  disabled = false,
  className,
}: ActionCardProps) {
  return (
    <Card
      className={cn(
        'p-6 transition-all cursor-pointer',
        !disabled && 'hover:bg-surface-hover hover:border-border',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-lg bg-brand-subtle flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-brand" />
        </div>
        <h3 className="text-h3 font-semibold text-ink-display">
          {title}
        </h3>
        {description && (
          <p className="text-small text-ink-secondary mt-1">
            {description}
          </p>
        )}
      </div>
    </Card>
  )
}
