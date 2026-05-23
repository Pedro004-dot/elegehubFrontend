import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StepNavigation } from '../StepNavigation'
import type { Step1Data, OnboardingStatus } from '../../types'

const POSITIONS = [
  { value: 'DEPUTADO ESTADUAL', label: 'Deputado Estadual' },
  { value: 'DEPUTADO FEDERAL', label: 'Deputado Federal' },
  { value: 'SENADOR', label: 'Senador' },
  { value: 'GOVERNADOR', label: 'Governador' },
]

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

interface Step1IdentidadeProps {
  initialData?: OnboardingStatus
  isSaving: boolean
  onSave: (data: Step1Data) => Promise<boolean>
  onNext: () => void
  onSaveAndExit?: () => void
}

export function Step1Identidade({
  initialData,
  isSaving,
  onSave,
  onNext,
  onSaveAndExit,
}: Step1IdentidadeProps) {
  const [nomeUrna, setNomeUrna] = useState('')
  const [cargo, setCargo] = useState('')
  const [uf, setUf] = useState('')
  const [cpf, setCpf] = useState('')
  const [error, setError] = useState<string | null>(null)

  // TODO: Load partidoId from campaign if exists

  useEffect(() => {
    // Pre-fill from existing data if available
    // This would come from the campaign data loaded in the status
  }, [initialData])

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpf(e.target.value))
  }

  const validate = (): boolean => {
    if (!nomeUrna.trim()) {
      setError('Nome de urna e obrigatorio')
      return false
    }
    if (!cargo) {
      setError('Selecione o cargo pretendido')
      return false
    }
    if (!uf) {
      setError('Selecione o estado')
      return false
    }
    setError(null)
    return true
  }

  const handleNext = async () => {
    if (!validate()) return

    const success = await onSave({
      nomeUrna: nomeUrna.trim(),
      cargo,
      uf,
      cpf: cpf.replace(/\D/g, '') || undefined,
    })

    if (success) {
      onNext()
    }
  }

  const isValid = nomeUrna.trim() && cargo && uf

  return (
    <>
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="nomeUrna">Nome de Urna *</Label>
          <Input
            id="nomeUrna"
            type="text"
            placeholder="Ex: JOAO DA SILVA"
            value={nomeUrna}
            onChange={(e) => setNomeUrna(e.target.value.toUpperCase())}
            disabled={isSaving}
            className="uppercase"
          />
          <p className="text-xs text-muted-foreground">
            Nome como aparecera na urna eletronica
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo Pretendido *</Label>
            <Select value={cargo} onValueChange={(value) => value && setCargo(value)} disabled={isSaving}>
              <SelectTrigger id="cargo">
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf">Estado (UF) *</Label>
            <Select value={uf} onValueChange={(value) => value && setUf(value)} disabled={isSaving}>
              <SelectTrigger id="uf">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF (opcional)</Label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCpfChange}
            maxLength={14}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Se informado, buscaremos automaticamente seu historico eleitoral no TSE
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <StepNavigation
        currentStep={1}
        isSaving={isSaving}
        canGoBack={false}
        canGoForward={!!isValid}
        onBack={() => {}}
        onNext={handleNext}
        onSaveAndExit={onSaveAndExit}
      />
    </>
  )
}
