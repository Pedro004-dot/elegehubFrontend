/**
 * DiagnosticHomePage
 *
 * Main diagnostic page with 5 scrollable blocks:
 * 1. Hero - Candidate name, stats, actions
 * 2. Executive Summary - Key insights
 * 3. Map Preview - Territorial analysis preview
 * 4. Section Grid - Deep dive into each section
 * 5. Next Steps - Action cards
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentCampaign } from '@/features/auth/hooks/useCurrentCampaign'
import { useDiagnostic, useMunicipalityAnalysis } from '../hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  BigNumber,
  EyebrowLabel,
  EmptyState,
  ActionCard,
} from '@/components/elegehub'
import {
  FileText,
  Download,
  Presentation,
  RefreshCw,
  History,
  Map,
  User,
  Users,
  BarChart,
  MessageSquare,
  ListTodo,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { SECTION_INFO, CLASSIFICATION_COLORS, CLASSIFICATION_LABELS } from '../types'
import type { SectionType, ExecutiveSummaryData, TerritorialClassification } from '../types'
import { TerritorialMap } from '../components/map'

// Section icons mapping
const SECTION_ICONS: Record<SectionType, typeof FileText> = {
  executive_summary: FileText,
  candidate_profile: User,
  territorial: Map,
  competitors: Users,
  benchmark: BarChart,
  narrative: MessageSquare,
  action_plan: ListTodo,
}

export function DiagnosticHomePage() {
  const navigate = useNavigate()
  const campaign = useCurrentCampaign()
  const { diagnostic, loading, error, refetch } = useDiagnostic({
    campaignId: campaign.id,
  })

  // Buscar análise de municípios com algoritmo determinístico (todos os 853 municípios)
  const { data: municipalityData, municipios: allMunicipios, loading: municipalityLoading } = useMunicipalityAnalysis({
    campaignId: campaign.id,
  })

  // Filtros de classificação para o mapa territorial
  // Por padrão, mostra apenas municípios "fiéis"
  const [activeFilters, setActiveFilters] = useState<TerritorialClassification[]>(['fiel'])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body text-ink-secondary">Carregando diagnostico...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Erro ao carregar diagnostico"
        description={error.message}
        action={{ label: 'Tentar novamente', onClick: refetch }}
      />
    )
  }

  // No diagnostic - show empty state with CTA to generate
  if (!diagnostic) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Nenhum diagnostico gerado"
        description="Gere seu primeiro diagnostico estrategico com analise de IA para sua campanha."
        action={{
          label: 'Gerar Diagnostico',
          onClick: () => navigate('/diagnostico/gerando'),
        }}
        secondaryAction={{
          label: 'Configurar Tom',
          onClick: () => navigate('/diagnostico/configuracoes'),
        }}
      />
    )
  }

  const { run, sections } = diagnostic

  // Handle case where run is missing (shouldn't happen but be safe)
  if (!run) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Diagnostico incompleto"
        description="O diagnostico foi encontrado mas esta incompleto. Tente gerar novamente."
        action={{
          label: 'Gerar Diagnostico',
          onClick: () => navigate('/diagnostico/gerando'),
        }}
      />
    )
  }

  const executiveSummary = sections?.executive_summary as ExecutiveSummaryData | undefined

  // Format date
  const formattedDate = run.created_at
    ? new Date(run.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Data desconhecida'

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      {/* Block 1: Hero */}
      <section className="min-h-[80vh] flex flex-col justify-center py-16">
        <div className="space-y-6">
          <EyebrowLabel>DIAGNOSTICO ESTRATEGICO</EyebrowLabel>

          <h1 className="text-display-lg font-bold tracking-tighter text-ink-display">
            {campaign.candidate_name}
          </h1>

          <p className="text-h2 text-ink-secondary font-normal">
            Candidatura a {campaign.position} • {campaign.state} • Eleicoes {campaign.year}
          </p>

          <p className="text-small text-ink-tertiary font-mono">
            Gerado em {formattedDate} · Versao {run.version}
          </p>
        </div>

        {/* Hero Stats */}
        {executiveSummary?.resumo_numerico && (
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border">
            <BigNumber
              size="lg"
              label="META DE VOTOS"
              value={executiveSummary.resumo_numerico.votos_meta}
              suffix=" votos"
            />
            <BigNumber
              size="lg"
              label="PROJECAO REALISTA"
              value={executiveSummary.resumo_numerico.votos_projecao}
              suffix=" votos"
              trend={
                executiveSummary.resumo_numerico.votos_meta > 0
                  ? ((executiveSummary.resumo_numerico.votos_projecao -
                      executiveSummary.resumo_numerico.votos_meta) /
                      executiveSummary.resumo_numerico.votos_meta) *
                    100
                  : 0
              }
            />
            <BigNumber
              size="lg"
              label="ORCAMENTO RECOMENDADO"
              value={new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0,
              }).format(executiveSummary.resumo_numerico.orcamento_recomendado)}
            />
          </div>
        )}

        {/* Hero Actions */}
        <div className="flex gap-3 mt-12">
          <Button
            onClick={() => navigate('/diagnostico/apresentar')}
          >
            <Presentation className="w-4 h-4 mr-2" />
            Apresentar Diagnostico
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/diagnostico/configuracoes')}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </section>

      {/* Block 2: Executive Summary */}
      {executiveSummary && (
        <section className="py-24">
          <EyebrowLabel>SUMARIO EXECUTIVO</EyebrowLabel>

          <h2 className="text-h1 text-ink-display mt-2 max-w-4xl leading-tight">
            {executiveSummary.estado_atual_candidatura}
          </h2>

          {/* Strength and Risk Cards */}
          <div className="grid grid-cols-2 gap-6 mt-12">
            {executiveSummary.principal_forca && (
              <Card className="p-8 border-l-4 border-l-success">
                <EyebrowLabel className="text-success">PRINCIPAL FORCA</EyebrowLabel>
                <h3 className="text-h2 mt-3 text-ink-display">
                  {executiveSummary.principal_forca.titulo}
                </h3>
                <p className="text-body text-ink-secondary mt-3">
                  {executiveSummary.principal_forca.frase}
                </p>
              </Card>
            )}

            {executiveSummary.maior_risco && (
              <Card className="p-8 border-l-4 border-l-danger">
                <EyebrowLabel className="text-danger">MAIOR RISCO</EyebrowLabel>
                <h3 className="text-h2 mt-3 text-ink-display">
                  {executiveSummary.maior_risco.titulo}
                </h3>
                <p className="text-body text-ink-secondary mt-3">
                  {executiveSummary.maior_risco.frase}
                </p>
              </Card>
            )}
          </div>

          {/* Strategic Bet */}
          <div className="mt-12 p-8 bg-brand-subtle border border-brand-border rounded-lg">
            <EyebrowLabel className="text-brand">
              APOSTA ESTRATEGICA RECOMENDADA
            </EyebrowLabel>
            <p className="text-body-lg text-ink-display mt-3 leading-relaxed">
              {executiveSummary.aposta_estrategica_recomendada}
            </p>
          </div>

          {/* Top 3 Actions */}
          {executiveSummary.top_3_acoes_30_dias && executiveSummary.top_3_acoes_30_dias.length > 0 && (
            <div className="mt-12">
              <h3 className="text-h2 text-ink-display">
                Proximas 3 acoes nos proximos 30 dias
              </h3>
              <ol className="mt-6 space-y-4">
                {executiveSummary.top_3_acoes_30_dias.map((acao, i) => (
                <li
                  key={i}
                  className="flex gap-6 p-6 bg-surface-subtle rounded-lg"
                >
                  <span className="text-display-sm font-mono text-brand">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="text-h3 text-ink-display">{acao.acao}</p>
                    <p className="text-small text-ink-tertiary mt-1 font-mono">
                      {acao.prazo}
                    </p>
                    <p className="text-body text-ink-secondary mt-2">
                      {acao.impacto_esperado}
                    </p>
                  </div>
                </li>
              ))}
              </ol>
            </div>
          )}
        </section>
      )}

      {/* Block 3: Map Preview */}
      <section className="py-24">
        <EyebrowLabel>ANALISE TERRITORIAL</EyebrowLabel>

        {municipalityLoading ? (
          <div className="mt-8 h-[400px] flex items-center justify-center bg-surface-subtle rounded-lg border border-border">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand" />
              <p className="text-body text-ink-secondary">Carregando analise territorial...</p>
            </div>
          </div>
        ) : allMunicipios.length > 0 ? (
          <>
            <h2 className="text-h1 text-ink-display mt-2">
              {allMunicipios.length} municipios classificados
            </h2>
            {municipalityData?.meta && (
              <p className="text-body text-ink-secondary mt-2">
                {municipalityData.meta.partido_sigla} • {municipalityData.meta.uf} • {municipalityData.meta.cargo}
              </p>
            )}

            {/* Filtros de Classificação */}
            <div className="flex flex-wrap gap-2 mt-6">
              {(['fiel', 'pendular', 'disputavel', 'hostil'] as TerritorialClassification[]).map((classification) => {
                const isActive = activeFilters.includes(classification)
                const count = municipalityData?.estatisticas?.por_classificacao?.[classification] || 0
                return (
                  <button
                    key={classification}
                    onClick={() => {
                      setActiveFilters(prev =>
                        prev.includes(classification)
                          ? prev.filter(c => c !== classification)
                          : [...prev, classification]
                      )
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                      ${isActive
                        ? 'bg-surface-hover border-2 border-brand text-ink-display'
                        : 'bg-surface-subtle border border-border text-ink-secondary hover:bg-surface-hover'
                      }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CLASSIFICATION_COLORS[classification] }}
                    />
                    {CLASSIFICATION_LABELS[classification]}
                    <span className="text-xs text-ink-tertiary">({count})</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 rounded-lg overflow-hidden border border-border">
              <TerritorialMap
                municipios={allMunicipios}
                uf={municipalityData?.meta?.uf || campaign.state}
                height={400}
                activeFilters={activeFilters}
                showControls
                className="w-full"
              />
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/diagnostico/mapa')}
              >
                Ver mapa completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        ) : null}
      </section>

      {/* Block 4: Section Grid */}
      <section className="py-24">
        <EyebrowLabel>APROFUNDAR ANALISE</EyebrowLabel>
        <h2 className="text-h1 text-ink-display mt-2">6 dimensoes de analise</h2>

        <div className="grid grid-cols-3 gap-4 mt-12">
          {(Object.keys(SECTION_INFO) as SectionType[])
            .filter((type) => type !== 'executive_summary')
            .map((type) => {
              const info = SECTION_INFO[type]
              const Icon = SECTION_ICONS[type]
              const hasData = sections[type] !== undefined

              return (
                <Card
                  key={type}
                  className={`p-6 cursor-pointer transition-all ${
                    hasData
                      ? 'hover:bg-surface-hover hover:border-border'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={
                    hasData
                      ? () => navigate(`/diagnostico/secao/${type}`)
                      : undefined
                  }
                >
                  <Icon className="w-8 h-8 text-brand" />
                  <h3 className="text-h3 text-ink-display mt-4">{info.title}</h3>
                  <p className="text-small text-ink-secondary mt-2">
                    {info.description}
                  </p>
                  {hasData && (
                    <div className="mt-4 text-small text-brand font-medium flex items-center">
                      Acessar analise
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  )}
                </Card>
              )
            })}
        </div>
      </section>

      {/* Block 5: Next Steps */}
      <section className="py-24 pb-32">
        <EyebrowLabel>PROXIMOS PASSOS</EyebrowLabel>
        <h2 className="text-h1 text-ink-display mt-2">
          O que fazer com este diagnostico
        </h2>

        <div className="grid grid-cols-4 gap-4 mt-12">
          <ActionCard
            icon={Download}
            title="Baixar PDF"
            description="Exporte para compartilhar"
          />
          <ActionCard
            icon={Presentation}
            title="Modo Apresentacao"
            description="9 slides para projetar"
            onClick={() => navigate('/diagnostico/apresentar')}
          />
          <ActionCard
            icon={RefreshCw}
            title="Regenerar"
            description="Com outro tom de voz"
            onClick={() => navigate('/diagnostico/configuracoes')}
          />
          <ActionCard
            icon={History}
            title="Ver Historico"
            description={`${run.version} versoes geradas`}
            onClick={() => navigate('/diagnostico/historico')}
          />
        </div>
      </section>
    </div>
  )
}
