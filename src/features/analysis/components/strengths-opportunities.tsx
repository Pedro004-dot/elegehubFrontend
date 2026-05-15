import { Shield, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CompetitorAttribute } from '../types'

interface StrengthsOpportunitiesProps {
  strengths: CompetitorAttribute[]
  opportunities: CompetitorAttribute[]
}

export function StrengthsOpportunities({
  strengths,
  opportunities,
}: StrengthsOpportunitiesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-green-500" />
            Pontos Fortes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {strengths.map((item) => (
            <div key={item.id} className="space-y-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {opportunities.map((item) => (
            <div key={item.id} className="space-y-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
