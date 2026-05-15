import { useState } from 'react'
import { Filter, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BRAZIL_STATES } from '../data/states'
import type { MunicipalityClassification } from '../types'
import { CLASSIFICATION_CONFIG } from '../types'
import { CandidateSelector } from './candidate-selector'
import type { CandidatoResumo } from '../services/analytics'
import { getCandidatoFotoUrl } from '../services/analytics'

interface MapHeaderProps {
  selectedState: string
  onStateChange: (state: string) => void
  municipalityCount: number
  lastUpdate: string
  activeFilters: MunicipalityClassification[]
  onFilterToggle: (classification: MunicipalityClassification) => void
  onOpenFilters: () => void
  selectedCargo: string
  onCargoChange: (cargo: string) => void
  selectedCandidato: CandidatoResumo | null
  onSelectCandidato: (candidato: CandidatoResumo | null) => void
}

export function MapHeader({
  selectedState,
  onStateChange,
  municipalityCount,
  lastUpdate,
  activeFilters,
  onFilterToggle,
  onOpenFilters,
  selectedCargo,
  onCargoChange,
  selectedCandidato,
  onSelectCandidato,
}: MapHeaderProps) {
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const stateName = BRAZIL_STATES.find(s => s.uf === selectedState)?.name || selectedState

  const handleStateChange = (value: string | null) => {
    if (value) {
      onStateChange(value)
    }
  }

  const cargoLabel = selectedCargo
    ? selectedCargo.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Selecione o cargo'

  return (
    <>
      <div className="flex flex-col gap-4 px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Candidato selecionado */}
            <button
              onClick={() => setSelectorOpen(true)}
              className="flex items-center gap-3 p-2 pr-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {selectedCandidato && !imageError ? (
                  <img
                    src={getCandidatoFotoUrl(selectedCandidato.sq_candidato)}
                    alt={selectedCandidato.nome_urna}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="text-left">
                {selectedCandidato ? (
                  <>
                    <p className="font-medium text-sm">{selectedCandidato.nome_urna}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCandidato.partido_sigla} · {cargoLabel}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-sm">Selecionar Candidato</p>
                    <p className="text-xs text-muted-foreground">
                      Clique para escolher
                    </p>
                  </>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
            </button>

            <div className="h-10 w-px bg-border" />

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Mapa Estratégico de {stateName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {municipalityCount} municípios analisados · Última atualização: {lastUpdate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {BRAZIL_STATES.map(state => (
                  <SelectItem key={state.uf} value={state.uf}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={onOpenFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(Object.keys(CLASSIFICATION_CONFIG) as MunicipalityClassification[]).map((classification) => {
            const config = CLASSIFICATION_CONFIG[classification]
            const isActive = activeFilters.includes(classification)

            return (
              <Badge
                key={classification}
                variant={isActive ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                style={{
                  backgroundColor: isActive ? config.color : 'transparent',
                  borderColor: config.color,
                  color: isActive ? 'white' : config.color
                }}
                onClick={() => onFilterToggle(classification)}
              >
                {config.label}
              </Badge>
            )
          })}

          {selectedCandidato && (
            <span className="text-xs text-muted-foreground ml-4">
              Cores baseadas na compatibilidade com {selectedCandidato.nome_urna}
            </span>
          )}
        </div>
      </div>

      <CandidateSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        selectedCandidato={selectedCandidato}
        onSelectCandidato={onSelectCandidato}
        cargo={selectedCargo}
        onCargoChange={onCargoChange}
      />
    </>
  )
}
