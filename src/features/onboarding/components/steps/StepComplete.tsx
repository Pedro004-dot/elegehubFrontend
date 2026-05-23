import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import * as api from '../../services/onboarding-api'
import type { EnrichmentJob } from '../../types'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface StepCompleteProps {
  initialJobId?: string
}

interface JobStep {
  key: string
  label: string
  done: boolean
  loading: boolean
}

const JOB_STEP_LABELS: Record<string, string> = {
  match_tse: 'Coletando dados do TSE',
  suggest_adversarios: 'Analisando adversarios',
  prepare_diagnostic: 'Preparando diagnostico',
  finalize: 'Finalizando',
}

export function StepComplete({}: StepCompleteProps) {
  const { currentCampaign, refreshCampaigns } = useAuth()
  const navigate = useNavigate()

  const [job, setJob] = useState<EnrichmentJob | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = useCallback(async () => {
    if (!currentCampaign?.id) return

    try {
      const result = await api.getCompleteStatus(currentCampaign.id)

      if (result.job) {
        setJob(result.job)

        // Stop polling if completed or failed
        if (result.job.status === 'completed' || result.job.status === 'failed') {
          setIsPolling(false)

          if (result.job.status === 'failed') {
            setError(result.job.error || 'Erro ao processar diagnostico')
          }
        }
      }

      if (result.readyForDiagnostic) {
        setIsPolling(false)
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err)
    }
  }, [currentCampaign?.id])

  // Polling every 3 seconds
  useEffect(() => {
    checkStatus()

    if (!isPolling) return

    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [checkStatus, isPolling])

  const handleContinue = async () => {
    // Refresh campaigns to get updated status
    await refreshCampaigns()
    navigate('/mapa/plano-acao', { replace: true })
  }

  const getJobSteps = (): JobStep[] => {
    const allSteps = ['match_tse', 'suggest_adversarios', 'prepare_diagnostic', 'finalize']
    const completedSteps = job?.stepsCompleted || []

    return allSteps.map((step, index) => {
      const isDone = completedSteps.includes(step)
      const isLoading = !isDone && (
        job?.status === 'running' &&
        index === completedSteps.length
      )

      return {
        key: step,
        label: JOB_STEP_LABELS[step] || step,
        done: isDone,
        loading: isLoading,
      }
    })
  }

  const steps = getJobSteps()
  const isComplete = job?.status === 'completed'
  const isFailed = job?.status === 'failed'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center">
          {isComplete ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Diagnostico Pronto!</h1>
              <p className="mt-2 text-muted-foreground">
                Seu diagnostico personalizado foi gerado com sucesso.
              </p>
            </>
          ) : isFailed ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold">Erro no Processamento</h1>
              <p className="mt-2 text-muted-foreground">{error}</p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Gerando Diagnostico</h1>
              <p className="mt-2 text-muted-foreground">
                Estamos processando suas informacoes...
              </p>
            </>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mt-8 space-y-3">
          {steps.map((step) => (
            <div
              key={step.key}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              {step.done ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              ) : step.loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
              )}
              <span
                className={
                  step.done
                    ? 'text-foreground'
                    : step.loading
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8">
          {isComplete && (
            <Button className="w-full" size="lg" onClick={handleContinue}>
              Ver Meu Diagnostico
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {isFailed && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleContinue}
              >
                Continuar mesmo assim
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Voce pode completar o diagnostico depois
              </p>
            </div>
          )}

          {!isComplete && !isFailed && (
            <p className="text-center text-sm text-muted-foreground">
              Isso pode levar alguns segundos...
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
