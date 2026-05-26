/**
 * SectionQuemPodeAbrirPortas - Secao 5 do briefing
 *
 * Exibe cabos eleitorais potenciais (vereadores, liderancas)
 * Lista ordenada por votos recebidos
 */

import { UserCheck, Vote, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LiderancaLocal } from '../../types'

interface SectionQuemPodeAbrirPortasProps {
  cabos: LiderancaLocal[]
}

function formatVotos(votos: number | null): string {
  if (votos === null) return 'N/D'
  if (votos >= 1000) {
    return `${(votos / 1000).toFixed(1)}k`
  }
  return votos.toLocaleString('pt-BR')
}

export function SectionQuemPodeAbrirPortas({ cabos }: SectionQuemPodeAbrirPortasProps) {
  if (cabos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Quem pode abrir portas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhuma lideranca local identificada.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Ordenar por votos (maior primeiro)
  const sortedCabos = [...cabos].sort((a, b) => {
    if (a.votosRecebidos === null) return 1
    if (b.votosRecebidos === null) return -1
    return b.votosRecebidos - a.votosRecebidos
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          Quem pode abrir portas
          <Badge variant="secondary" className="ml-auto">
            {cabos.length} {cabos.length === 1 ? 'lideranca' : 'liderancas'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedCabos.map((cabo, index) => (
            <div
              key={index}
              className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {cabo.nome}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{cabo.cargo}</span>
                    {cabo.partido && (
                      <>
                        <span>-</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {cabo.partido}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                {cabo.votosRecebidos !== null && (
                  <div className="flex items-center gap-1">
                    <Vote className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold text-sm">
                      {formatVotos(cabo.votosRecebidos)}
                    </span>
                    <span className="text-xs text-muted-foreground">votos</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs">{cabo.anoEleicao}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default SectionQuemPodeAbrirPortas
