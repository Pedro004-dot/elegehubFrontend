import { cn } from '@/lib/utils'

interface InlineQuoteProps {
  children: React.ReactNode
  accentColor?: 'brand' | 'success' | 'warning' | 'danger'
  variant?: 'brand' | 'success' | 'warning' | 'danger'
  icon?: React.ReactNode
  className?: string
}

const accentClasses = {
  brand: 'border-l-brand',
  success: 'border-l-success',
  warning: 'border-l-warning',
  danger: 'border-l-danger',
}

export function InlineQuote({
  children,
  accentColor,
  variant,
  icon,
  className,
}: InlineQuoteProps) {
  const color = variant || accentColor || 'brand'

  return (
    <blockquote className={cn(
      'border-l-2 pl-4 py-1',
      accentClasses[color],
      className
    )}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className={cn(
            'shrink-0',
            color === 'brand' && 'text-brand',
            color === 'success' && 'text-success',
            color === 'warning' && 'text-warning',
            color === 'danger' && 'text-danger'
          )}>
            {icon}
          </span>
        )}
        <p className="text-body-lg italic text-ink-display leading-relaxed">
          {children}
        </p>
      </div>
    </blockquote>
  )
}
