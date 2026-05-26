/**
 * ExploratoryMapPage - Mapa exploratorio com filtros por indicador ou classificacao
 *
 * Nova versao do mapa que:
 * - Permite coloracao dinamica por indicador OU por classificacao estrategica
 * - Navega para briefing do municipio no click
 * - Suporta dois modos: indicadores (gradiente) e classificacao (categorias)
 * - Filtros simples por estado e indicador
 * - Seletor de partido para modo classificacao (independente da campanha)
 */

import { useState, useEffect, useMemo } from 'react'
import { MapPin, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useCurrentCampaignSafe } from '@/features/auth/hooks/useCurrentCampaign'
import { BRAZIL_STATES } from '../data/states'
import { BrazilMap } from '../components/brazil-map'
import { IndicatorFilter } from '../components/indicator-filter'
import { IndicatorLegend } from '../components/indicator-legend'
import { ClassificationLegend } from '../components/classification-legend'
import { MapModeToggle, type MapMode } from '../components/map-mode-toggle'
import { useMunicipalitiesWithIndicators } from '../hooks/use-municipalities-with-indicators'
import { useClassifications } from '../hooks/use-classifications'
import type { IndicatorId } from '../types'

/**
 * Mapeamento sigla de partido -> partidoId no banco
 * NOTA: Este mapeamento deve ser sincronizado com dim_partidos
 * Atualizado em 2026-05-25
 */
const PARTY_SIGLA_TO_ID: Record<string, number> = {
  MDB: 1,
  PT: 2,
  PSDB: 3,
  PP: 4,
  PDT: 5,
  UNIÃO: 6,
  PSB: 7,
  PL: 8,
  PSD: 9,
  REPUBLICANOS: 10,
  PSOL: 11,
  PCdoB: 12,
  PCDOB: 12, // alias
  PODE: 13,
  NOVO: 14,
  CIDADANIA: 15,
  AVANTE: 16,
  SOLIDARIEDADE: 17,
  PV: 18,
  REDE: 19,
  DC: 20,
  AGIR: 21,
  PMB: 22,
  PRTB: 23,
  PRD: 24,
  UP: 25,
  PCB: 26,
  PSTU: 27,
  PCO: 28,
  PTB: 31,
  PMN: 32,
  PATRIOTA: 33,
  PROS: 34,
}

/**
 * Lista de partidos principais para o seletor
 * Ordenados por relevancia (maiores bancadas primeiro)
 */
const PARTIDOS_PRINCIPAIS = [
  { sigla: 'PL', id: 8 },
  { sigla: 'PT', id: 2 },
  { sigla: 'UNIÃO', id: 6 },
  { sigla: 'PP', id: 4 },
  { sigla: 'PSD', id: 9 },
  { sigla: 'MDB', id: 1 },
  { sigla: 'REPUBLICANOS', id: 10 },
  { sigla: 'PDT', id: 5 },
  { sigla: 'PSB', id: 7 },
  { sigla: 'PSDB', id: 3 },
  { sigla: 'PODE', id: 13 },
  { sigla: 'PSOL', id: 11 },
  { sigla: 'AVANTE', id: 16 },
  { sigla: 'CIDADANIA', id: 15 },
  { sigla: 'PCdoB', id: 12 },
  { sigla: 'SOLIDARIEDADE', id: 17 },
  { sigla: 'NOVO', id: 14 },
  { sigla: 'PV', id: 18 },
  { sigla: 'REDE', id: 19 },
]

export function ExploratoryMapPage() {
  const campaign = useCurrentCampaignSafe()

  // Estado selecionado (default: estado da campanha ou MG)
  const [selectedState, setSelectedState] = useState(campaign?.state || 'MG')

  // Modo de visualizacao do mapa
  const [mapMode, setMapMode] = useState<MapMode>('indicadores')

  // Indicador selecionado para coloracao
  const [activeIndicator, setActiveIndicator] = useState<IndicatorId>('percentual_voto_partido')

  // Partido selecionado para classificacao (independente da campanha)
  const [selectedPartidoId, setSelectedPartidoId] = useState<number | null>(null)

  // Atualizar estado quando campanha mudar
  useEffect(() => {
    if (campaign?.state) {
      setSelectedState(campaign.state)
    }
  }, [campaign?.state])

  // Resolver partidoId a partir da sigla da campanha
  const partidoIdFromCampaign = useMemo(() => {
    if (!campaign?.party) return null
    const siglaUpper = campaign.party.toUpperCase()
    return PARTY_SIGLA_TO_ID[siglaUpper] ?? null
  }, [campaign?.party])

  // Inicializar partido selecionado com o da campanha
  useEffect(() => {
    if (partidoIdFromCampaign && !selectedPartidoId) {
      setSelectedPartidoId(partidoIdFromCampaign)
    }
  }, [partidoIdFromCampaign, selectedPartidoId])

  // Partido efetivo para classificacao (selecionado manualmente ou da campanha)
  const partidoId = selectedPartidoId ?? partidoIdFromCampaign

  // Buscar municipios com indicadores
  const { municipalities, loading, error } = useMunicipalitiesWithIndicators({
    uf: selectedState,
  })

  // Buscar classificacoes (so quando em modo classificacao e tem partidoId)
  const {
    classificacaoByIbge,
    stats: classificationStats,
    loading: classificationLoading,
    error: classificationError,
    startBatchCalculation,
    calculating,
  } = useClassifications({
    partidoId: partidoId ?? 0, // Hook trata 0 como invalido
  })

  // Calcular range de dados para a legenda
  const dataRange = useMemo(() => {
    const values = municipalities
      .map((m) => m.indicators[activeIndicator])
      .filter((v): v is number => v !== null && v !== undefined)

    if (values.length === 0) return { min: 0, max: 100 }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }, [municipalities, activeIndicator])

  const stateName = BRAZIL_STATES.find((s) => s.uf === selectedState)?.name || selectedState
  const isLoading = loading || (mapMode === 'classificacao' && classificationLoading)
  const displayError = error || (mapMode === 'classificacao' ? classificationError : null)

  const handleStateChange = (value: string | null) => {
    if (value) {
      setSelectedState(value)
    }
  }

  const handleModeChange = (mode: MapMode) => {
    setMapMode(mode)
  }

  const handlePartidoChange = (value: string | null) => {
    if (!value) return
    const id = parseInt(value, 10)
    if (!isNaN(id)) {
      setSelectedPartidoId(id)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MapPin className="h-6 w-6 text-brand" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Mapa Exploratorio - {stateName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Carregando...' : `${municipalities.length} municipios`} ·{' '}
                Clique em um municipio para ver o briefing
              </p>
            </div>
          </div>

          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {BRAZIL_STATES.map((state) => (
                <SelectItem key={state.uf} value={state.uf}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Controles: Mode Toggle + Seletor de partido + Filtro de indicador */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <MapModeToggle
              value={mapMode}
              onChange={handleModeChange}
              disabled={isLoading}
              classificationCount={classificacaoByIbge.size}
            />

            {/* Seletor de partido para modo classificacao */}
            {mapMode === 'classificacao' && (
              <div className="flex items-center gap-2">
                <Label htmlFor="partido-select" className="text-sm text-muted-foreground whitespace-nowrap">
                  Partido:
                </Label>
                <Select
                  value={partidoId?.toString() ?? ''}
                  onValueChange={handlePartidoChange}
                >
                  <SelectTrigger id="partido-select" className="w-[140px] h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTIDOS_PRINCIPAIS.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.sigla}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {mapMode === 'indicadores' && (
            <IndicatorFilter
              value={activeIndicator}
              onChange={setActiveIndicator}
              disabled={isLoading}
            />
          )}
        </div>
      </div>

      {/* Area principal: Mapa */}
      <div className="flex-1 relative">
        {displayError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-destructive/10 text-destructive border border-destructive/20 rounded-md px-4 py-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{displayError}</span>
          </div>
        )}

        <BrazilMap
          selectedState={selectedState}
          activeIndicator={activeIndicator}
          municipalities={municipalities}
          loading={isLoading}
          mode={mapMode}
          classificacaoByIbge={classificacaoByIbge}
        />

        {/* Legenda dinamica baseada no modo */}
        {mapMode === 'classificacao' ? (
          <ClassificationLegend
            stats={classificationStats}
            onStartCalculation={startBatchCalculation}
            calculating={calculating}
          />
        ) : (
          <IndicatorLegend indicatorId={activeIndicator} dataRange={dataRange} />
        )}
      </div>
    </div>
  )
}

export default ExploratoryMapPage
