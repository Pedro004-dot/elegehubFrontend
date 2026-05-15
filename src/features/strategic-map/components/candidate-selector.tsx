import { useState, useMemo, useEffect } from 'react'
import { Search, Users, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CandidateCard } from './candidate-card'
import type { CandidatoResumo } from '../services/analytics'
import { fetchCandidatos } from '../services/analytics'

interface CandidateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCandidato: CandidatoResumo | null
  onSelectCandidato: (candidato: CandidatoResumo | null) => void
  cargo: string
  onCargoChange: (cargo: string) => void
}

const CARGOS = [
  { value: 'deputado estadual', label: 'Deputado Estadual' },
  { value: 'deputado federal', label: 'Deputado Federal' },
  { value: 'senador', label: 'Senador' },
  { value: 'governador', label: 'Governador' },
]

export function CandidateSelector({
  open,
  onOpenChange,
  selectedCandidato,
  onSelectCandidato,
  cargo,
  onCargoChange,
}: CandidateSelectorProps) {
  const [candidatos, setCandidatos] = useState<CandidatoResumo[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch candidatos quando o cargo muda
  useEffect(() => {
    if (!cargo) return

    setLoading(true)
    fetchCandidatos({ cargo, limit: 100 })
      .then((data) => {
        setCandidatos(data)
      })
      .catch((error) => {
        console.error('Erro ao buscar candidatos:', error)
        setCandidatos([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [cargo])

  // Filtrar candidatos pelo termo de busca
  const filteredCandidatos = useMemo(() => {
    if (!searchTerm.trim()) return candidatos

    const term = searchTerm.toLowerCase()
    return candidatos.filter(
      (c) =>
        c.nome_urna.toLowerCase().includes(term) ||
        c.nome.toLowerCase().includes(term) ||
        c.partido_sigla?.toLowerCase().includes(term)
    )
  }, [candidatos, searchTerm])

  const handleSelect = (candidato: CandidatoResumo) => {
    // Se clicar no mesmo, deseleciona
    if (selectedCandidato?.id === candidato.id) {
      onSelectCandidato(null)
    } else {
      onSelectCandidato(candidato)
    }
    onOpenChange(false)
  }

  const handleClearSelection = () => {
    onSelectCandidato(null)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Selecionar Candidato</SheetTitle>
          <SheetDescription>
            Escolha um candidato para analisar a compatibilidade politica nos municipios
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          {/* Filtro de Cargo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Cargo</label>
            <Select value={cargo} onValueChange={(value) => value && onCargoChange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cargo" />
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

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou partido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Candidato selecionado */}
          {selectedCandidato && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary">Selecionado</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={handleClearSelection}
                >
                  Limpar
                </Button>
              </div>
              <CandidateCard
                candidato={selectedCandidato}
                isSelected
                compact
              />
            </div>
          )}

          {/* Lista de candidatos */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : filteredCandidatos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {cargo
                    ? 'Nenhum candidato encontrado'
                    : 'Selecione um cargo para ver os candidatos'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2">
                {filteredCandidatos.map((candidato) => (
                  <CandidateCard
                    key={candidato.id}
                    candidato={candidato}
                    isSelected={selectedCandidato?.id === candidato.id}
                    onSelect={handleSelect}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          {/* Contador */}
          {!loading && filteredCandidatos.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {filteredCandidatos.length} candidato(s) encontrado(s)
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
