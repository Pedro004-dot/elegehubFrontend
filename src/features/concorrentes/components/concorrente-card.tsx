/**
 * ConcorrenteCard - Card de resumo de um concorrente
 */

import { User, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ConcorrenteBasico } from '../types'

interface ConcorrenteCardProps {
  concorrente: ConcorrenteBasico
  onClick?: () => void
  isSelected?: boolean
}

/**
 * Formata numero de votos para exibicao
 */
function formatVotos(votos: number | null | undefined): string {
  if (!votos) return '-'
  if (votos >= 1000000) {
    return `${(votos / 1000000).toFixed(1)}M`
  }
  if (votos >= 1000) {
    return `${(votos / 1000).toFixed(1)}k`
  }
  return votos.toLocaleString('pt-BR')
}

export function ConcorrenteCard({
  concorrente,
  onClick,
  isSelected = false,
}: ConcorrenteCardProps) {
  const isEleito = concorrente.resultado?.toLowerCase().includes('eleit')

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar/Foto */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            {concorrente.fotoUrl ? (
              <img
                src={concorrente.fotoUrl}
                alt={concorrente.nomeUrna}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          {/* Informacoes */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{concorrente.nomeUrna}</h3>
              {isEleito && (
                <Badge variant="default" className="shrink-0">
                  Eleito
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Badge variant="outline" className="shrink-0">
                {concorrente.partidoSigla}
              </Badge>
              {concorrente.numeroCandidato && (
                <span className="shrink-0">#{concorrente.numeroCandidato}</span>
              )}
            </div>

            {/* Metricas */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatVotos(concorrente.totalVotos)}
                </span>
                <span className="text-muted-foreground">votos</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ConcorrenteCard
