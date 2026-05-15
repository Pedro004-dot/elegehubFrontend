import { X, Plus, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import type { Municipality } from '../types'
import { CLASSIFICATION_CONFIG } from '../types'

interface MunicipalityPanelProps {
  municipality: Municipality | null
  onClose: () => void
  onAddToActionPlan: (municipality: Municipality) => void
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}k`
  }
  return num.toLocaleString('pt-BR')
}

function formatPopulation(pop: number): string {
  if (pop >= 1000000) {
    return `${(pop / 1000000).toFixed(1)}M habitantes`
  }
  if (pop >= 1000) {
    return `${(pop / 1000).toFixed(0)}k habitantes`
  }
  return `${pop} habitantes`
}

export function MunicipalityPanel({
  municipality,
  onClose,
  onAddToActionPlan
}: MunicipalityPanelProps) {
  if (!municipality) return null

  const config = CLASSIFICATION_CONFIG[municipality.classification]

  // Calcular tendência histórica
  const historicalData = municipality.historicalData
  const firstVotes = historicalData[0]?.votes || 0
  const lastVotes = historicalData[historicalData.length - 1]?.votes || 0
  const trend = firstVotes > 0 ? ((lastVotes - firstVotes) / firstVotes) * 100 : 0
  const TrendIcon = trend > 5 ? TrendingUp : trend < -5 ? TrendingDown : Minus

  return (
    <div className="w-[380px] h-full border-l bg-background overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <Badge
              variant="secondary"
              style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
                borderColor: config.color
              }}
            >
              {config.label}
            </Badge>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-xl font-bold mt-2">{municipality.name}</h2>
        <p className="text-sm text-muted-foreground">
          {municipality.region} · {formatPopulation(municipality.population)}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Score Card */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              POTENCIAL ELEITORAL
            </p>
            <div className="flex items-end gap-4">
              <div className="text-center">
                <div
                  className="text-4xl font-bold font-mono"
                  style={{ color: config.color }}
                >
                  {municipality.score}
                </div>
                <div className="text-xs text-muted-foreground">/100</div>
              </div>
              <div className="flex-1">
                <Progress
                  value={municipality.score}
                  className="h-2"
                  style={{
                    ['--progress-background' as string]: config.color
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {municipality.score >= 70 ? 'Alto potencial' :
                   municipality.score >= 40 ? 'Potencial moderado' : 'Baixo potencial'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Votos Potenciais */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            VOTOS POTENCIAIS ESTIMADOS
          </p>
          <p className="text-2xl font-bold">
            → {formatNumber(municipality.potentialVotes)} votos
          </p>
        </div>

        <Separator />

        {/* Justificativa */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            POR QUE {config.label.toUpperCase()} AQUI
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {municipality.classification === 'consolidar' &&
              `Sua base histórica está concentrada neste município. Candidatos com perfil similar ao seu obtiveram bons resultados nos últimos pleitos.`
            }
            {municipality.classification === 'conquistar' &&
              `Alto potencial inexplorado. A concorrência é fraca e o perfil demográfico é favorável ao seu posicionamento.`
            }
            {municipality.classification === 'disputar' &&
              `Território dividido entre múltiplos candidatos. Pode ser conquistado com investimento estratégico focado.`
            }
            {municipality.classification === 'evitar' &&
              `Base adversária consolidada. O custo-benefício de investir aqui não justifica o retorno esperado.`
            }
          </p>
        </div>

        <Separator />

        {/* Top 3 Fatores */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            TOP 3 FATORES DO SCORE
          </p>
          <div className="space-y-3">
            {municipality.factors.slice(0, 3).map((factor, index) => (
              <div key={index} className="flex items-start gap-2">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 ${
                    factor.impact === 'high' ? 'bg-green-500' :
                    factor.impact === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">{factor.title}</p>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Histórico */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            HISTÓRICO DE CANDIDATOS SIMILARES
          </p>
          <div className="flex items-end gap-2 mb-2">
            {historicalData.map((data, index) => {
              const maxVotes = Math.max(...historicalData.map(d => d.votes))
              const height = (data.votes / maxVotes) * 60

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${height}px`,
                      backgroundColor: config.color,
                      opacity: 0.3 + (index / historicalData.length) * 0.7
                    }}
                  />
                  <p className="text-xs font-mono mt-1">{data.year}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(data.votes)}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendIcon
              className={`h-4 w-4 ${
                trend > 5 ? 'text-green-500' :
                trend < -5 ? 'text-red-500' : 'text-gray-500'
              }`}
            />
            <span className={
              trend > 5 ? 'text-green-600' :
              trend < -5 ? 'text-red-600' : 'text-muted-foreground'
            }>
              {trend > 0 ? '+' : ''}{trend.toFixed(0)}% em{' '}
              {(historicalData[historicalData.length - 1]?.year ?? 0) - (historicalData[0]?.year ?? 0)} anos
            </span>
          </div>
        </div>

        <Separator />

        {/* Ações */}
        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={() => onAddToActionPlan(municipality)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar ao Plano de Ação
          </Button>
          <Button variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver análise detalhada
          </Button>
        </div>
      </div>
    </div>
  )
}
