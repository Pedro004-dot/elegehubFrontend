/**
 * DiagnosticSettingsPage
 *
 * Configure diagnostic generation settings including tone profile.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentCampaign } from '@/features/auth/hooks/useCurrentCampaign'
import { useDiagnosticSettings } from '../hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  SectionHeader,
  EmptyState,
} from '@/components/elegehub'
import { Settings, RefreshCw, Check, Loader2 } from 'lucide-react'
import type { ToneProfileId } from '../types'

const TONE_PROFILES: Array<{
  id: ToneProfileId
  title: string
  description: string
  example: string
}> = [
  {
    id: 'tecnico',
    title: 'Tecnico',
    description: 'Linguagem formal com foco em dados e metricas',
    example:
      '"A analise indica uma taxa de conversao de 23% nos municipios pendulares, com margem de erro de 2.5 pontos percentuais."',
  },
  {
    id: 'marketeiro',
    title: 'Marketeiro',
    description: 'Tom persuasivo e orientado a acao',
    example:
      '"Voce tem uma oportunidade unica de conquistar os municipios pendulares - 120 mil votos esperando por uma mensagem forte!"',
  },
  {
    id: 'estrategista',
    title: 'Estrategista',
    description: 'Equilibrio entre dados e insights acionaveis',
    example:
      '"Os municipios pendulares representam seu maior potencial de crescimento. Foco em presenca local pode converter 15-20% desse eleitorado."',
  },
  {
    id: 'custom',
    title: 'Personalizado',
    description: 'Defina seu proprio tom de voz',
    example: 'Configure abaixo as instrucoes para o tom personalizado.',
  },
]

export function DiagnosticSettingsPage() {
  const navigate = useNavigate()
  const campaign = useCurrentCampaign()
  const {
    settings,
    loading,
    error,
    updating,
    updateSettings,
    refetch,
  } = useDiagnosticSettings({ campaignId: campaign.id })

  const [selectedTone, setSelectedTone] = useState<ToneProfileId | null>(null)
  const [customInstructions, setCustomInstructions] = useState('')
  const [autoRegenerate, setAutoRegenerate] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize state from settings
  useState(() => {
    if (settings) {
      setSelectedTone(settings.preferred_tone_profile)
      setCustomInstructions(settings.custom_tone_instructions || '')
      setAutoRegenerate(settings.auto_regenerate_monthly)
    }
  })

  const handleToneSelect = (tone: ToneProfileId) => {
    setSelectedTone(tone)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!selectedTone) return

    try {
      await updateSettings({
        preferred_tone_profile: selectedTone,
        custom_tone_instructions:
          selectedTone === 'custom' ? customInstructions : undefined,
        auto_regenerate_monthly: autoRegenerate,
      })
      setHasChanges(false)
    } catch {
      // Error handled by hook
    }
  }

  const handleRegenerate = async () => {
    await handleSave()
    navigate('/diagnostico/gerando')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body text-ink-secondary">
            Carregando configuracoes...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={Settings}
        title="Erro ao carregar configuracoes"
        description={error.message}
        action={{ label: 'Tentar novamente', onClick: refetch }}
      />
    )
  }

  const currentTone = selectedTone || settings?.preferred_tone_profile || 'estrategista'

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
      <SectionHeader
        eyebrow="CONFIGURACOES"
        title="Tom do Diagnostico"
        description="Escolha como o diagnostico sera escrito. Voce pode mudar a qualquer momento."
      />

      {/* Tone Selection */}
      <div className="mt-8">
        <h3 className="text-h3 text-ink-display mb-4">Tom de Voz</h3>
        <div className="grid grid-cols-2 gap-4">
          {TONE_PROFILES.map((profile) => {
            const isSelected = currentTone === profile.id
            return (
              <Card
                key={profile.id}
                className={`p-5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand bg-brand-subtle ring-2 ring-brand'
                    : 'hover:bg-surface-hover'
                }`}
                onClick={() => handleToneSelect(profile.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-h3 text-ink-display">{profile.title}</h4>
                    <p className="text-small text-ink-secondary mt-1">
                      {profile.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-small text-ink-tertiary italic mt-4 line-clamp-2">
                  {profile.example}
                </p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Custom Instructions */}
      {currentTone === 'custom' && (
        <div className="mt-8">
          <h3 className="text-h3 text-ink-display mb-4">Instrucoes Personalizadas</h3>
          <Textarea
            value={customInstructions}
            onChange={(e) => {
              setCustomInstructions(e.target.value)
              setHasChanges(true)
            }}
            placeholder="Descreva como voce quer que o diagnostico seja escrito. Ex: 'Use linguagem direta, evite jargoes, foque em acoes praticas...'"
            className="min-h-[120px]"
          />
        </div>
      )}

      {/* Auto Regenerate */}
      <div className="mt-8 p-4 bg-surface-subtle rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-regenerate" className="text-body text-ink-display">
              Regenerar automaticamente
            </Label>
            <p className="text-small text-ink-tertiary mt-1">
              Gerar novo diagnostico a cada 30 dias automaticamente
            </p>
          </div>
          <Switch
            id="auto-regenerate"
            checked={autoRegenerate}
            onCheckedChange={(checked) => {
              setAutoRegenerate(checked)
              setHasChanges(true)
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={() => navigate('/diagnostico')}>
          Cancelar
        </Button>
        <div className="flex gap-3">
          {hasChanges && (
            <Button variant="outline" onClick={handleSave} disabled={updating}>
              {updating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          )}
          <Button onClick={handleRegenerate} disabled={updating}>
            {updating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Regenerar Diagnostico
          </Button>
        </div>
      </div>
    </div>
  )
}
