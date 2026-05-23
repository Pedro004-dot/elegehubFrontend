/**
 * DiagnosticPresentPage
 *
 * Fullscreen presentation mode with 9 slides.
 * Controls: Arrow keys, Space, Backspace, Escape
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentCampaign } from '@/features/auth/hooks/useCurrentCampaign'
import { useDiagnostic } from '../hooks'
import { Button } from '@/components/ui/button'
import { EyebrowLabel } from '@/components/elegehub'
import {
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { ExecutiveSummaryData, TerritorialData, NarrativeData, NarrativePillar } from '../types'

const TOTAL_SLIDES = 9

export function DiagnosticPresentPage() {
  const navigate = useNavigate()
  const campaign = useCurrentCampaign()
  const { diagnostic, loading } = useDiagnostic({ campaignId: campaign.id })

  const [currentSlide, setCurrentSlide] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToSlide = useCallback(
    (slide: number) => {
      if (slide < 1 || slide > TOTAL_SLIDES || isTransitioning) return
      setIsTransitioning(true)
      setCurrentSlide(slide)
      setTimeout(() => setIsTransitioning(false), 300)
    },
    [isTransitioning]
  )

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1)
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1)
  }, [currentSlide, goToSlide])

  const exitPresentation = useCallback(() => {
    navigate('/diagnostico')
  }, [navigate])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextSlide()
          break
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault()
          prevSlide()
          break
        case 'Escape':
          e.preventDefault()
          exitPresentation()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide, exitPresentation])

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-ink-display">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body text-white/60">Carregando apresentacao...</p>
        </div>
      </div>
    )
  }

  if (!diagnostic) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-ink-display">
        <div className="text-center space-y-4">
          <p className="text-h2 text-white">Nenhum diagnostico disponivel</p>
          <Button variant="outline" onClick={exitPresentation}>
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  const executiveSummary = diagnostic.sections.executive_summary as
    | ExecutiveSummaryData
    | undefined
  const territorial = diagnostic.sections.territorial as
    | TerritorialData
    | undefined
  const narrative = diagnostic.sections.narrative as NarrativeData | undefined

  return (
    <div className="h-screen w-screen bg-ink-display overflow-hidden relative">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10"
          onClick={exitPresentation}
        >
          <X className="w-4 h-4 mr-2" />
          Sair
        </Button>
        <span className="text-small font-mono text-white/40 tabular-nums">
          {currentSlide} / {TOTAL_SLIDES}
        </span>
      </div>

      {/* Slide Content */}
      <div
        className={`h-full w-full flex items-center justify-center p-16 transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {renderSlide(
          currentSlide,
          campaign,
          executiveSummary,
          territorial,
          narrative
        )}
      </div>

      {/* Navigation Arrows */}
      {currentSlide > 1 && (
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {currentSlide < TOTAL_SLIDES && (
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
          aria-label="Proximo slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i + 1)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === i + 1
                ? 'bg-white w-6'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function renderSlide(
  slide: number,
  campaign: { candidate_name: string; position: string; state: string; year: number },
  executiveSummary?: ExecutiveSummaryData,
  territorial?: TerritorialData,
  narrative?: NarrativeData
) {
  switch (slide) {
    case 1:
      return <SlideTitle campaign={campaign} />
    case 2:
      return <SlideMetrics summary={executiveSummary} />
    case 3:
      return <SlideCurrentState summary={executiveSummary} />
    case 4:
      return <SlideStrengthRisk summary={executiveSummary} />
    case 5:
      return <SlideStrategicBet summary={executiveSummary} />
    case 6:
      return <SlideTerritorial territorial={territorial} />
    case 7:
      return <SlideNarrative narrative={narrative} />
    case 8:
      return <SlideTop3Actions summary={executiveSummary} />
    case 9:
      return <SlideFinal campaign={campaign} />
    default:
      return null
  }
}

function SlideTitle({
  campaign,
}: {
  campaign: { candidate_name: string; position: string; state: string; year: number }
}) {
  return (
    <div className="text-center max-w-4xl">
      <EyebrowLabel className="text-brand text-lg tracking-widest">
        DIAGNOSTICO ESTRATEGICO
      </EyebrowLabel>
      <h1 className="text-[80px] font-bold text-white tracking-tighter leading-none mt-6">
        {campaign.candidate_name}
      </h1>
      <p className="text-2xl text-white/60 mt-8">
        Candidatura a {campaign.position} • {campaign.state} • Eleicoes{' '}
        {campaign.year}
      </p>
    </div>
  )
}

function SlideMetrics({ summary }: { summary?: ExecutiveSummaryData }) {
  if (!summary) return <SlideEmpty />

  return (
    <div className="max-w-5xl w-full">
      <EyebrowLabel className="text-brand text-lg tracking-widest">
        NUMEROS CHAVE
      </EyebrowLabel>
      <div className="grid grid-cols-3 gap-12 mt-12">
        <div>
          <p className="text-[72px] font-bold text-white tabular-nums leading-none">
            {summary.resumo_numerico.votos_meta.toLocaleString('pt-BR')}
          </p>
          <p className="text-xl text-white/60 mt-4">Meta de votos</p>
        </div>
        <div>
          <p className="text-[72px] font-bold text-white tabular-nums leading-none">
            {summary.resumo_numerico.votos_projecao.toLocaleString('pt-BR')}
          </p>
          <p className="text-xl text-white/60 mt-4">Projecao realista</p>
        </div>
        <div>
          <p className="text-[72px] font-bold text-white tabular-nums leading-none">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(summary.resumo_numerico.orcamento_recomendado)}
          </p>
          <p className="text-xl text-white/60 mt-4">Orcamento recomendado</p>
        </div>
      </div>
    </div>
  )
}

function SlideCurrentState({ summary }: { summary?: ExecutiveSummaryData }) {
  if (!summary) return <SlideEmpty />

  return (
    <div className="max-w-4xl text-center">
      <EyebrowLabel className="text-brand text-lg tracking-widest">
        ESTADO ATUAL
      </EyebrowLabel>
      <p className="text-[48px] font-medium text-white leading-tight mt-8">
        {summary.estado_atual_candidatura}
      </p>
    </div>
  )
}

function SlideStrengthRisk({ summary }: { summary?: ExecutiveSummaryData }) {
  if (!summary) return <SlideEmpty />

  return (
    <div className="max-w-5xl w-full">
      <div className="grid grid-cols-2 gap-12">
        <div className="p-8 rounded-2xl bg-success/10 border-l-4 border-success">
          <EyebrowLabel className="text-success text-lg tracking-widest">
            PRINCIPAL FORCA
          </EyebrowLabel>
          <h3 className="text-3xl font-bold text-white mt-4">
            {summary.principal_forca.titulo}
          </h3>
          <p className="text-xl text-white/70 mt-4 leading-relaxed">
            {summary.principal_forca.frase}
          </p>
        </div>
        <div className="p-8 rounded-2xl bg-danger/10 border-l-4 border-danger">
          <EyebrowLabel className="text-danger text-lg tracking-widest">
            MAIOR RISCO
          </EyebrowLabel>
          <h3 className="text-3xl font-bold text-white mt-4">
            {summary.maior_risco.titulo}
          </h3>
          <p className="text-xl text-white/70 mt-4 leading-relaxed">
            {summary.maior_risco.frase}
          </p>
        </div>
      </div>
    </div>
  )
}

function SlideStrategicBet({ summary }: { summary?: ExecutiveSummaryData }) {
  if (!summary) return <SlideEmpty />

  return (
    <div className="max-w-4xl text-center">
      <EyebrowLabel className="text-brand text-lg tracking-widest">
        APOSTA ESTRATEGICA RECOMENDADA
      </EyebrowLabel>
      <p className="text-[36px] text-white leading-relaxed mt-8">
        {summary.aposta_estrategica_recomendada}
      </p>
    </div>
  )
}

function SlideTerritorial({ territorial }: { territorial?: TerritorialData }) {
  if (!territorial) return <SlideEmpty />

  const counts = territorial.municipios_classificados.reduce(
    (acc, m) => {
      const classification = m.classificacao || m.classification || 'pendular'
      acc[classification] = (acc[classification] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="max-w-5xl w-full">
      <EyebrowLabel className="text-brand text-lg tracking-widest">
        ANALISE TERRITORIAL
      </EyebrowLabel>
      <h2 className="text-[56px] font-bold text-white mt-4">
        {territorial.municipios_classificados.length} municipios classificados
      </h2>
      <div className="grid grid-cols-4 gap-8 mt-12">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success mx-auto mb-4" />
          <p className="text-4xl font-bold text-white tabular-nums">
            {counts.fiel || 0}
          </p>
          <p className="text-lg text-white/60 mt-2">Fieis</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-warning mx-auto mb-4" />
          <p className="text-4xl font-bold text-white tabular-nums">
            {counts.pendular || 0}
          </p>
          <p className="text-lg text-white/60 mt-2">Pendulares</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-danger mx-auto mb-4" />
          <p className="text-4xl font-bold text-white tabular-nums">
            {counts.hostil || 0}
          </p>
          <p className="text-lg text-white/60 mt-2">Hostis</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-ink-tertiary mx-auto mb-4" />
          <p className="text-4xl font-bold text-white tabular-nums">
            {counts.alta_abstencao || 0}
          </p>
          <p className="text-lg text-white/60 mt-2">Alta Abstencao</p>
        </div>
      </div>
    </div>
  )
}

function SlideNarrative({ narrative }: { narrative?: NarrativeData }) {
  if (!narrative) return <SlideEmpty />

  const pilares = (narrative.pilares || narrative.pilares_narrativos || []) as NarrativePillar[]

  return (
    <div className="max-w-5xl w-full">
      <EyebrowLabel className="text-brand text-lg tracking-widest">
        PILARES NARRATIVOS
      </EyebrowLabel>
      <div className="grid grid-cols-3 gap-8 mt-12">
        {pilares.slice(0, 3).map((pilar, i) => (
          <div key={i} className="p-6 rounded-xl bg-white/5 border-t-4 border-brand">
            <span className="text-4xl font-bold text-brand">0{i + 1}</span>
            <h3 className="text-2xl font-bold text-white mt-4">
              {pilar.titulo || pilar.tema}
            </h3>
            <p className="text-lg text-white/60 mt-3 leading-relaxed">
              {pilar.descricao || pilar.frase_sintese}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideTop3Actions({ summary }: { summary?: ExecutiveSummaryData }) {
  if (!summary) return <SlideEmpty />

  return (
    <div className="max-w-5xl w-full">
      <EyebrowLabel className="text-brand text-lg tracking-widest">
        PROXIMAS 3 ACOES EM 30 DIAS
      </EyebrowLabel>
      <div className="space-y-6 mt-12">
        {summary.top_3_acoes_30_dias.map((acao, i) => (
          <div
            key={i}
            className="flex gap-8 p-6 rounded-xl bg-white/5"
          >
            <span className="text-5xl font-bold text-brand tabular-nums">
              0{i + 1}
            </span>
            <div>
              <h3 className="text-2xl font-bold text-white">{acao.acao}</h3>
              <p className="text-lg text-white/40 font-mono mt-1">{acao.prazo}</p>
              <p className="text-lg text-white/60 mt-3">{acao.impacto_esperado}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideFinal({
  campaign,
}: {
  campaign: { candidate_name: string }
}) {
  return (
    <div className="text-center max-w-4xl">
      <h1 className="text-[64px] font-bold text-white tracking-tighter">
        Vamos vencer juntos.
      </h1>
      <p className="text-2xl text-white/60 mt-8">
        Diagnostico Estrategico • {campaign.candidate_name}
      </p>
      <div className="mt-16">
        <EyebrowLabel className="text-brand text-base tracking-widest">
          ELEGEHUB
        </EyebrowLabel>
      </div>
    </div>
  )
}

function SlideEmpty() {
  return (
    <div className="text-center">
      <p className="text-2xl text-white/40">Dados nao disponiveis</p>
    </div>
  )
}
