import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { SpendingHistoryItem } from '../types'
import { SPENDING_CATEGORY_CONFIG } from '../types'

interface SpendingBreakdownProps {
  spendingHistory: SpendingHistoryItem[]
  totalSpending: number
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `R$ ${Math.round(value / 1000)}k`
  }
  return `R$ ${value}`
}

export function SpendingBreakdown({
  spendingHistory,
  totalSpending,
}: SpendingBreakdownProps) {
  const sortedSpending = [...spendingHistory].sort(
    (a, b) => b.amount - a.amount
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Historico de Gastos de Campanha
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {formatCurrency(totalSpending)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedSpending.map((item) => {
          const config = SPENDING_CATEGORY_CONFIG[item.category]
          return (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{config.label}</span>
                <span className="font-medium">
                  {formatCurrency(item.amount)}
                </span>
              </div>
              <div className="relative">
                <Progress value={item.percentage} className="h-2" />
                <div
                  className="absolute inset-0 h-2 rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {item.percentage}%
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
