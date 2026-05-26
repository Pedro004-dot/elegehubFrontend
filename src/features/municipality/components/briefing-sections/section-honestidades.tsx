/**
 * SectionHonestidades - Secao 6 do briefing
 *
 * Exibe pontos de atencao e riscos que o candidato precisa saber
 * Alertas importantes com estilo de warning
 */

import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Honestidade } from '../../types'

interface SectionHonestidadesProps {
  honestidades: Honestidade[]
}

export function SectionHonestidades({ honestidades }: SectionHonestidadesProps) {
  if (honestidades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Honestidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhum ponto de atencao identificado.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900">
      <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20">
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <ShieldAlert className="h-5 w-5" />
          Honestidades
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {honestidades.map((honestidade, index) => (
          <div
            key={index}
            className="flex gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg"
          >
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-1">
                {honestidade.titulo}
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400/90">
                {honestidade.descricao}
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-500/70 italic mt-1">
                Fonte: {honestidade.fonte}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default SectionHonestidades
