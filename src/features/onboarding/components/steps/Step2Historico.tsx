import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, Loader2, Search } from 'lucide-react'
import { StepNavigation } from '../StepNavigation'
import * as api from '../../services/onboarding-api'
import type { Step2Data, OnboardingStatus, TseMatchResponse } from '../../types'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface HistoricoItem {
  id: string
  ano: number
  cargo: string
  partidoSigla?: string
  uf?: string
  votosObtidos?: number
  eleito?: boolean
  origem: 'tse' | 'manual'
  tseCandidatoId?: number
}

interface Step2HistoricoProps {
  initialData?: OnboardingStatus
  isSaving: boolean
  onSave: (data: Step2Data) => Promise<boolean>
  onNext: () => void
  onBack: () => void
  onSaveAndExit?: () => void
}

const ANOS = [2022, 2020, 2018, 2016, 2014, 2012, 2010, 2008, 2006, 2004, 2002, 2000]
const CARGOS = [
  'DEPUTADO ESTADUAL',
  'DEPUTADO FEDERAL',
  'SENADOR',
  'GOVERNADOR',
  'PREFEITO',
  'VEREADOR',
]

export function Step2Historico({
  initialData,
  isSaving,
  onSave,
  onNext,
  onBack,
  onSaveAndExit,
}: Step2HistoricoProps) {
  const { currentCampaign } = useAuth()
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [isLoadingTse, setIsLoadingTse] = useState(false)
  const [tseSearched, setTseSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing historico
  useEffect(() => {
    if (initialData?.historico && initialData.historico.length > 0) {
      setHistorico(
        initialData.historico.map((h, i) => ({
          id: h.id || `existing-${i}`,
          ano: h.ano,
          cargo: h.cargo,
          partidoSigla: h.partidoSigla,
          uf: h.uf,
          votosObtidos: h.votosObtidos,
          eleito: h.eleito,
          origem: h.origem,
          tseCandidatoId: h.tseCandidatoId,
        }))
      )
      setTseSearched(true)
    }
  }, [initialData])

  const searchTse = async () => {
    if (!currentCampaign?.id) return

    setIsLoadingTse(true)
    setError(null)

    try {
      const result: TseMatchResponse = await api.getTseMatch(currentCampaign.id)

      if (result.found && result.historico.length > 0) {
        const tseHistorico: HistoricoItem[] = result.historico.map((h, i) => ({
          id: `tse-${i}`,
          ano: h.ano,
          cargo: h.cargo,
          partidoSigla: h.partido,
          uf: h.uf,
          votosObtidos: h.votos,
          eleito: h.eleito,
          origem: 'tse' as const,
          tseCandidatoId: h.id,
        }))
        setHistorico(tseHistorico)
      } else {
        setError('Nenhum historico encontrado no TSE. Adicione manualmente.')
      }
      setTseSearched(true)
    } catch (err) {
      setError('Erro ao buscar historico do TSE')
    } finally {
      setIsLoadingTse(false)
    }
  }

  const addHistorico = () => {
    setHistorico([
      ...historico,
      {
        id: `new-${Date.now()}`,
        ano: 2022,
        cargo: 'DEPUTADO ESTADUAL',
        origem: 'manual',
      },
    ])
  }

  const updateHistorico = (id: string, updates: Partial<HistoricoItem>) => {
    setHistorico(
      historico.map((h) => (h.id === id ? { ...h, ...updates } : h))
    )
  }

  const removeHistorico = (id: string) => {
    setHistorico(historico.filter((h) => h.id !== id))
  }

  const handleNext = async () => {
    const data: Step2Data = {
      historico: historico.map((h) => ({
        ano: h.ano,
        cargo: h.cargo,
        partidoSigla: h.partidoSigla,
        uf: h.uf,
        votosObtidos: h.votosObtidos,
        eleito: h.eleito,
        origem: h.origem,
        tseCandidatoId: h.tseCandidatoId,
      })),
    }

    const success = await onSave(data)
    if (success) {
      onNext()
    }
  }

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {/* TSE Search Button */}
        {!tseSearched && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Buscar historico no TSE</p>
                <p className="text-sm text-muted-foreground">
                  Se voce informou seu CPF, podemos buscar automaticamente
                </p>
              </div>
              <Button onClick={searchTse} disabled={isLoadingTse}>
                {isLoadingTse ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Buscar
              </Button>
            </div>
          </Card>
        )}

        {/* Historico List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Historico Eleitoral</Label>
            <Button variant="outline" size="sm" onClick={addHistorico}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {historico.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <p>Nenhum historico adicionado</p>
              <p className="text-sm">Clique em "Adicionar" para registrar suas candidaturas anteriores</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historico.map((h) => (
                <Card key={h.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                      <div>
                        <Label className="text-xs">Ano</Label>
                        <Select
                          value={h.ano.toString()}
                          onValueChange={(v) => v && updateHistorico(h.id, { ano: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ANOS.map((ano) => (
                              <SelectItem key={ano} value={ano.toString()}>
                                {ano}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Cargo</Label>
                        <Select
                          value={h.cargo}
                          onValueChange={(v) => v && updateHistorico(h.id, { cargo: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CARGOS.map((cargo) => (
                              <SelectItem key={cargo} value={cargo}>
                                {cargo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Votos</Label>
                        <Input
                          type="number"
                          value={h.votosObtidos || ''}
                          onChange={(e) =>
                            updateHistorico(h.id, {
                              votosObtidos: e.target.value ? parseInt(e.target.value) : undefined,
                            })
                          }
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-end">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`eleito-${h.id}`}
                            checked={h.eleito || false}
                            onCheckedChange={(checked: boolean) =>
                              updateHistorico(h.id, { eleito: !!checked })
                            }
                          />
                          <Label htmlFor={`eleito-${h.id}`} className="text-sm">
                            Eleito
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHistorico(h.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {h.origem === 'tse' && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Importado do TSE
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium">Dica</p>
          <p>Historico eleitoral ajuda a calcular metas realistas e identificar padroes de votacao.</p>
        </div>
      </div>

      <StepNavigation
        currentStep={2}
        isSaving={isSaving}
        canGoBack
        canGoForward
        onBack={onBack}
        onNext={handleNext}
        onSaveAndExit={onSaveAndExit}
      />
    </>
  )
}
