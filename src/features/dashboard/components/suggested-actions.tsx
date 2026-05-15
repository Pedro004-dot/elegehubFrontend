import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import type { SuggestedAction } from '../types'

interface SuggestedActionsProps {
  actions: SuggestedAction[]
}

export function SuggestedActions({ actions }: SuggestedActionsProps) {
  if (actions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Próximos Passos Sugeridos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Link
              key={action.id}
              to={action.actionPath}
              className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="text-xl">{action.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {index + 1}. {action.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
                {action.metric && (
                  <p className="mt-1 text-xs font-medium text-primary">
                    {action.metric}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
