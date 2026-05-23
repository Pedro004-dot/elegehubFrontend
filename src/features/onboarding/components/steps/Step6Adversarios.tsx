import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, Users, Star } from 'lucide-react'
import { StepNavigation } from '../StepNavigation'
import * as api from '../../services/onboarding-api'
import type { Step6Data, OnboardingStatus, SuggestedAdversario } from '../../types'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface Step6AdversariosProps {
  initialData?: OnboardingStatus
  isSaving: boolean
  onSave: (data: Step6Data) => Promise<boolean>
  onNext: () => void
  onBack: () => void
  onSaveAndExit?: () => void
}

interface SelectedAdversario {
  id: number
  nome: string
  nomeUrna: string
  partido: string
  votos: number
  origem: 'sugerido' | 'manual'
  prioridade?: number
}

export function Step6Adversarios({
  initialData,
  isSaving,
  onSave,
  onNext,
  onBack,
  onSaveAndExit,
}: Step6AdversariosProps) {
  const { currentCampaign } = useAuth()
  const [suggestions, setSuggestions] = useState<SuggestedAdversario[]>([])
  const [selected, setSelected] = useState<SelectedAdversario[]>([])
  const [manualName, setManualName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load suggestions
  useEffect(() => {
    async function loadSuggestions() {
      if (!currentCampaign?.id) return

      setIsLoading(true)
      try {
        const data = await api.getSuggestedAdversarios(currentCampaign.id)
        setSuggestions(data)
      } catch (err) {
        setError('Erro ao carregar sugestoes de adversarios')
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [currentCampaign?.id])

  // Load existing selections
  useEffect(() => {
    if (initialData?.adversarios && initialData.adversarios.length > 0) {
      setSelected(
        initialData.adversarios.map((a) => ({
          id: a.adversarioCandidatoId || 0,
          nome: a.nomeManual || '',
          nomeUrna: a.nomeManual || '',
          partido: '',
          votos: 0,
          origem: a.origem,
          prioridade: a.prioridade,
        }))
      )
    }
  }, [initialData])

  const toggleAdversario = (adv: SuggestedAdversario) => {
    const isSelected = selected.some((s) => s.id === adv.candidatoId)

    if (isSelected) {
      setSelected(selected.filter((s) => s.id !== adv.candidatoId))
    } else if (selected.length < 5) {
      setSelected([
        ...selected,
        {
          id: adv.candidatoId,
          nome: adv.nome,
          nomeUrna: adv.nomeUrna,
          partido: adv.partido,
          votos: adv.votos2022,
          origem: 'sugerido',
          prioridade: selected.length + 1,
        },
      ])
    }
  }

  const addManual = () => {
    if (!manualName.trim() || selected.length >= 5) return

    setSelected([
      ...selected,
      {
        id: 0,
        nome: manualName.trim(),
        nomeUrna: manualName.trim(),
        partido: '',
        votos: 0,
        origem: 'manual',
        prioridade: selected.length + 1,
      },
    ])
    setManualName('')
  }

  const removeAdversario = (index: number) => {
    const newSelected = selected.filter((_, i) => i !== index)
    // Re-assign priorities
    setSelected(newSelected.map((s, i) => ({ ...s, prioridade: i + 1 })))
  }

  const handleNext = async () => {
    if (selected.length === 0) {
      setError('Selecione pelo menos um adversario')
      return
    }

    const data: Step6Data = {
      adversarios: selected.map((s) => ({
        adversarioCandidatoId: s.id || undefined,
        nomeManual: s.origem === 'manual' ? s.nome : undefined,
        prioridade: s.prioridade,
        origem: s.origem,
      })),
    }

    const success = await onSave(data)
    if (success) {
      onNext()
    }
  }

  const formatVotos = (votos: number) => {
    return votos.toLocaleString('pt-BR')
  }

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Selected adversarios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Adversarios Selecionados</h3>
                <p className="text-sm text-muted-foreground">
                  {selected.length}/5 selecionados
                </p>
              </div>
            </div>
          </div>

          {selected.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Selecione adversarios da lista abaixo ou adicione manualmente
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((adv, index) => (
                <Badge
                  key={`${adv.id}-${index}`}
                  variant="secondary"
                  className="gap-2 px-3 py-1.5"
                >
                  <Star className="h-3 w-3" />
                  {index + 1}. {adv.nomeUrna}
                  {adv.partido && ` (${adv.partido})`}
                  <button
                    type="button"
                    onClick={() => removeAdversario(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Manual add */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Adicionar manualmente</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do adversario"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addManual())}
              disabled={selected.length >= 5}
            />
            <Button
              onClick={addManual}
              disabled={!manualName.trim() || selected.length >= 5}
            >
              Adicionar
            </Button>
          </div>
        </div>

        {/* Suggestions grid */}
        <div className="space-y-4">
          <h3 className="font-medium">Sugestoes baseadas no TSE</h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando sugestoes...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Nenhuma sugestao encontrada. Complete o Step 1 com cargo e UF.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestions.slice(0, 10).map((adv) => {
                const isSelected = selected.some((s) => s.id === adv.candidatoId)

                return (
                  <Card
                    key={adv.candidatoId}
                    className={`cursor-pointer p-3 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => toggleAdversario(adv)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleAdversario(adv)}
                        disabled={!isSelected && selected.length >= 5}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{adv.nomeUrna}</p>
                        <p className="text-sm text-muted-foreground">
                          {adv.partido} • {formatVotos(adv.votos2022)} votos (2022)
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <StepNavigation
        currentStep={6}
        isSaving={isSaving}
        canGoBack
        canGoForward={selected.length > 0}
        onBack={onBack}
        onNext={handleNext}
        onSaveAndExit={onSaveAndExit}
      />
    </>
  )
}
