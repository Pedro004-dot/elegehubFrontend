import { cn } from '@/lib/utils'
import { getViralScoreStars, getViralScoreColor } from '../../types/video-cuts'

interface ViralScoreMeterProps {
  score: number
  reasons?: string[]
  showReasons?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ViralScoreMeter({
  score,
  reasons,
  showReasons = false,
  size = 'md',
  className,
}: ViralScoreMeterProps) {
  const stars = getViralScoreStars(score)
  const color = getViralScoreColor(score)

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const barHeightClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className={cn('flex items-center gap-1.5', sizeClasses[size])}>
          <span className="font-medium" style={{ color }}>
            {score}
          </span>
          <span className="text-muted-foreground">/100</span>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'transition-opacity',
                i < stars ? 'opacity-100' : 'opacity-30'
              )}
              style={{ color: i < stars ? color : undefined }}
            >
              {size === 'sm' ? '★' : '⭐'}
            </span>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className={cn('w-full rounded-full bg-muted', barHeightClasses[size])}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${score}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Reasons */}
      {showReasons && reasons && reasons.length > 0 && (
        <div className="space-y-1 pt-2">
          <p className="text-xs font-medium text-muted-foreground">Por que esse score?</p>
          <ul className="space-y-0.5">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="mt-0.5 text-[10px]" style={{ color }}>•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
