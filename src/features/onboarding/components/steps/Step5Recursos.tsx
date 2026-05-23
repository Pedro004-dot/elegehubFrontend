import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, Trash2, DollarSign, Tv, Radio, Users } from 'lucide-react'
import { StepNavigation } from '../StepNavigation'
import type { Step5Data, OnboardingStatus } from '../../types'

interface Step5RecursosProps {
  initialData?: OnboardingStatus
  isSaving: boolean
  onSave: (data: Step5Data) => Promise<boolean>
  onNext: () => void
  onBack: () => void
  onSaveAndExit?: () => void
}

interface MembroEquipe {
  id: string
  nome: string
  funcao: string
}

const FAIXAS_ORCAMENTO = [
  { value: 'ate_100k', label: 'Ate R$ 100 mil' },
  { value: '100k_500k', label: 'R$ 100 mil - R$ 500 mil' },
  { value: '500k_2m', label: 'R$ 500 mil - R$ 2 milhoes' },
  { value: '2m_5m', label: 'R$ 2 milhoes - R$ 5 milhoes' },
  { value: '5m_plus', label: 'Acima de R$ 5 milhoes' },
]

export function Step5Recursos({
  initialData,
  isSaving,
  onSave,
  onNext,
  onBack,
  onSaveAndExit,
}: Step5RecursosProps) {
  const [orcamentoFaixa, setOrcamentoFaixa] = useState<string>('')
  const [fundoPartidarioFaixa, setFundoPartidarioFaixa] = useState<string>('')
  const [temTv, setTemTv] = useState(false)
  const [temRadio, setTemRadio] = useState(false)
  const [equipe, setEquipe] = useState<MembroEquipe[]>([])
  const [error] = useState<string | null>(null)

  // Load existing data
  useEffect(() => {
    if (initialData?.recursos) {
      const r = initialData.recursos
      setOrcamentoFaixa(r.orcamentoFaixa || '')
      setFundoPartidarioFaixa(r.fundoPartidarioFaixa || '')
      setTemTv(r.temTv)
      setTemRadio(r.temRadio)
      if (r.equipeAtual && r.equipeAtual.length > 0) {
        setEquipe(
          r.equipeAtual.map((m, i) => ({
            id: `eq-${i}`,
            nome: m.nome,
            funcao: m.funcao,
          }))
        )
      }
    }
  }, [initialData])

  const addMembro = () => {
    setEquipe([
      ...equipe,
      {
        id: `new-${Date.now()}`,
        nome: '',
        funcao: '',
      },
    ])
  }

  const updateMembro = (id: string, updates: Partial<MembroEquipe>) => {
    setEquipe(equipe.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }

  const removeMembro = (id: string) => {
    setEquipe(equipe.filter((m) => m.id !== id))
  }

  const handleNext = async () => {
    const data: Step5Data = {
      orcamentoFaixa: orcamentoFaixa as Step5Data['orcamentoFaixa'],
      fundoPartidarioFaixa: fundoPartidarioFaixa as Step5Data['fundoPartidarioFaixa'],
      temTv,
      temRadio,
      equipeAtual: equipe
        .filter((m) => m.nome.trim() && m.funcao.trim())
        .map((m) => ({ nome: m.nome, funcao: m.funcao })),
    }

    const success = await onSave(data)
    if (success) {
      onNext()
    }
  }

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Orcamento */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Orcamento de Campanha</h3>
              <p className="text-sm text-muted-foreground">
                Estimativa de recursos disponiveis
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Orcamento Total Previsto</Label>
              <RadioGroup value={orcamentoFaixa} onValueChange={setOrcamentoFaixa}>
                {FAIXAS_ORCAMENTO.map((faixa) => (
                  <div key={faixa.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={faixa.value} id={`orc-${faixa.value}`} />
                    <Label htmlFor={`orc-${faixa.value}`} className="font-normal">
                      {faixa.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Fundo Partidario/Eleitoral Esperado</Label>
              <RadioGroup value={fundoPartidarioFaixa} onValueChange={setFundoPartidarioFaixa}>
                {FAIXAS_ORCAMENTO.map((faixa) => (
                  <div key={faixa.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={faixa.value} id={`fundo-${faixa.value}`} />
                    <Label htmlFor={`fundo-${faixa.value}`} className="font-normal">
                      {faixa.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Midia */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Tv className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Tempo de TV e Radio</h3>
              <p className="text-sm text-muted-foreground">
                Acesso a horario eleitoral gratuito
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="temTv"
                checked={temTv}
                onCheckedChange={(checked: boolean) => setTemTv(!!checked)}
              />
              <Label htmlFor="temTv" className="flex items-center gap-1">
                <Tv className="h-4 w-4" />
                Tempo de TV
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="temRadio"
                checked={temRadio}
                onCheckedChange={(checked: boolean) => setTemRadio(!!checked)}
              />
              <Label htmlFor="temRadio" className="flex items-center gap-1">
                <Radio className="h-4 w-4" />
                Tempo de Radio
              </Label>
            </div>
          </div>
        </div>

        {/* Equipe */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Equipe de Campanha</h3>
                <p className="text-sm text-muted-foreground">
                  Principais membros da equipe
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={addMembro}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {equipe.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Adicione membros da equipe de campanha
            </div>
          ) : (
            <div className="space-y-2">
              {equipe.map((membro) => (
                <Card key={membro.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Nome"
                        value={membro.nome}
                        onChange={(e) => updateMembro(membro.id, { nome: e.target.value })}
                      />
                      <Input
                        placeholder="Funcao (ex: Coord. de Marketing)"
                        value={membro.funcao}
                        onChange={(e) => updateMembro(membro.id, { funcao: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMembro(membro.id)}
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

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium">Informacao confidencial</p>
          <p>Esses dados sao usados apenas para calcular recomendacoes estrategicas e nao serao compartilhados.</p>
        </div>
      </div>

      <StepNavigation
        currentStep={5}
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
