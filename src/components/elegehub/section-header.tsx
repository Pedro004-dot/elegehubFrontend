import { cn } from '@/lib/utils'
import { EyebrowLabel } from './eyebrow-label'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="space-y-2">
        {eyebrow && <EyebrowLabel>{eyebrow}</EyebrowLabel>}
        <h2 className="text-h1 font-bold text-ink-display">{title}</h2>
        {description && (
          <p className="text-body-lg text-ink-secondary max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
