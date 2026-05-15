import { Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CompetitorHeader() {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Analise Competitiva
          </h1>
          <p className="text-sm text-muted-foreground">
            Mapeamento dos principais adversarios provaveis · Atualizado
            mensalmente
          </p>
        </div>
      </div>
      <Badge variant="outline" className="gap-1.5 text-xs font-normal">
        <Shield className="h-3 w-3" />
        Analise baseada exclusivamente em dados publicos (TSE, prestacao de
        contas, declaracoes publicas)
      </Badge>
    </div>
  )
}
