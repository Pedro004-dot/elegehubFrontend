import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, MapPin, Users, Building2 } from 'lucide-react'
import { StepNavigation } from '../StepNavigation'
import type { Step4Data, OnboardingStatus } from '../../types'

interface Step4RedeProps {
  initialData?: OnboardingStatus
  isSaving: boolean
  onSave: (data: Step4Data) => Promise<boolean>
  onNext: () => void
  onBack: () => void
  onSaveAndExit?: () => void
}

interface BaseTerritorial {
  id: string
  municipioId?: number
  municipioNome: string
  tipo: 'base_solida' | 'presenca'
  forca?: number
}

interface Lideranca {
  id: string
  nome: string
  cargo?: string
  municipioNome?: string
  observacoes?: string
}

const BASES_ORGANIZADAS_TIPOS = [
  { value: 'igreja_evangelica', label: 'Igreja Evangelica' },
  { value: 'igreja_catolica', label: 'Igreja Catolica' },
  { value: 'sindicato', label: 'Sindicato' },
  { value: 'associacao_empresarial', label: 'Associacao Empresarial' },
  { value: 'movimento_social', label: 'Movimento Social' },
  { value: 'universidade', label: 'Universidade' },
  { value: 'outro', label: 'Outro' },
]

export function Step4Rede({
  initialData,
  isSaving,
  onSave,
  onNext,
  onBack,
  onSaveAndExit,
}: Step4RedeProps) {
  const [bases, setBases] = useState<BaseTerritorial[]>([])
  const [liderancas, setLiderancas] = useState<Lideranca[]>([])
  const [basesOrganizadas, setBasesOrganizadas] = useState<string[]>([])
  const [error] = useState<string | null>(null)

  // Load existing data
  useEffect(() => {
    if (initialData?.basesTerritorial) {
      setBases(
        initialData.basesTerritorial.map((b, i) => ({
          id: `base-${i}`,
          municipioId: b.municipioId,
          municipioNome: '', // Would need to fetch name
          tipo: b.tipo,
          forca: b.forca,
        }))
      )
    }
    if (initialData?.liderancas) {
      setLiderancas(
        initialData.liderancas.map((l, i) => ({
          id: `lid-${i}`,
          nome: l.nome,
          cargo: l.cargo,
          observacoes: l.observacoes,
        }))
      )
    }
    if (initialData?.basesOrganizadas) {
      setBasesOrganizadas(initialData.basesOrganizadas.map((b) => b.tipo))
    }
  }, [initialData])

  const addBase = () => {
    setBases([
      ...bases,
      {
        id: `new-base-${Date.now()}`,
        municipioNome: '',
        tipo: 'presenca',
      },
    ])
  }

  const updateBase = (id: string, updates: Partial<BaseTerritorial>) => {
    setBases(bases.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const removeBase = (id: string) => {
    setBases(bases.filter((b) => b.id !== id))
  }

  const addLideranca = () => {
    setLiderancas([
      ...liderancas,
      {
        id: `new-lid-${Date.now()}`,
        nome: '',
      },
    ])
  }

  const updateLideranca = (id: string, updates: Partial<Lideranca>) => {
    setLiderancas(liderancas.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  }

  const removeLideranca = (id: string) => {
    setLiderancas(liderancas.filter((l) => l.id !== id))
  }

  const toggleBaseOrganizada = (tipo: string) => {
    if (basesOrganizadas.includes(tipo)) {
      setBasesOrganizadas(basesOrganizadas.filter((b) => b !== tipo))
    } else {
      setBasesOrganizadas([...basesOrganizadas, tipo])
    }
  }

  const handleNext = async () => {
    // For now, we skip municipio_id validation since we don't have a municipality picker
    // In production, this would need proper integration with the municipalities API

    const data: Step4Data = {
      basesTerritorial: bases
        .filter((b) => b.municipioNome.trim())
        .map((b) => ({
          municipioId: b.municipioId || 0, // Placeholder - needs real ID
          tipo: b.tipo,
          forca: b.forca,
        })),
      liderancas: liderancas
        .filter((l) => l.nome.trim())
        .map((l) => ({
          nome: l.nome,
          cargo: l.cargo,
          observacoes: l.observacoes,
        })),
      basesOrganizadas: basesOrganizadas.map((tipo) => ({
        tipo: tipo as Step4Data['basesOrganizadas'][0]['tipo'],
      })),
    }

    const success = await onSave(data)
    if (success) {
      onNext()
    }
  }

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Bases Territoriais */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Bases Territoriais</h3>
                <p className="text-sm text-muted-foreground">
                  Municipios onde voce tem presenca forte
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={addBase}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {bases.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Adicione municipios onde voce tem base eleitoral
            </div>
          ) : (
            <div className="space-y-2">
              {bases.map((base) => (
                <Card key={base.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Nome do municipio"
                        value={base.municipioNome}
                        onChange={(e) => updateBase(base.id, { municipioNome: e.target.value })}
                      />
                    </div>
                    <Select
                      value={base.tipo}
                      onValueChange={(v) => updateBase(base.id, { tipo: v as BaseTerritorial['tipo'] })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base_solida">Base solida</SelectItem>
                        <SelectItem value="presenca">Presenca</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBase(base.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Liderancas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Liderancas e Apoios</h3>
                <p className="text-sm text-muted-foreground">
                  Pessoas-chave que apoiam sua campanha
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={addLideranca}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {liderancas.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Adicione liderancas e apoiadores importantes
            </div>
          ) : (
            <div className="space-y-2">
              {liderancas.map((lid) => (
                <Card key={lid.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Nome"
                        value={lid.nome}
                        onChange={(e) => updateLideranca(lid.id, { nome: e.target.value })}
                      />
                      <Input
                        placeholder="Cargo/Funcao (opcional)"
                        value={lid.cargo || ''}
                        onChange={(e) => updateLideranca(lid.id, { cargo: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLideranca(lid.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bases Organizadas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Bases Organizadas</h3>
              <p className="text-sm text-muted-foreground">
                Grupos e instituicoes com os quais voce tem relacao
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {BASES_ORGANIZADAS_TIPOS.map((tipo) => (
              <div
                key={tipo.value}
                className="flex items-center gap-2 rounded-lg border p-3"
              >
                <Checkbox
                  id={tipo.value}
                  checked={basesOrganizadas.includes(tipo.value)}
                  onCheckedChange={() => toggleBaseOrganizada(tipo.value)}
                />
                <Label htmlFor={tipo.value} className="flex-1 cursor-pointer text-sm">
                  {tipo.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <StepNavigation
        currentStep={4}
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
