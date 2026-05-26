/**
 * OnboardingPage - Tela unica de configuracao inicial
 *
 * Coleta apenas 4 campos essenciais para criar a campanha:
 * 1. Nome de Urna
 * 2. Cargo Pretendido
 * 3. Estado (UF)
 * 4. Partido
 *
 * Apos criar a campanha, redireciona direto para o mapa exploratorio.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Vote, Building2, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Cargos disponiveis para 2026 em MG
const CARGOS = [
  { value: 'DEPUTADO_ESTADUAL', label: 'Deputado Estadual' },
  { value: 'DEPUTADO_FEDERAL', label: 'Deputado Federal' },
  { value: 'SENADOR', label: 'Senador' },
  { value: 'GOVERNADOR', label: 'Governador' },
]

// Estados brasileiros
const ESTADOS = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'AP', nome: 'Amapa' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceara' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espirito Santo' },
  { uf: 'GO', nome: 'Goias' },
  { uf: 'MA', nome: 'Maranhao' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'PA', nome: 'Para' },
  { uf: 'PB', nome: 'Paraiba' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piaui' },
  { uf: 'PR', nome: 'Parana' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RO', nome: 'Rondonia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'SP', nome: 'Sao Paulo' },
  { uf: 'TO', nome: 'Tocantins' },
]

// Principais partidos (lista simplificada)
const PARTIDOS = [
  { sigla: 'MDB', nome: 'Movimento Democratico Brasileiro' },
  { sigla: 'PT', nome: 'Partido dos Trabalhadores' },
  { sigla: 'PSDB', nome: 'Partido da Social Democracia Brasileira' },
  { sigla: 'PP', nome: 'Progressistas' },
  { sigla: 'PSD', nome: 'Partido Social Democratico' },
  { sigla: 'PL', nome: 'Partido Liberal' },
  { sigla: 'UNIAO', nome: 'Uniao Brasil' },
  { sigla: 'REPUBLICANOS', nome: 'Republicanos' },
  { sigla: 'PDT', nome: 'Partido Democratico Trabalhista' },
  { sigla: 'SOLIDARIEDADE', nome: 'Solidariedade' },
  { sigla: 'PSB', nome: 'Partido Socialista Brasileiro' },
  { sigla: 'PODE', nome: 'Podemos' },
  { sigla: 'CIDADANIA', nome: 'Cidadania' },
  { sigla: 'PSOL', nome: 'Partido Socialismo e Liberdade' },
  { sigla: 'REDE', nome: 'Rede Sustentabilidade' },
  { sigla: 'AVANTE', nome: 'Avante' },
  { sigla: 'NOVO', nome: 'Partido Novo' },
  { sigla: 'PCdoB', nome: 'Partido Comunista do Brasil' },
  { sigla: 'PV', nome: 'Partido Verde' },
  { sigla: 'AGIR', nome: 'Agir' },
  { sigla: 'DC', nome: 'Democracia Crista' },
  { sigla: 'PMB', nome: 'Partido da Mulher Brasileira' },
  { sigla: 'PRTB', nome: 'Partido Renovador Trabalhista Brasileiro' },
  { sigla: 'PRD', nome: 'Partido Renovacao Democratica' },
].sort((a, b) => a.sigla.localeCompare(b.sigla))

export function OnboardingPage() {
  const navigate = useNavigate()
  const { createCampaign, user, campaigns, isLoadingCampaigns } = useAuth()

  // Campos do formulario
  const [nomeUrna, setNomeUrna] = useState('')
  const [cargo, setCargo] = useState('DEPUTADO_ESTADUAL') // Default MVP
  const [estado, setEstado] = useState('MG') // Default MVP
  const [partido, setPartido] = useState('')

  // Estado do formulario
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-redirect se ja tem campanhas
  useEffect(() => {
    if (!isLoadingCampaigns && campaigns.length > 0) {
      navigate('/mapa', { replace: true })
    }
  }, [campaigns, isLoadingCampaigns, navigate])

  // Loading enquanto verifica campanhas
  if (isLoadingCampaigns) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Verificando suas campanhas...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validacao
    if (!nomeUrna.trim()) {
      setError('Nome de urna e obrigatorio')
      return
    }

    if (!cargo) {
      setError('Selecione o cargo pretendido')
      return
    }

    if (!estado) {
      setError('Selecione o estado')
      return
    }

    if (!partido) {
      setError('Selecione o partido')
      return
    }

    setIsSubmitting(true)

    try {
      await createCampaign({
        name: `Campanha ${nomeUrna.trim()} 2026`,
        candidateName: nomeUrna.trim(),
        position: cargo,
        state: estado,
        party: partido,
        year: 2026,
      })

      // Redireciona direto para o mapa exploratorio
      navigate('/mapa', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar campanha')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEstadoChange = (value: string | null) => {
    if (value) setEstado(value)
  }

  const handleCargoChange = (value: string | null) => {
    if (value) setCargo(value)
  }

  const handlePartidoChange = (value: string | null) => {
    if (value) setPartido(value)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Vote className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configure sua campanha</CardTitle>
          <CardDescription>
            Preencha os dados basicos para comecar a usar o ElegeHub
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome de Urna */}
            <div className="space-y-2">
              <Label htmlFor="nomeUrna" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Nome de Urna
              </Label>
              <Input
                id="nomeUrna"
                type="text"
                placeholder="Ex: JOAO DA SILVA"
                value={nomeUrna}
                onChange={(e) => setNomeUrna(e.target.value.toUpperCase())}
                disabled={isSubmitting}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Nome como aparece na urna eletronica
              </p>
            </div>

            {/* Cargo e Estado lado a lado */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cargo */}
              <div className="space-y-2">
                <Label htmlFor="cargo" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Cargo
                </Label>
                <Select value={cargo} onValueChange={handleCargoChange} disabled={isSubmitting}>
                  <SelectTrigger id="cargo">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGOS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="estado" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Estado
                </Label>
                <Select value={estado} onValueChange={handleEstadoChange} disabled={isSubmitting}>
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((e) => (
                      <SelectItem key={e.uf} value={e.uf}>
                        {e.uf} - {e.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Partido */}
            <div className="space-y-2">
              <Label htmlFor="partido" className="flex items-center gap-2">
                <Vote className="h-4 w-4 text-muted-foreground" />
                Partido
              </Label>
              <Select value={partido} onValueChange={handlePartidoChange} disabled={isSubmitting}>
                <SelectTrigger id="partido">
                  <SelectValue placeholder="Selecione seu partido" />
                </SelectTrigger>
                <SelectContent>
                  {PARTIDOS.map((p) => (
                    <SelectItem key={p.sigla} value={p.sigla}>
                      {p.sigla} - {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Erro */}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* O que voce tera acesso */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="font-medium text-foreground">O que voce tera acesso:</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Mapa exploratorio com indicadores municipais
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Briefings detalhados por municipio
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Sugestoes da IA para interpretacao dos dados
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  Dados eleitorais e socioeconomicos de 853 municipios
                </li>
              </ul>
            </div>

            {/* Botao Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Criando campanha...
                </>
              ) : (
                'Comecar a usar o ElegeHub'
              )}
            </Button>
          </form>

          {/* Usuario logado */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Logado como {user?.email}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
