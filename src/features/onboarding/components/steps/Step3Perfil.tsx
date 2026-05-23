import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { StepNavigation } from '../StepNavigation'
import { AIAssistButton } from '../AIAssistButton'
import * as api from '../../services/onboarding-api'
import type { Step3Data, OnboardingStatus, AIBandeirasResponse, AIRefinedHistoria } from '../../types'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface Step3PerfilProps {
  initialData?: OnboardingStatus
  isSaving: boolean
  onSave: (data: Step3Data) => Promise<boolean>
  onNext: () => void
  onBack: () => void
  onSaveAndExit?: () => void
}

const ESCOLARIDADE_OPTIONS = [
  { value: 'fundamental', label: 'Ensino Fundamental' },
  { value: 'medio', label: 'Ensino Medio' },
  { value: 'superior', label: 'Ensino Superior' },
  { value: 'pos', label: 'Pos-Graduacao' },
]

const RELIGIAO_OPTIONS = [
  { value: 'catolica', label: 'Catolica' },
  { value: 'evangelica', label: 'Evangelica' },
  { value: 'espirita', label: 'Espirita' },
  { value: 'outra', label: 'Outra' },
  { value: 'nenhuma', label: 'Sem religiao' },
]

export function Step3Perfil({
  initialData,
  isSaving,
  onSave,
  onNext,
  onBack,
  onSaveAndExit,
}: Step3PerfilProps) {
  const { currentCampaign } = useAuth()

  const [idade, setIdade] = useState<number | undefined>()
  const [escolaridade, setEscolaridade] = useState<string>('')
  const [profissao, setProfissao] = useState('')
  const [religiao, setReligiao] = useState('')
  const [denominacao, setDenominacao] = useState('')
  const [historiaTexto, setHistoriaTexto] = useState('')
  const [bandeiras, setBandeiras] = useState<string[]>([])
  const [novaBandeira, setNovaBandeira] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Load existing data
  useEffect(() => {
    if (initialData?.profile) {
      const p = initialData.profile
      setIdade(p.idade)
      setEscolaridade(p.escolaridade || '')
      setProfissao(p.profissao || '')
      setReligiao(p.religiao || '')
      setDenominacao(p.denominacao || '')
      setHistoriaTexto(p.historiaTexto || '')
    }
    if (initialData?.bandeiras) {
      setBandeiras(initialData.bandeiras.map((b) => b.bandeira))
    }
  }, [initialData])

  const addBandeira = () => {
    if (novaBandeira.trim() && bandeiras.length < 3) {
      setBandeiras([...bandeiras, novaBandeira.trim()])
      setNovaBandeira('')
    }
  }

  const removeBandeira = (index: number) => {
    setBandeiras(bandeiras.filter((_, i) => i !== index))
  }

  const handleSuggestBandeiras = async (): Promise<AIBandeirasResponse> => {
    if (!currentCampaign?.id) throw new Error('Campanha nao encontrada')
    return api.aiSuggestBandeiras(currentCampaign.id, {
      profissao,
      idade,
      historico: historiaTexto,
    })
  }

  const handleAcceptBandeiras = (suggestion: AIBandeirasResponse) => {
    // Take first 3 suggestions
    const newBandeiras = suggestion.bandeiras.slice(0, 3).map((b) => b.texto)
    setBandeiras(newBandeiras)
  }

  const handleRefineHistoria = async (): Promise<AIRefinedHistoria> => {
    if (!currentCampaign?.id) throw new Error('Campanha nao encontrada')
    return api.aiRefineHistoria(currentCampaign.id, {
      textoOriginal: historiaTexto,
      bandeiras,
    })
  }

  const handleAcceptHistoria = (suggestion: AIRefinedHistoria) => {
    setHistoriaTexto(suggestion.texto_refinado)
  }

  const handleNext = async () => {
    if (bandeiras.length === 0) {
      setError('Adicione pelo menos uma bandeira de campanha')
      return
    }

    const data: Step3Data = {
      idade,
      escolaridade: escolaridade as Step3Data['escolaridade'],
      profissao: profissao || undefined,
      religiao: religiao || undefined,
      denominacao: denominacao || undefined,
      historiaTexto: historiaTexto || undefined,
      bandeiras: bandeiras.map((b, i) => ({ bandeira: b, ordem: i + 1 })),
    }

    const success = await onSave(data)
    if (success) {
      onNext()
    }
  }

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Informacoes Pessoais */}
        <div className="space-y-4">
          <h3 className="font-medium">Informacoes Pessoais</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idade">Idade</Label>
              <Input
                id="idade"
                type="number"
                placeholder="45"
                value={idade || ''}
                onChange={(e) => setIdade(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="escolaridade">Escolaridade</Label>
              <Select value={escolaridade} onValueChange={(value) => value && setEscolaridade(value)} disabled={isSaving}>
                <SelectTrigger id="escolaridade">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ESCOLARIDADE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profissao">Profissao</Label>
            <Input
              id="profissao"
              type="text"
              placeholder="Ex: Advogado, Medico, Professor"
              value={profissao}
              onChange={(e) => setProfissao(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="religiao">Religiao</Label>
              <Select value={religiao} onValueChange={(value) => value && setReligiao(value)} disabled={isSaving}>
                <SelectTrigger id="religiao">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {RELIGIAO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {religiao === 'evangelica' && (
              <div className="space-y-2">
                <Label htmlFor="denominacao">Denominacao</Label>
                <Input
                  id="denominacao"
                  type="text"
                  placeholder="Ex: Assembleia de Deus"
                  value={denominacao}
                  onChange={(e) => setDenominacao(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bandeiras */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Bandeiras de Campanha *</h3>
              <p className="text-sm text-muted-foreground">
                Defina ate 3 temas principais da sua campanha
              </p>
            </div>
            <AIAssistButton
              onSuggest={handleSuggestBandeiras}
              onAccept={handleAcceptBandeiras}
              renderSuggestion={(s) => (
                <div className="space-y-2">
                  {s.bandeiras.map((b, i) => (
                    <div key={i} className="rounded bg-background p-2">
                      <p className="font-medium">{b.texto}</p>
                      <p className="text-xs text-muted-foreground">{b.justificativa}</p>
                    </div>
                  ))}
                </div>
              )}
              buttonLabel="Sugerir bandeiras"
              dialogTitle="Bandeiras sugeridas pela IA"
              disabled={!currentCampaign?.id}
            />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ex: Educacao de qualidade"
              value={novaBandeira}
              onChange={(e) => setNovaBandeira(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBandeira())}
              disabled={isSaving || bandeiras.length >= 3}
            />
            <Button
              type="button"
              onClick={addBandeira}
              disabled={!novaBandeira.trim() || bandeiras.length >= 3}
            >
              Adicionar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {bandeiras.map((b, i) => (
              <Badge key={i} variant="secondary" className="gap-1 px-3 py-1.5">
                {i + 1}. {b}
                <button
                  type="button"
                  onClick={() => removeBandeira(i)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Historia */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sua Historia</h3>
              <p className="text-sm text-muted-foreground">
                Conte sua trajetoria e motivacao para ser candidato
              </p>
            </div>
            {historiaTexto.length > 50 && (
              <AIAssistButton
                onSuggest={handleRefineHistoria}
                onAccept={handleAcceptHistoria}
                renderSuggestion={(s) => (
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap text-sm">{s.texto_refinado}</p>
                    {s.sugestoes_adicionais.length > 0 && (
                      <div className="border-t pt-2">
                        <p className="text-xs font-medium text-muted-foreground">Sugestoes:</p>
                        <ul className="text-xs text-muted-foreground">
                          {s.sugestoes_adicionais.map((sug, i) => (
                            <li key={i}>• {sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                buttonLabel="Melhorar texto"
                dialogTitle="Texto refinado pela IA"
                disabled={!currentCampaign?.id}
              />
            )}
          </div>

          <Textarea
            placeholder="Escreva um breve texto sobre sua trajetoria, motivacoes e o que pretende fazer pelo estado/municipio..."
            value={historiaTexto}
            onChange={(e) => setHistoriaTexto(e.target.value)}
            rows={6}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            {historiaTexto.length} caracteres
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <StepNavigation
        currentStep={3}
        isSaving={isSaving}
        canGoBack
        canGoForward={bandeiras.length > 0}
        onBack={onBack}
        onNext={handleNext}
        onSaveAndExit={onSaveAndExit}
      />
    </>
  )
}
