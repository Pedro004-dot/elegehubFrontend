import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CompetitorSummary, ThreatLevel } from '../types'

interface CompetitorSpotlightProps {
  summary: CompetitorSummary
}

const threatConfig: Record<ThreatLevel, { label: string; variant: 'destructive' | 'secondary' | 'outline' }> = {
  ALTA: { label: 'Alta Ameaça', variant: 'destructive' },
  MEDIA: { label: 'Média Ameaça', variant: 'secondary' },
  BAIXA: { label: 'Baixa Ameaça', variant: 'outline' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`
  }
  return `R$ ${(value / 1000).toFixed(0)}k`
}

function formatVotes(votes: number): string {
  if (votes >= 1000) {
    return `${(votes / 1000).toFixed(0)}k`
  }
  return votes.toString()
}

export function CompetitorSpotlight({ summary }: CompetitorSpotlightProps) {
  const { primaryThreat, otherCompetitors } = summary
  const threatBadge = threatConfig[primaryThreat.threatLevel]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Inteligência Competitiva
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary threat card */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {primaryThreat.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {primaryThreat.party}
              </p>
            </div>
            <Badge variant={threatBadge.variant}>{threatBadge.label}</Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Votos 2022</p>
              <p className="font-medium text-foreground">
                {formatVotes(primaryThreat.votes2022)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Gasto</p>
              <p className="font-medium text-foreground">
                {formatCurrency(primaryThreat.spending)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Foco: {primaryThreat.focus}
          </p>
        </div>

        {/* Other competitors */}
        {otherCompetitors.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Outros:{' '}
            {otherCompetitors
              .map((c) => `${c.name} (${c.party})`)
              .join(' · ')}
          </div>
        )}

        {/* CTA */}
        <Link
          to="/analise/radar-adversarios"
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full' })}
        >
          Ver radar completo
        </Link>
      </CardContent>
    </Card>
  )
}
