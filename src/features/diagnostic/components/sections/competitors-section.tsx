/**
 * CompetitorsSection
 *
 * Displays competitor analysis with tabs per competitor,
 * radar chart comparison, and territorial base.
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  EyebrowLabel,
  SectionHeader,
  StatusBadge,
} from '@/components/elegehub'
import { Shield, Target, AlertTriangle, MapPin } from 'lucide-react'
import type { CompetitorsData, CompetitorAnalysis } from '../../types'

interface CompetitorsSectionProps {
  data: unknown
}

export function CompetitorsSection({ data }: CompetitorsSectionProps) {
  const competitors = data as CompetitorsData
  const [activeCompetitor, setActiveCompetitor] = useState<string | null>(null)

  if (!competitors || !competitors.adversarios || competitors.adversarios.length === 0) {
    return (
      <div className="space-y-8">
        <SectionHeader
          eyebrow="ANALISE DE ADVERSARIOS"
          title="Nenhum adversario identificado"
          description="Ainda nao foram identificados adversarios para analise."
        />
      </div>
    )
  }

  const competitorList = competitors.adversarios.slice(0, 5)
  const firstCompetitor = competitorList[0]
  const lastCompetitor = competitorList[competitorList.length - 1]

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="ANALISE DE ADVERSARIOS"
        title="Conheca seus principais oponentes"
        description="Analise comparativa dos adversarios com identificacao de forcas, vulnerabilidades e estrategias."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5">
          <EyebrowLabel>TOTAL ANALISADOS</EyebrowLabel>
          <p className="text-display-sm font-mono tabular-nums text-ink-display mt-2">
            {competitorList.length}
          </p>
          <p className="text-small text-ink-tertiary">adversarios</p>
        </Card>
        <Card className="p-5">
          <EyebrowLabel>PRINCIPAL AMEACA</EyebrowLabel>
          <p className="text-h2 text-ink-display mt-2">{firstCompetitor?.nome || '-'}</p>
          <StatusBadge variant="risk" className="mt-2">
            Maior risco
          </StatusBadge>
        </Card>
        <Card className="p-5">
          <EyebrowLabel>MAIS VULNERAVEL</EyebrowLabel>
          <p className="text-h2 text-ink-display mt-2">
            {lastCompetitor?.nome || '-'}
          </p>
          <StatusBadge variant="opportunity" className="mt-2">
            Oportunidade
          </StatusBadge>
        </Card>
      </div>

      {/* Competitor Tabs */}
      <Tabs
        value={activeCompetitor || firstCompetitor?.nome || ''}
        onValueChange={setActiveCompetitor}
        className="w-full"
      >
        <TabsList className="w-full justify-start border-b bg-transparent p-0 h-auto overflow-x-auto">
          {competitorList.map((competitor) => (
            <TabsTrigger
              key={competitor.nome}
              value={competitor.nome}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-3 whitespace-nowrap"
            >
              {competitor.nome}
            </TabsTrigger>
          ))}
        </TabsList>

        {competitorList.map((competitor) => (
          <TabsContent key={competitor.nome} value={competitor.nome} className="mt-6">
            <CompetitorDetail competitor={competitor} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function CompetitorDetail({ competitor }: { competitor: CompetitorAnalysis }) {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <EyebrowLabel>PARTIDO</EyebrowLabel>
          <p className="text-h2 text-ink-display mt-2">{competitor.partido}</p>
          {competitor.cargo_atual && (
            <p className="text-body text-ink-secondary mt-2">
              Cargo atual: {competitor.cargo_atual}
            </p>
          )}
        </Card>
        <Card className="p-6">
          <EyebrowLabel>NIVEL DE AMEACA</EyebrowLabel>
          <div className="mt-3 flex items-center gap-4">
            <Progress
              value={(competitor.nivel_ameaca || 0.5) * 100}
              className="h-2 flex-1"
            />
            <span className="text-h2 font-mono tabular-nums text-ink-display">
              {Math.round((competitor.nivel_ameaca || 0.5) * 100)}%
            </span>
          </div>
        </Card>
      </div>

      {/* Radar Chart Placeholder */}
      <Card className="p-6">
        <EyebrowLabel>COMPARATIVO 5 DIMENSOES</EyebrowLabel>
        <div className="h-[300px] flex items-center justify-center bg-surface-subtle rounded-lg mt-4">
          <p className="text-ink-tertiary">
            Grafico radar sera implementado aqui
          </p>
        </div>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-2 gap-6">
        {/* Strengths */}
        <div>
          <h4 className="text-h3 text-ink-display mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-success" />
            Pontos Fortes
          </h4>
          <div className="space-y-3">
            {competitor.pontos_fortes?.map((ponto, i) => (
              <Card key={i} className="p-4 border-l-2 border-l-success">
                <p className="text-body text-ink-primary">{ponto}</p>
              </Card>
            ))}
            {(!competitor.pontos_fortes || competitor.pontos_fortes.length === 0) && (
              <p className="text-body text-ink-tertiary">
                Nenhum ponto forte identificado
              </p>
            )}
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <h4 className="text-h3 text-ink-display mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            Vulnerabilidades
          </h4>
          <div className="space-y-3">
            {competitor.vulnerabilidades?.map((vuln, i) => (
              <Card key={i} className="p-4 border-l-2 border-l-danger">
                <p className="text-body text-ink-primary">{vuln}</p>
              </Card>
            ))}
            {(!competitor.vulnerabilidades || competitor.vulnerabilidades.length === 0) && (
              <p className="text-body text-ink-tertiary">
                Nenhuma vulnerabilidade identificada
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Territorial Base */}
      {competitor.base_territorial && (
        <div>
          <h4 className="text-h3 text-ink-display mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand" />
            Base Territorial
          </h4>
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <EyebrowLabel>MUNICIPIOS BASE</EyebrowLabel>
                <div className="mt-3 space-y-2">
                  {competitor.base_territorial.municipios_principais?.map(
                    (municipio, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-body text-ink-primary"
                      >
                        <div className="w-2 h-2 rounded-full bg-brand" />
                        {municipio}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <EyebrowLabel>ELEITORADO ESTIMADO</EyebrowLabel>
                <p className="text-display-sm font-mono tabular-nums text-ink-display mt-3">
                  {competitor.base_territorial.eleitorado_estimado?.toLocaleString(
                    'pt-BR'
                  ) || '-'}
                </p>
                <p className="text-small text-ink-tertiary">votos potenciais</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Strategy */}
      {competitor.estrategia_recomendada && (
        <div className="p-6 bg-brand-subtle border border-brand-border rounded-lg">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div>
              <EyebrowLabel className="text-brand">
                ESTRATEGIA RECOMENDADA
              </EyebrowLabel>
              <p className="text-body-lg text-ink-display mt-2">
                {competitor.estrategia_recomendada}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
