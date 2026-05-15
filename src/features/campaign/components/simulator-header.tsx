import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SimulatorHeader() {
  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Simulador de Cenario Eleitoral
        </h1>
        <p className="text-sm text-muted-foreground">
          Ajuste as variaveis e veja a projecao territorial em tempo real
        </p>
      </div>
      <Badge variant="outline" className="gap-1.5 text-xs font-normal">
        <Info className="h-3 w-3" />
        Estimativa baseada em padroes historicos de candidatos similares. Nao
        constitui previsao eleitoral.
      </Badge>
    </div>
  )
}
