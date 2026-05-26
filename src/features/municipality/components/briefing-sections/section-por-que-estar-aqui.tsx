/**
 * SectionPorQueEstarAqui - Secao 1 do briefing
 *
 * Exibe razoes objetivas e mensuraveis para priorizar o municipio
 * Ordenadas por prioridade (1 = maior impacto)
 */

import { MapPin, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { RazaoVisita } from '../../types'

interface SectionPorQueEstarAquiProps {
  razoes: RazaoVisita[]
}

const priorityColors: Record<number, string> = {
  1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  5: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
}

export function SectionPorQueEstarAqui({ razoes }: SectionPorQueEstarAquiProps) {
  const sortedRazoes = [...razoes].sort((a, b) => a.prioridade - b.prioridade)

  if (sortedRazoes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Por que estar aqui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhuma razao de visita identificada.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Por que estar aqui
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedRazoes.map((razao, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {razao.titulo}
              </h4>
              <Badge
                variant="secondary"
                className={priorityColors[razao.prioridade] || priorityColors[5]}
              >
                #{razao.prioridade}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">
                {razao.dado}
              </p>
              <p className="text-sm text-muted-foreground">
                {razao.contexto}
              </p>
              <p className="text-xs text-muted-foreground/70 italic">
                Fonte: {razao.fonte}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default SectionPorQueEstarAqui
