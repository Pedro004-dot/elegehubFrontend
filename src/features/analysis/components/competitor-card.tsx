import { User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Competitor } from '../types'
import { THREAT_LEVEL_CONFIG } from '../types'

interface CompetitorCardProps {
  competitor: Competitor
  isSelected: boolean
  onSelect: (competitor: Competitor) => void
}

function formatVotes(votes: number): string {
  if (votes >= 1000000) {
    return `${(votes / 1000000).toFixed(1)}M votos`
  }
  if (votes >= 1000) {
    return `${Math.round(votes / 1000)}k votos`
  }
  return `${votes} votos`
}

export function CompetitorCard({
  competitor,
  isSelected,
  onSelect,
}: CompetitorCardProps) {
  const threatConfig = THREAT_LEVEL_CONFIG[competitor.threatLevel]

  return (
    <Card
      className={cn(
        'min-w-[200px] cursor-pointer p-4 transition-all hover:ring-2 hover:ring-primary/50',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={() => onSelect(competitor)}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {competitor.photoUrl ? (
            <img
              src={competitor.photoUrl}
              alt={competitor.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase leading-tight">
            {competitor.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {competitor.partyAcronym} · {competitor.age} anos
          </p>
          {competitor.currentPosition && (
            <p className="text-xs text-muted-foreground">
              {competitor.currentPosition}
            </p>
          )}
        </div>

        <p className="text-sm font-medium">
          {formatVotes(competitor.lastElection.votes)}
          <span className="text-muted-foreground">
            {' '}
            ({competitor.lastElection.year})
          </span>
        </p>

        <Badge className={cn(threatConfig.bgColor, threatConfig.textColor, 'border-0')}>
          AMEACA {competitor.threatLevel}
        </Badge>
      </div>
    </Card>
  )
}
