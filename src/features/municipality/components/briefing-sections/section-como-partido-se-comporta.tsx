/**
 * SectionComoPartidoSeComporta - Secao 4 do briefing
 *
 * Exibe analise da presenca e historico do partido no municipio
 * Inclui filiados, votacao historica e posicao relativa
 */

import { Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ComportamentoPartido } from '../../types'

interface SectionComoPartidoSeComportaProps {
  data: ComportamentoPartido
}

function getInterpretationIcon(interpretacao: string) {
  const lower = interpretacao.toLowerCase()
  if (lower.includes('bom') || lower.includes('cresci') || lower.includes('acima') || lower.includes('positiv')) {
    return <TrendingUp className="h-4 w-4 text-green-600" />
  }
  if (lower.includes('ruim') || lower.includes('queda') || lower.includes('abaixo') || lower.includes('negativ')) {
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }
  return <Minus className="h-4 w-4 text-yellow-600" />
}

export function SectionComoPartidoSeComporta({ data }: SectionComoPartidoSeComportaProps) {
  if (!data.resumo && data.indicadores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Como meu partido se comporta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Dados do partido nao disponiveis.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Como meu partido se comporta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        {data.resumo && (
          <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
            <p className="text-sm leading-relaxed">
              {data.resumo}
            </p>
          </div>
        )}

        {/* Metricas do partido */}
        {data.indicadores.length > 0 && (
          <div className="space-y-3">
            {data.indicadores.map((metrica, index) => (
              <div
                key={index}
                className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {metrica.metrica}
                  </span>
                  <p className="text-lg font-bold text-foreground">
                    {metrica.valor}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  {getInterpretationIcon(metrica.interpretacao)}
                  <div>
                    <p className="text-xs text-muted-foreground max-w-[150px]">
                      {metrica.interpretacao}
                    </p>
                    <p className="text-xs text-muted-foreground/60 italic">
                      {metrica.fonte}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SectionComoPartidoSeComporta
