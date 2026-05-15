import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import type { DashboardMetrics } from '../types'

interface HeroMetricsProps {
  metrics: DashboardMetrics
}

function formatVotes(votes: number): string {
  if (votes >= 1000000) {
    return `${(votes / 1000000).toFixed(1)}M`
  }
  return `${(votes / 1000).toFixed(0)}k`
}

function TrendIndicator({
  value,
  suffix = '%',
}: {
  value: number
  suffix?: string
}) {
  const isPositive = value > 0
  const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500'

  return (
    <span className={`flex items-center gap-0.5 text-sm ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}
      {suffix}
    </span>
  )
}

export function HeroMetrics({ metrics }: HeroMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Projected Votes */}
      <Link to="/campanha/simulador">
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Votos Projetados
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">
                {formatVotes(metrics.projectedVotes)}
              </span>
              <TrendIndicator value={metrics.voteTrend} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              vs. semana passada
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Election Probability */}
      <Link to="/campanha/simulador">
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Probabilidade de Eleição
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">
                {metrics.electionProbability}%
              </span>
              <TrendIndicator value={metrics.probabilityTrend} suffix="pp" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              vs. semana passada
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Performance vs Baseline */}
      <Link to="/campanha/simulador">
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              vs. Cenário Base
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">
                +{metrics.performanceVsBaseline}%
              </span>
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                Bom
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              melhoria com otimização
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
