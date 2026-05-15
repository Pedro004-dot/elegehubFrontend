import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Sparkles } from 'lucide-react'
import type { Alert, AlertType } from '../types'

interface AlertsPanelProps {
  alerts: Alert[]
}

const alertConfig: Record<
  AlertType,
  { icon: typeof AlertCircle; colorClass: string; bgClass: string }
> = {
  critical: {
    icon: AlertCircle,
    colorClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
  },
  warning: {
    icon: AlertTriangle,
    colorClass: 'text-yellow-500',
    bgClass: 'bg-yellow-500/10',
  },
  opportunity: {
    icon: Sparkles,
    colorClass: 'text-green-500',
    bgClass: 'bg-green-500/10',
  },
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Alertas e Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum alerta no momento. Tudo sob controle!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Alertas e Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type]
          const Icon = config.icon

          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <div className={`rounded-full p-1.5 ${config.bgClass}`}>
                <Icon className={`h-4 w-4 ${config.colorClass}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {alert.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {alert.description}
                </p>
              </div>
              <Link
                to={alert.actionPath}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                {alert.actionLabel}
              </Link>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
