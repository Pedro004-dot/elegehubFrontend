/**
 * SectionOQueTePegado - Secao 3 do briefing
 *
 * Exibe temas locais relevantes para discurso
 * Cada tema inclui justificativa e gancho de discurso falavel
 */

import { MessageSquare, Quote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TemaLocal } from '../../types'

interface SectionOQueTePegadoProps {
  temas: TemaLocal[]
}

export function SectionOQueTePegado({ temas }: SectionOQueTePegadoProps) {
  if (temas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            O que tem pegado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhum tema de discurso identificado.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          O que tem pegado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {temas.map((tema, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            {/* Titulo do tema */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="font-semibold">
                {tema.tema}
              </Badge>
            </div>

            {/* Porque e relevante */}
            <p className="text-sm text-muted-foreground mb-3">
              {tema.porqueRelevante}
            </p>

            {/* Gancho de discurso - destaque visual */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-3">
              <div className="flex items-start gap-2">
                <Quote className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium italic text-foreground">
                  "{tema.ganchoDiscurso}"
                </p>
              </div>
            </div>

            {/* Fonte */}
            <p className="text-xs text-muted-foreground/70 italic mt-2">
              Fonte: {tema.fonte}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default SectionOQueTePegado
