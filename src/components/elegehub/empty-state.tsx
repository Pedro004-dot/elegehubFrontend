import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-16 px-6',
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-ink-tertiary" />
        </div>
      )}

      <h3 className="text-h2 font-semibold text-ink-display">
        {title}
      </h3>

      {description && (
        <p className="text-body text-ink-secondary mt-2 max-w-md">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex gap-3 mt-6">
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
