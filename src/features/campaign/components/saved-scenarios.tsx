import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SavedScenario } from '../types'

interface SavedScenariosProps {
  scenarios: SavedScenario[]
  onLoad: (scenarioId: string) => void
  onSaveNew: () => void
}

function formatVotes(votes: number): string {
  if (votes >= 1000) {
    return `${Math.round(votes / 1000)}k`
  }
  return votes.toString()
}

export function SavedScenarios({
  scenarios,
  onLoad,
  onSaveNew,
}: SavedScenariosProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Cenarios Salvos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
            >
              <span className="text-lg">{scenario.emoji}</span>
              <div className="text-sm">
                <span className="font-medium">{scenario.name}</span>
                <span className="ml-2 text-muted-foreground">
                  {formatVotes(scenario.projectedVotes)} votos
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-7 text-xs"
                onClick={() => onLoad(scenario.id)}
              >
                carregar
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={onSaveNew}
          >
            <Plus className="h-4 w-4" />
            Novo cenario
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
