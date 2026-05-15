import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ScenarioOutput, SimulatorComparison } from '../types'

interface ProjectionResultsProps {
  output: ScenarioOutput
  comparison: SimulatorComparison
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}

function formatPercent(value: number, showSign = false): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(0)}%`
}

export function ProjectionResults({
  output,
  comparison,
}: ProjectionResultsProps) {
  const isPositive = comparison.votesDiffPercent > 0

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Projecao de Resultado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight">
            {formatNumber(output.projectedVotes)}
          </p>
          <p className="text-sm text-muted-foreground">votos estimados</p>
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-semibold">
            {output.electionProbability}%
          </p>
          <p className="text-sm text-muted-foreground">
            probabilidade de eleicao
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            vs. Cenario Base (sem otimizacao)
          </p>

          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-semibold',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatPercent(comparison.votesDiffPercent, true)} votos
            </div>

            <div
              className={cn(
                'flex items-center gap-1 text-sm font-semibold',
                comparison.probabilityDiff > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              )}
            >
              {comparison.probabilityDiff > 0 ? '+' : ''}
              {comparison.probabilityDiff} pp probabilidade
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
