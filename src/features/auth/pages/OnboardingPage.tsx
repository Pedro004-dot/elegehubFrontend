import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

export function OnboardingPage() {
  const [candidateName, setCandidateName] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [position, setPosition] = useState('')
  const [state, setState] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createCampaign, user, campaigns, isLoadingCampaigns } = useAuth()
  const navigate = useNavigate()

  // Auto-redirect se o usuário já tem campanhas
  useEffect(() => {
    if (!isLoadingCampaigns && campaigns.length > 0) {
      console.log('Usuário já tem campanhas, redirecionando para o mapa estratégico')
      navigate('/mapa/plano-acao', { replace: true })
    }
  }, [campaigns, isLoadingCampaigns, navigate])

  // Mostra loading enquanto verifica campanhas existentes
  if (isLoadingCampaigns) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground text-center">
              Verificando suas campanhas...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!candidateName.trim()) {
      setError('Nome do candidato e obrigatorio')
      return
    }

    if (!position) {
      setError('Selecione o cargo pretendido')
      return
    }

    if (!state) {
      setError('Selecione o estado')
      return
    }

    setIsSubmitting(true)

    try {
      await createCampaign({
        name: campaignName.trim() || `Campanha ${candidateName.trim()} 2026`,
        candidateName: candidateName.trim(),
        position,
        state,
        year: 2026,
      })
      // Redireciona para o wizard de 7 etapas para completar o perfil
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar campanha')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">🎯</div>
          <h1 className="text-2xl font-bold text-foreground">Vamos comecar!</h1>
          <p className="mt-2 text-muted-foreground">
            Configure sua primeira campanha para comecar a usar o ElegeHub
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Nome do Candidato *</Label>
            <Input
              id="candidateName"
              type="text"
              placeholder="Ex: Joao Silva"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Nome completo como aparece na urna
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaignName">Nome da Campanha (opcional)</Label>
            <Input
              id="campaignName"
              type="text"
              placeholder="Ex: Campanha Joao 2026"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Se nao preencher, usaremos o nome do candidato
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Cargo Pretendido *</Label>
              <Select value={position} onValueChange={(value) => value && setPosition(value)} disabled={isSubmitting}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Selecione" />
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
              <Label htmlFor="state">Estado (UF) *</Label>
              <Select value={state} onValueChange={(value) => value && setState(value)} disabled={isSubmitting}>
                <SelectTrigger id="state">
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

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="font-medium text-foreground">O que voce vai ter acesso:</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Mapa estrategico com dados eleitorais do TSE</li>
              <li>• Analise de mais de 800 municipios</li>
              <li>• Classificacao de territorios (consolidar, conquistar, disputar)</li>
              <li>• Dados de votos e gastos de campanhas anteriores</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Criando campanha...' : 'Criar Campanha'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Logado como {user?.email}
        </p>
      </Card>
    </div>
  )
}
