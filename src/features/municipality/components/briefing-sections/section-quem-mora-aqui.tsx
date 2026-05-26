/**
 * SectionQuemMoraAqui - Secao 2 do briefing
 *
 * Exibe perfil demografico e social do eleitorado
 * Inclui resumo da persona e indicadores chave
 */

import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { QuemMoraAqui } from '../../types'

interface SectionQuemMoraAquiProps {
  data: QuemMoraAqui
}

export function SectionQuemMoraAqui({ data }: SectionQuemMoraAquiProps) {
  if (!data.resumo && data.indicadores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Quem mora aqui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Perfil demografico nao disponivel.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Quem mora aqui
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo da persona */}
        {data.resumo && (
          <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
            <p className="text-sm leading-relaxed">
              {data.resumo}
            </p>
          </div>
        )}

        {/* Grid de indicadores */}
        {data.indicadores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.indicadores.map((indicador, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {indicador.indicador}
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {indicador.valor}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {indicador.interpretacao}
                </p>
                <p className="text-xs text-muted-foreground/60 italic mt-1">
                  {indicador.fonte}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SectionQuemMoraAqui
