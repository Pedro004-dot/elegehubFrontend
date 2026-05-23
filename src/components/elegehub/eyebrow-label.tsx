import { cn } from '@/lib/utils'

interface EyebrowLabelProps {
  children: React.ReactNode
  className?: string
}

export function EyebrowLabel({ children, className }: EyebrowLabelProps) {
  return (
    <span className={cn(
      'text-eyebrow text-ink-tertiary',
      className
    )}>
      {children}
    </span>
  )
}
