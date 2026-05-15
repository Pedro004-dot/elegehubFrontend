import { User, MapPin, GraduationCap, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Competitor } from '../types'
import {
  POLITICAL_SPECTRUM_CONFIG,
  THREAT_LEVEL_CONFIG,
  ELECTION_RESULT_CONFIG,
} from '../types'

interface CompetitorProfileProps {
  competitor: Competitor
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `R$ ${Math.round(value / 1000)}k`
  }
  return `R$ ${value}`
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}

export function CompetitorProfile({ competitor }: CompetitorProfileProps) {
  const spectrumConfig = POLITICAL_SPECTRUM_CONFIG[competitor.politicalSpectrum]
  const threatConfig = THREAT_LEVEL_CONFIG[competitor.threatLevel]
  const resultConfig = ELECTION_RESULT_CONFIG[competitor.lastElection.result]

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            {competitor.photoUrl ? (
              <img
                src={competitor.photoUrl}
                alt={competitor.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <CardTitle className="text-lg">{competitor.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {competitor.party} ({competitor.partyAcronym})
            </p>
            {competitor.currentPosition && (
              <p className="mt-1 text-sm font-medium">
                {competitor.currentPosition}
              </p>
            )}
          </div>
          <Badge
            className={cn(threatConfig.bgColor, threatConfig.textColor, 'border-0')}
          >
            AMEACA {competitor.threatLevel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{competitor.age} anos</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>{competitor.profession}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{competitor.education}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Base: {competitor.regionalBase}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Espectro Politico
          </p>
          <div className="space-y-1">
            <div className="relative h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-foreground shadow"
                style={{ left: `${spectrumConfig.position}%` }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {spectrumConfig.label}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Ultima Campanha ({competitor.lastElection.year})
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Votos</p>
              <p className="font-semibold">
                {formatNumber(competitor.lastElection.votes)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Posicao</p>
              <p className="font-semibold">
                {competitor.lastElection.stateRanking}o estadual
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Gastos</p>
              <p className="font-semibold">
                {formatCurrency(competitor.lastElection.totalSpending)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Custo/voto</p>
              <p className="font-semibold">
                R$ {competitor.lastElection.costPerVote.toFixed(2)}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              resultConfig.bgColor,
              resultConfig.textColor,
              'mt-2 w-full justify-center border-0'
            )}
          >
            {resultConfig.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
