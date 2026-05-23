import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Target, AlertTriangle, Sparkles } from 'lucide-react'
import { StepNavigation } from '../StepNavigation'
import { AIAssistButton } from '../AIAssistButton'
import * as api from '../../services/onboarding-api'
import type { Step7Data, OnboardingStatus, AIMetaVotosResponse } from '../../types'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface Step7ObjetivosProps {
  initialData?: OnboardingStatus
  isSaving: boolean
  onSave: (data: Step7Data) => Promise<{ jobId?: string }>
  onNext: () => void
  onBack: () => void
  onSaveAndExit?: () => void
}

const PRIORIDADES_DIAGNOSTICO = [
  { value: 'territorio', label: 'Analise de Territorio', description: 'Mapeamento de bases e oportunidades' },
  { value: 'adversarios', label: 'Analise de Adversarios', description: 'Comparativo com concorrentes' },
  { value: 'narrativa', label: 'Construcao de Narrativa', description: 'Posicionamento e mensagens-chave' },
  { value: 'orcamento', label: 'Estrategia de Orcamento', description: 'Alocacao otimizada de recursos' },
  { value: 'riscos', label: 'Mapeamento de Riscos', description: 'Vulnerabilidades e mitigacoes' },
]

export function Step7Objetivos({
  initialData,
  isSaving,
  onSave,
  onNext,
  onBack,
  onSaveAndExit,
}: Step7ObjetivosProps) {
  const { currentCampaign } = useAuth()
  const [metaVotos, setMetaVotos] = useState<number | undefined>()
  const [preocupacaoPrincipal, setPreocupacaoPrincipal] = useState('')
  const [prioridades, setPrioridades] = useState<string[]>([
    'territorio',
    'adversarios',
    'narrativa',
    'orcamento',
    'riscos',
  ])
  const [error] = useState<string | null>(null)

  // Load existing data
  useEffect(() => {
    if (initialData?.objetivos) {
      const o = initialData.objetivos
      setMetaVotos(o.metaVotos)
      setPreocupacaoPrincipal(o.preocupacaoPrincipal || '')
      if (o.prioridadesDiagnostico && o.prioridadesDiagnostico.length > 0) {
        setPrioridades(o.prioridadesDiagnostico)
      }
    }
  }, [initialData])

  const togglePrioridade = (value: string) => {
    if (prioridades.includes(value)) {
      setPrioridades(prioridades.filter((p) => p !== value))
    } else {
      setPrioridades([...prioridades, value])
    }
  }

  const handleSuggestMeta = async (): Promise<AIMetaVotosResponse> => {
    if (!currentCampaign?.id) throw new Error('Campanha nao encontrada')
    const result = await api.aiSuggestMetaVotos(currentCampaign.id)
    return result
  }

  const handleAcceptMeta = (suggestion: AIMetaVotosResponse) => {
    setMetaVotos(suggestion.meta_realista)
  }

  const formatVotos = (votos: number) => {
    return votos.toLocaleString('pt-BR')
  }

  const handleNext = async () => {
    const data: Step7Data = {
      metaVotos,
      preocupacaoPrincipal: preocupacaoPrincipal || undefined,
      prioridadesDiagnostico: prioridades,
    }

    const result = await onSave(data)
    if (result.jobId) {
      onNext() // Will go to StepComplete
    }
  }

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Meta de Votos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Meta de Votos</h3>
                <p className="text-sm text-muted-foreground">
                  Quantos votos voce pretende conquistar?
                </p>
              </div>
            </div>
            <AIAssistButton
              onSuggest={handleSuggestMeta}
              onAccept={handleAcceptMeta}
              renderSuggestion={(s) => (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-background p-3 text-center">
                      <p className="text-xs text-muted-foreground">Minima</p>
                      <p className="text-lg font-bold">{formatVotos(s.meta_minima)}</p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Realista</p>
                      <p className="text-lg font-bold text-primary">{formatVotos(s.meta_realista)}</p>
                    </div>
                    <div className="rounded-lg bg-background p-3 text-center">
                      <p className="text-xs text-muted-foreground">Otimista</p>
                      <p className="text-lg font-bold">{formatVotos(s.meta_otimista)}</p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Justificativa:</p>
                    <p className="text-muted-foreground">{s.justificativa}</p>
                  </div>

                  {s.benchmarks.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium">Benchmarks:</p>
                      <ul className="text-muted-foreground">
                        {s.benchmarks.map((b, i) => (
                          <li key={i}>
                            {b.referencia}: {formatVotos(b.votos)} votos
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              buttonLabel="Sugerir meta"
              dialogTitle="Meta de votos sugerida pela IA"
              disabled={!currentCampaign?.id}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaVotos">Meta de votos</Label>
            <Input
              id="metaVotos"
              type="number"
              placeholder="Ex: 80000"
              value={metaVotos || ''}
              onChange={(e) => setMetaVotos(e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={isSaving}
            />
            {metaVotos && (
              <p className="text-xs text-muted-foreground">
                {formatVotos(metaVotos)} votos
              </p>
            )}
          </div>
        </div>

        {/* Preocupacao Principal */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Principal Preocupacao</h3>
              <p className="text-sm text-muted-foreground">
                O que mais te preocupa nesta campanha?
              </p>
            </div>
          </div>

          <Textarea
            placeholder="Ex: Tenho dificuldade em alcançar o eleitor jovem, meu principal adversario tem muito mais recursos financeiros..."
            value={preocupacaoPrincipal}
            onChange={(e) => setPreocupacaoPrincipal(e.target.value)}
            rows={4}
            disabled={isSaving}
          />
        </div>

        {/* Prioridades do Diagnostico */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Prioridades do Diagnostico</h3>
              <p className="text-sm text-muted-foreground">
                Quais analises sao mais importantes para voce?
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {PRIORIDADES_DIAGNOSTICO.map((p) => (
              <div
                key={p.value}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Checkbox
                  id={p.value}
                  checked={prioridades.includes(p.value)}
                  onCheckedChange={() => togglePrioridade(p.value)}
                />
                <div className="flex-1">
                  <Label htmlFor={p.value} className="cursor-pointer font-medium">
                    {p.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="font-medium text-primary">Pronto para gerar seu diagnostico!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ao clicar em "Concluir", vamos processar todas as informacoes e gerar um diagnostico personalizado para sua campanha.
          </p>
        </div>
      </div>

      <StepNavigation
        currentStep={7}
        isSaving={isSaving}
        canGoBack
        canGoForward
        onBack={onBack}
        onNext={handleNext}
        onSaveAndExit={onSaveAndExit}
        nextLabel="Concluir e Gerar Diagnostico"
        isLastStep
      />
    </>
  )
}
