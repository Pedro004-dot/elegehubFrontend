import { Card, CardContent } from '@/components/ui/card'
import type { MunicipalityClassification } from '../types'
import { CLASSIFICATION_CONFIG } from '../types'

interface KpiCardsProps {
  data: Record<MunicipalityClassification, { count: number; potentialVotes: number }>
  totalPotential: number
  historicalTarget: number
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

export function KpiCards({ data, totalPotential, historicalTarget }: KpiCardsProps) {
  const margin = Math.floor(totalPotential / historicalTarget)
  const classifications: MunicipalityClassification[] = ['consolidar', 'conquistar', 'disputar', 'evitar']

  return (
    <div className="px-6 py-4 border-b bg-muted/30">
      <div className="grid grid-cols-4 gap-4">
        {classifications.map((classification) => {
          const config = CLASSIFICATION_CONFIG[classification]
          const kpi = data[classification]

          return (
            <Card key={classification} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      {config.label}
                    </p>
                    <p className="text-2xl font-bold font-mono tracking-tight">
                      {kpi.count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      municípios
                    </p>
                    {classification !== 'evitar' && (
                      <p className="text-sm font-medium mt-1" style={{ color: config.color }}>
                        {formatNumber(kpi.potentialVotes)} votos
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground mt-3 text-center">
        Potencial total estimado:{' '}
        <span className="font-semibold text-foreground">
          {formatNumber(totalPotential)} votos
        </span>
        {' · '}
        Sua meta histórica:{' '}
        <span className="font-semibold text-foreground">
          {formatNumber(historicalTarget)} votos
        </span>
        {' · '}
        Margem disponível:{' '}
        <span className="font-semibold text-green-600">
          {margin}x
        </span>
      </p>
    </div>
  )
}
