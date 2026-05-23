import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-small font-medium',
  {
    variants: {
      variant: {
        opportunity: 'bg-success/10 text-success',
        attention: 'bg-warning/10 text-warning',
        risk: 'bg-danger/10 text-danger',
        neutral: 'bg-surface-muted text-ink-secondary',
        brand: 'bg-brand-subtle text-brand',
        completed: 'bg-success/10 text-success',
        running: 'bg-brand-subtle text-brand',
        pending: 'bg-surface-muted text-ink-tertiary',
        failed: 'bg-danger/10 text-danger',
        cancelled: 'bg-surface-muted text-ink-muted',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
  dot?: boolean
  className?: string
}

export function StatusBadge({
  children,
  variant,
  dot = false,
  className,
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'opportunity' && 'bg-success',
          variant === 'attention' && 'bg-warning',
          variant === 'risk' && 'bg-danger',
          variant === 'neutral' && 'bg-ink-muted',
          variant === 'brand' && 'bg-brand',
          variant === 'completed' && 'bg-success',
          variant === 'running' && 'bg-brand animate-pulse',
          variant === 'pending' && 'bg-ink-muted',
          variant === 'failed' && 'bg-danger',
          variant === 'cancelled' && 'bg-ink-muted',
        )} />
      )}
      {children}
    </span>
  )
}
