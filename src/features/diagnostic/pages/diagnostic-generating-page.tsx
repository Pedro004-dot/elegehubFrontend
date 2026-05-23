/**
 * DiagnosticGeneratingPage
 *
 * Full-screen loading page shown while diagnostic is being generated.
 * Shows progress, steps, and contextual messages.
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCurrentCampaign } from '@/features/auth/hooks/useCurrentCampaign'
import { useDiagnosticStatus } from '../hooks'
import { diagnosticService } from '../services/diagnostic.service'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EyebrowLabel } from '@/components/elegehub'
import { Check, Loader2, X, AlertCircle } from 'lucide-react'
import type { SectionType } from '../types'

// Contextual messages that rotate during generation
const CONTEXTUAL_MESSAGES = [
  'Cruzando registros de votacao de 2018 e 2022...',
  'Identificando zonas pendulares com maior alavancagem...',
  'Calculando CAC historico de candidatos eleitos similares...',
  'Mapeando vulnerabilidades exploraveis dos seus adversarios...',
  'Construindo pilares narrativos baseados no seu territorio...',
  'Sintetizando recomendacoes personalizadas...',
  'Analisando distribuicao geografica do eleitorado...',
  'Comparando perfil com candidatos eleitos anteriormente...',
]

// Step configuration
const GENERATION_STEPS: Array<{
  id: SectionType | 'setup' | 'finalize'
  label: string
}> = [
  { id: 'setup', label: 'Preparando contexto' },
  { id: 'candidate_profile', label: 'Analisando perfil do candidato' },
  { id: 'territorial', label: 'Analisando territorio' },
  { id: 'benchmark', label: 'Calculando benchmark' },
  { id: 'narrative', label: 'Construindo narrativa' },
  { id: 'competitors', label: 'Analisando adversarios' },
  { id: 'action_plan', label: 'Gerando plano de acao' },
  { id: 'executive_summary', label: 'Sintetizando sumario' },
  { id: 'finalize', label: 'Finalizando diagnostico' },
]

type StepStatus = 'pending' | 'running' | 'completed' | 'failed'

interface StepState {
  id: string
  label: string
  status: StepStatus
  duration?: number
}

export function DiagnosticGeneratingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const campaign = useCurrentCampaign()

  const [runId, setRunId] = useState<string | null>(searchParams.get('runId'))
  const [steps, setSteps] = useState<StepState[]>(
    GENERATION_STEPS.map((s) => ({ ...s, status: 'pending' }))
  )
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [, setIsStarting] = useState(!runId)

  // Start diagnostic if no runId provided
  const startGeneration = useCallback(async () => {
    if (runId) return

    setIsStarting(true)
    try {
      const result = await diagnosticService.startDiagnostic(campaign.id, {
        triggeredBy: 'manual',
      })
      setRunId(result.diagnostic_run_id)

      // Update URL with runId
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('runId', result.diagnostic_run_id)
      window.history.replaceState({}, '', newUrl.toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar geracao')
    } finally {
      setIsStarting(false)
    }
  }, [campaign.id, runId])

  // Start generation on mount if no runId
  useEffect(() => {
    if (!runId) {
      startGeneration()
    }
  }, [runId, startGeneration])

  // Poll status
  const { status, isPolling } = useDiagnosticStatus({
    campaignId: campaign.id,
    runId: runId || '',
    enabled: !!runId && !error,
    onComplete: () => {
      // Redirect to diagnostic page
      navigate('/diagnostico')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  // Update steps based on status
  useEffect(() => {
    if (!status) return

    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id === 'setup') {
          return { ...step, status: 'completed' }
        }

        if (step.id === 'finalize') {
          if (status.status === 'completed') {
            return { ...step, status: 'completed' }
          }
          if (status.sections_completed.length >= 6) {
            return { ...step, status: 'running' }
          }
          return step
        }

        const sectionId = step.id as SectionType
        if (status.sections_completed.includes(sectionId)) {
          return { ...step, status: 'completed' }
        }
        if (status.sections_running?.includes(sectionId)) {
          return { ...step, status: 'running' }
        }

        return step
      })
    )
  }, [status])

  // Rotate contextual messages
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      setCurrentMessageIndex((i) => (i + 1) % CONTEXTUAL_MESSAGES.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPolling])

  // Calculate progress
  const completedSteps = steps.filter((s) => s.status === 'completed').length
  const progress = Math.round((completedSteps / steps.length) * 100)

  // Get status icon for step
  const getStepIcon = (stepStatus: StepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return <Check className="w-4 h-4 text-success" />
      case 'running':
        return <Loader2 className="w-4 h-4 text-brand animate-spin" />
      case 'failed':
        return <X className="w-4 h-4 text-danger" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-border" />
    }
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-danger" />
          </div>

          <div className="space-y-2">
            <h1 className="text-h1 text-ink-display">Erro na geracao</h1>
            <p className="text-body text-ink-secondary">{error}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={startGeneration}>Tentar novamente</Button>
            <Button
              variant="outline"
              onClick={() => navigate('/diagnostico')}
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo would go here */}

      <div className="max-w-2xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <EyebrowLabel className="text-brand">PROCESSANDO</EyebrowLabel>
          <h1 className="text-display-sm text-ink-display">
            Gerando seu Diagnostico Estrategico
          </h1>
          <p className="text-body-lg text-ink-secondary">
            Isso leva 2 a 5 minutos. Nao feche esta janela.
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <Progress value={progress} className="h-1" />
          <div className="flex justify-between text-small font-mono text-ink-tertiary">
            <span>{status?.current_step || 'Iniciando...'}</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{
                backgroundColor:
                  step.status === 'running'
                    ? 'var(--brand-subtle)'
                    : 'transparent',
              }}
            >
              {getStepIcon(step.status)}
              <span
                className={`text-body ${
                  step.status === 'completed'
                    ? 'text-ink-display'
                    : step.status === 'running'
                    ? 'text-brand font-medium'
                    : 'text-ink-tertiary'
                }`}
              >
                {step.label}
              </span>
              {step.duration && (
                <span className="ml-auto text-small font-mono text-ink-tertiary">
                  {(step.duration / 1000).toFixed(0)}s
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Contextual message */}
        <Card className="p-6 bg-surface-subtle">
          <p className="text-body text-ink-secondary italic">
            {CONTEXTUAL_MESSAGES[currentMessageIndex]}
          </p>
        </Card>

        {/* Footer note */}
        <p className="text-center text-small text-ink-tertiary">
          Voce pode continuar usando o ElegeHub. Te notificaremos quando estiver
          pronto.
        </p>
      </div>
    </div>
  )
}
