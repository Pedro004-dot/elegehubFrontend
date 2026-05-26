/**
 * MunicipalityPage - Pagina do municipio com tabs
 *
 * Tabs:
 * - Briefing: 6 secoes do briefing estrategico
 * - Indicadores: Indicadores por tema com valores diretos
 *
 * Navegacao: /municipio/:codigoIbge
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  RefreshCw,
  FileText,
  BarChart3,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import { useBriefing } from '../hooks'
import { useCurrentCampaignSafe } from '@/features/auth/hooks/useCurrentCampaign'

/**
 * Mapeamento de sigla do partido para ID no banco
 * NOTA: Sincronizado com dim_partidos (2026-05-25)
 */
const PARTIDO_SIGLA_TO_ID: Record<string, number> = {
  MDB: 1,
  PT: 2,
  PSDB: 3,
  PP: 4,
  PDT: 5,
  UNIÃO: 6,
  PSB: 7,
  PL: 8,
  PSD: 9,
  REPUBLICANOS: 10,
  PSOL: 11,
  PCdoB: 12,
  PCDOB: 12, // alias
  PODE: 13,
  NOVO: 14,
  CIDADANIA: 15,
  AVANTE: 16,
  SOLIDARIEDADE: 17,
  PV: 18,
  REDE: 19,
  DC: 20,
  AGIR: 21,
}
import { IndicatorsTab } from '../components/indicators-tab'
import { ClassificationTab } from '../components/classification-tab'
import { SuggestionPanel } from '../components/suggestion-panel'
import {
  SectionPorQueEstarAqui,
  SectionQuemMoraAqui,
  SectionOQueTePegado,
  SectionComoPartidoSeComporta,
  SectionQuemPodeAbrirPortas,
  SectionHonestidades,
} from '../components/briefing-sections'

function formatNumber(num: number | null): string {
  if (num === null) return 'N/D'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toLocaleString('pt-BR')
}

function BriefingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-destructive mb-2">
          Erro ao carregar dados
        </h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
      </div>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />
        Tentar novamente
      </Button>
    </div>
  )
}

export function MunicipalityPage() {
  const { codigoIbge } = useParams<{ codigoIbge: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('briefing')
  const campaign = useCurrentCampaignSafe()

  // Obter partidoId da campanha atual ou usar PSD (9) como default
  const partidoId = campaign?.party
    ? PARTIDO_SIGLA_TO_ID[campaign.party.toUpperCase()] || 9
    : 9

  const { data: briefing, isLoading, error, refetch } = useBriefing(
    codigoIbge || '',
    partidoId
  )

  if (!codigoIbge) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Codigo IBGE nao informado</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b bg-background">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <BriefingSkeleton />
        </div>
      </div>
    )
  }

  if (error && !briefing) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (!briefing) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Municipio nao encontrado</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/mapa')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <h1 className="text-xl font-semibold">{briefing.nomeMunicipio}</h1>
                <Badge variant="secondary">{briefing.estado}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {briefing.mesorregiao} · {formatNumber(briefing.populacao)} habitantes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs + Sugestao da IA */}
      <div className="px-6 pt-4 pb-3 border-b bg-background">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="briefing">
                <FileText className="w-4 h-4 mr-2" />
                Briefing
              </TabsTrigger>
              <TabsTrigger value="indicadores">
                <BarChart3 className="w-4 h-4 mr-2" />
                Indicadores
              </TabsTrigger>
              <TabsTrigger value="classificacao">
                <Target className="w-4 h-4 mr-2" />
                Classificacao
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sugestao da IA */}
          <SuggestionPanel codigoIbge={codigoIbge} briefing={briefing} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab: Briefing */}
            <TabsContent value="briefing" className="mt-0">
              <div className="space-y-6">
                {/* Metricas principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Populacao</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">
                        {formatNumber(briefing.populacao)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Razoes de visita</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">
                        {briefing.porQueEstarAqui.length}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Liderancas</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">
                        {briefing.quemPodeAbrirPortas.length}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Atualizado</span>
                      </div>
                      <p className="text-sm font-mono">
                        {new Date(briefing.geradoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* 6 Secoes em grid 2 colunas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <SectionPorQueEstarAqui razoes={briefing.porQueEstarAqui} />
                    <SectionOQueTePegado temas={briefing.oQueTePegado} />
                    <SectionQuemPodeAbrirPortas cabos={briefing.quemPodeAbrirPortas} />
                  </div>
                  <div className="space-y-6">
                    <SectionQuemMoraAqui data={briefing.quemMoraAqui} />
                    <SectionComoPartidoSeComporta data={briefing.comoPartidoSeComporta} />
                    <SectionHonestidades honestidades={briefing.honestidades} />
                  </div>
                </div>

                {/* Footer do briefing */}
                <div className="text-sm text-muted-foreground py-4 border-t">
                  <p>
                    Versao {briefing.versao} · Gerado em{' '}
                    {new Date(briefing.geradoEm).toLocaleString('pt-BR')}
                  </p>
                  {briefing.fontesConsultadas.length > 0 && (
                    <p className="mt-1">
                      Fontes: {briefing.fontesConsultadas.map((f) => f.tabela).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab: Indicadores */}
            <TabsContent value="indicadores" className="mt-0">
              <IndicatorsTab codigoIbge={codigoIbge} partidoId={partidoId} />
            </TabsContent>

            {/* Tab: Classificacao */}
            <TabsContent value="classificacao" className="mt-0">
              <ClassificationTab codigoIbge={codigoIbge} partidoId={partidoId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default MunicipalityPage
