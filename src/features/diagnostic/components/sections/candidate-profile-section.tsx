/**
 * CandidateProfileSection
 *
 * Displays candidate analysis with strengths, vulnerabilities,
 * party-territory relationship, alerts, and winner comparison.
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
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'
import type { CandidateProfileData } from '../../types'

interface CandidateProfileSectionProps {
  data: unknown
}

export function CandidateProfileSection({ data }: CandidateProfileSectionProps) {
  const profile = data as CandidateProfileData
  const [activeTab, setActiveTab] = useState('forcas')

  if (!profile) {
    return null
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="PERFIL DO CANDIDATO"
        title="Analise de forcas e vulnerabilidades"
        description="Avaliacao detalhada do candidato comparado ao perfil vencedor do territorio."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b bg-transparent p-0 h-auto">
          <TabsTrigger
            value="forcas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-3"
          >
            Forcas ({profile.forcas?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="vulnerabilidades"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-3"
          >
            Vulnerabilidades ({profile.vulnerabilidades?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="partido"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-3"
          >
            Partido x Territorio
          </TabsTrigger>
          <TabsTrigger
            value="alertas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-3"
          >
            Alertas ({profile.alertas?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="vencedor"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-3"
          >
            vs Perfil Vencedor
          </TabsTrigger>
        </TabsList>

        {/* Forcas Tab */}
        <TabsContent value="forcas" className="mt-6">
          <div className="grid gap-4">
            {profile.forcas?.map((forca, i) => (
              <Card key={i} className="p-5 border-l-4 border-l-success">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-h3 text-ink-display">{forca.titulo}</h4>
                    <p className="text-body text-ink-secondary mt-2">
                      {forca.descricao}
                    </p>
                    {forca.como_explorar && (
                      <div className="mt-3 p-3 bg-surface-subtle rounded-md">
                        <p className="text-small text-ink-secondary">
                          <span className="font-medium text-ink-primary">Como explorar:</span>{' '}
                          {forca.como_explorar}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Vulnerabilidades Tab */}
        <TabsContent value="vulnerabilidades" className="mt-6">
          <div className="grid gap-4">
            {profile.vulnerabilidades?.map((vuln, i) => (
              <Card key={i} className="p-5 border-l-4 border-l-danger">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-h3 text-ink-display">{vuln.titulo}</h4>
                      <StatusBadge
                        variant={
                          vuln.severidade === 'alta'
                            ? 'risk'
                            : vuln.severidade === 'media'
                            ? 'attention'
                            : 'neutral'
                        }
                      >
                        {vuln.severidade}
                      </StatusBadge>
                    </div>
                    <p className="text-body text-ink-secondary mt-2">
                      {vuln.descricao}
                    </p>
                    {vuln.mitigacao && (
                      <div className="mt-3 p-3 bg-surface-subtle rounded-md">
                        <p className="text-small text-ink-secondary">
                          <span className="font-medium text-ink-primary">Mitigacao:</span>{' '}
                          {vuln.mitigacao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Partido x Territorio Tab */}
        <TabsContent value="partido" className="mt-6">
          {profile.partido_territorio && (
            <div className="space-y-6">
              <Card className="p-6">
                <EyebrowLabel>ALINHAMENTO PARTIDO-TERRITORIO</EyebrowLabel>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <Progress
                      value={profile.partido_territorio.alinhamento_score * 100}
                      className="h-2"
                    />
                  </div>
                  <span className="text-h2 font-mono text-brand tabular-nums">
                    {Math.round(profile.partido_territorio.alinhamento_score * 100)}%
                  </span>
                </div>
                <p className="text-body text-ink-secondary mt-4">
                  {profile.partido_territorio.analise}
                </p>
              </Card>

              {profile.partido_territorio.oportunidades && (
                <div>
                  <h4 className="text-h3 text-ink-display mb-4">Oportunidades</h4>
                  <div className="grid gap-3">
                    {profile.partido_territorio.oportunidades.map((op, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-surface-subtle rounded-lg"
                      >
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-body text-ink-primary">{op}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.partido_territorio.riscos && (
                <div>
                  <h4 className="text-h3 text-ink-display mb-4">Riscos</h4>
                  <div className="grid gap-3">
                    {profile.partido_territorio.riscos.map((risco, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-surface-subtle rounded-lg"
                      >
                        <TrendingDown className="w-4 h-4 text-danger" />
                        <span className="text-body text-ink-primary">{risco}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Alertas Tab */}
        <TabsContent value="alertas" className="mt-6">
          <div className="grid gap-4">
            {profile.alertas?.map((alerta, i) => (
              <Card key={i} className="p-5 border-l-4 border-l-warning">
                <div className="flex items-start gap-4">
                  <XCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-h3 text-ink-display">{alerta.tipo}</h4>
                    <p className="text-body text-ink-secondary mt-2">
                      {alerta.descricao}
                    </p>
                    {alerta.recomendacao && (
                      <div className="mt-3 p-3 bg-surface-subtle rounded-md">
                        <p className="text-small text-ink-secondary">
                          <span className="font-medium text-ink-primary">Recomendacao:</span>{' '}
                          {alerta.recomendacao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* vs Perfil Vencedor Tab */}
        <TabsContent value="vencedor" className="mt-6">
          {profile.comparacao_vencedor && (
            <div className="space-y-6">
              <Card className="p-6">
                <EyebrowLabel>PROXIMIDADE AO PERFIL VENCEDOR</EyebrowLabel>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <Progress
                      value={profile.comparacao_vencedor.proximidade_score * 100}
                      className="h-3"
                    />
                  </div>
                  <span className="text-display-sm font-mono text-brand tabular-nums">
                    {Math.round(profile.comparacao_vencedor.proximidade_score * 100)}%
                  </span>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                {profile.comparacao_vencedor.gaps_principais && (
                  <div>
                    <h4 className="text-h3 text-ink-display mb-4">Gaps a Preencher</h4>
                    <div className="space-y-3">
                      {profile.comparacao_vencedor.gaps_principais.map((gap, i) => (
                        <div
                          key={i}
                          className="p-4 bg-surface-subtle rounded-lg border-l-2 border-l-danger"
                        >
                          <p className="text-body text-ink-primary font-medium">
                            {gap.dimensao}
                          </p>
                          <p className="text-small text-ink-secondary mt-1">
                            {gap.descricao}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profile.comparacao_vencedor.vantagens && (
                  <div>
                    <h4 className="text-h3 text-ink-display mb-4">Vantagens</h4>
                    <div className="space-y-3">
                      {profile.comparacao_vencedor.vantagens.map((vant, i) => (
                        <div
                          key={i}
                          className="p-4 bg-surface-subtle rounded-lg border-l-2 border-l-success"
                        >
                          <p className="text-body text-ink-primary font-medium">
                            {vant.dimensao}
                          </p>
                          <p className="text-small text-ink-secondary mt-1">
                            {vant.descricao}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {profile.comparacao_vencedor.recomendacao && (
                <div className="p-6 bg-brand-subtle border border-brand-border rounded-lg">
                  <EyebrowLabel className="text-brand">RECOMENDACAO</EyebrowLabel>
                  <p className="text-body-lg text-ink-display mt-3">
                    {profile.comparacao_vencedor.recomendacao}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
