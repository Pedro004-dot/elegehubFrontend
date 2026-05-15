import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SuggestedStrategy } from '../types'

interface SuggestedStrategiesProps {
  strategies: SuggestedStrategy[]
  competitorName: string
}

export function SuggestedStrategies({
  strategies,
  competitorName,
}: SuggestedStrategiesProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          Estrategias Sugeridas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Recomendacoes taticas considerando o perfil de {competitorName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="space-y-1">
            <p className="text-sm font-medium">
              {strategy.emoji} {strategy.title}
            </p>
            <p className="text-sm text-muted-foreground pl-5">
              {strategy.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
