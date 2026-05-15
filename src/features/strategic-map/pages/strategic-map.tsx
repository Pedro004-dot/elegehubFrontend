import { useState, useMemo, useCallback } from 'react'
import { MapHeader } from '../components/map-header'
import { KpiCards } from '../components/kpi-cards'
import { BrazilMap } from '../components/brazil-map'
import { MunicipalityPanel } from '../components/municipality-panel'
import { MapLegend } from '../components/map-legend'
import { useMunicipalities } from '../hooks/use-municipalities'
import { calculateKpis } from '../data/mock-municipalities'
import type { Municipality, MunicipalityClassification } from '../types'
import type { CandidatoResumo } from '../services/analytics'

export function StrategicMapPage() {
  const [selectedState, setSelectedState] = useState('MG')
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null)
  const [activeFilters, setActiveFilters] = useState<MunicipalityClassification[]>([])
  const [selectedCargo, setSelectedCargo] = useState('deputado estadual')
  const [selectedCandidato, setSelectedCandidato] = useState<CandidatoResumo | null>(null)

  // Buscar municipios com dados reais (apenas MG por enquanto)
  const { municipalities: realMunicipalities, loading, error } = useMunicipalities({
    cargo: selectedCargo,
    candidato: selectedCandidato,
  })

  // Handler para hover (pode ser usado para tooltip global no futuro)
  const handleHoverMunicipality = useCallback((_municipality: Municipality | null) => {
    // Implementar tooltip global se necessário
  }, [])

  // Filtrar municípios pelo estado (usa dados reais para MG, mock para outros)
  const stateMunicipalities = useMemo(() => {
    if (selectedState === 'MG' && realMunicipalities.length > 0) {
      return realMunicipalities
    }
    // Fallback para outros estados ou enquanto carrega
    return []
  }, [selectedState, realMunicipalities])

  // Calcular KPIs
  const kpis = useMemo(() => {
    return calculateKpis(stateMunicipalities)
  }, [stateMunicipalities])

  // Total de votos potenciais (excluindo evitar)
  const totalPotential = useMemo(() => {
    return kpis.consolidar.potentialVotes +
           kpis.conquistar.potentialVotes +
           kpis.disputar.potentialVotes
  }, [kpis])

  // Toggle filtro de classificação
  const handleFilterToggle = (classification: MunicipalityClassification) => {
    setActiveFilters(prev => {
      if (prev.includes(classification)) {
        return prev.filter(c => c !== classification)
      }
      return [...prev, classification]
    })
  }

  // Abrir filtros expandidos (TODO: implementar modal/sheet)
  const handleOpenFilters = () => {
    console.log('Abrir filtros expandidos')
  }

  // Adicionar ao plano de ação
  const handleAddToActionPlan = (municipality: Municipality) => {
    console.log('Adicionar ao plano de ação:', municipality.name)
    // TODO: implementar lógica de adicionar ao plano
  }

  // Format last update date
  const lastUpdate = useMemo(() => {
    if (loading) return 'Carregando...'
    if (error) return 'Erro ao carregar'
    return 'Dados TSE 2022'
  }, [loading, error])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <MapHeader
        selectedState={selectedState}
        onStateChange={setSelectedState}
        municipalityCount={loading ? 0 : stateMunicipalities.length}
        lastUpdate={lastUpdate}
        activeFilters={activeFilters}
        onFilterToggle={handleFilterToggle}
        onOpenFilters={handleOpenFilters}
        selectedCargo={selectedCargo}
        onCargoChange={setSelectedCargo}
        selectedCandidato={selectedCandidato}
        onSelectCandidato={setSelectedCandidato}
      />

      {/* KPIs */}
      <KpiCards
        data={kpis}
        totalPotential={totalPotential}
        historicalTarget={47300}
      />

      {/* Área principal: Mapa + Painel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mapa */}
        <div className={`relative flex-1 transition-all duration-200 ${selectedMunicipality ? 'mr-0' : ''}`}>
          <BrazilMap
            selectedState={selectedState}
            activeFilters={activeFilters}
            onMunicipalityClick={setSelectedMunicipality}
            onHoverMunicipality={handleHoverMunicipality}
            selectedCandidato={selectedCandidato}
            cargo={selectedCargo}
          />
          <MapLegend />
        </div>

        {/* Painel lateral */}
        {selectedMunicipality && (
          <MunicipalityPanel
            municipality={selectedMunicipality}
            onClose={() => setSelectedMunicipality(null)}
            onAddToActionPlan={handleAddToActionPlan}
          />
        )}
      </div>
    </div>
  )
}
