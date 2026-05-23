/**
 * DiagnosticMapFullscreenPage
 *
 * Fullscreen map page for territorial analysis.
 * No app layout, floating controls, and side sheet for details.
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentCampaign } from '@/features/auth/hooks/useCurrentCampaign'
import { useDiagnostic } from '../hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/elegehub'
import { TerritorialMap, MapClassificationLegend } from '../components/map'
import {
  ArrowLeft,
  List,
  Search,
  X,
  Filter,
} from 'lucide-react'
import type { TerritorialClassification } from '../types'


const CLASSIFICATION_VARIANTS: Record<
  TerritorialClassification,
  'opportunity' | 'attention' | 'risk' | 'neutral'
> = {
  fiel: 'opportunity',
  pendular: 'attention',
  disputavel: 'attention',
  hostil: 'risk',
  alta_abstencao: 'neutral',
}

const CLASSIFICATION_LABELS: Record<TerritorialClassification, string> = {
  fiel: 'Fiel',
  pendular: 'Pendular',
  disputavel: 'Disputável',
  hostil: 'Hostil',
  alta_abstencao: 'Alta Abstenção',
}

export function DiagnosticMapFullscreenPage() {
  const navigate = useNavigate()
  const campaign = useCurrentCampaign()
  const { diagnostic, loading } = useDiagnostic({ campaignId: campaign.id })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetView, setSheetView] = useState<'filters' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<TerritorialClassification[]>([])

  const territorial = diagnostic?.sections.territorial

  // Calculate classification counts
  const classificationCounts = useMemo(() => {
    if (!territorial?.municipios_classificados) return []

    const counts: Record<
      TerritorialClassification,
      { count: number; eleitores: number }
    > = {
      fiel: { count: 0, eleitores: 0 },
      pendular: { count: 0, eleitores: 0 },
      disputavel: { count: 0, eleitores: 0 },
      hostil: { count: 0, eleitores: 0 },
      alta_abstencao: { count: 0, eleitores: 0 },
    }

    territorial.municipios_classificados.forEach((m) => {
      const classification = m.classificacao || m.classification || 'pendular'
      counts[classification].count++
      counts[classification].eleitores += m.eleitores || 0
    })

    return (
      Object.entries(counts) as [
        TerritorialClassification,
        { count: number; eleitores: number },
      ][]
    ).map(([classification, data]) => ({
      classification,
      ...data,
    }))
  }, [territorial])

  // Filter municipalities
  const filteredMunicipios = useMemo(() => {
    if (!territorial?.municipios_classificados) return []

    return territorial.municipios_classificados.filter((m) => {
      const matchesSearch = m.nome.toLowerCase().includes(searchQuery.toLowerCase())
      const classification = m.classificacao || m.classification || 'pendular'
      const matchesFilter =
        activeFilters.length === 0 || activeFilters.includes(classification)
      return matchesSearch && matchesFilter
    })
  }, [territorial, searchQuery, activeFilters])

  const toggleFilter = (classification: TerritorialClassification) => {
    setActiveFilters((prev) =>
      prev.includes(classification)
        ? prev.filter((f) => f !== classification)
        : [...prev, classification]
    )
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-subtle">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body text-ink-secondary">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Map */}
      <TerritorialMap
        municipios={territorial?.municipios_classificados || []}
        uf={campaign.state}
        height="100%"
        activeFilters={activeFilters}
        showControls
        showFullscreen
        className="h-full w-full"
      />

      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm"
              onClick={() => navigate('/diagnostico')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 border">
              <h1 className="text-h3 text-ink-display">Mapa Territorial</h1>
              <p className="text-small text-ink-secondary">
                {territorial?.municipios_classificados.length || 0} municipios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm"
              onClick={() => {
                setSheetView('filters')
                setSheetOpen(true)
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {activeFilters.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-brand text-white text-caption rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm"
              onClick={() => {
                setSheetView('list')
                setSheetOpen(true)
              }}
            >
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <MapClassificationLegend
        counts={classificationCounts}
        className="absolute bottom-6 left-4 w-64"
      />

      {/* Side Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetView === 'filters' ? 'Filtros' : 'Lista de Municipios'}
            </SheetTitle>
          </SheetHeader>

          {sheetView === 'filters' ? (
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-small font-medium text-ink-display mb-3">
                  Classificacao
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      'fiel',
                      'pendular',
                      'hostil',
                      'alta_abstencao',
                    ] as TerritorialClassification[]
                  ).map((classification) => {
                    const isActive = activeFilters.includes(classification)
                    return (
                      <button
                        key={classification}
                        onClick={() => toggleFilter(classification)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isActive
                            ? 'border-brand bg-brand-subtle'
                            : 'border-border hover:bg-surface-hover'
                        }`}
                      >
                        <StatusBadge variant={CLASSIFICATION_VARIANTS[classification]}>
                          {CLASSIFICATION_LABELS[classification]}
                        </StatusBadge>
                        <p className="text-small text-ink-tertiary mt-1">
                          {classificationCounts.find(
                            (c) => c.classification === classification
                          )?.count || 0}{' '}
                          municipios
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {activeFilters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilters([])}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                <Input
                  placeholder="Buscar municipio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Municipio</TableHead>
                      <TableHead>Classificacao</TableHead>
                      <TableHead className="text-right">Eleitores</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMunicipios.slice(0, 50).map((municipio) => {
                      const classification =
                        municipio.classificacao ||
                        municipio.classification ||
                        'pendular'
                      return (
                        <TableRow key={municipio.codigo_ibge || municipio.nome}>
                          <TableCell className="font-medium">
                            {municipio.nome}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              variant={CLASSIFICATION_VARIANTS[classification]}
                            >
                              {CLASSIFICATION_LABELS[classification]}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {(municipio.eleitores || 0).toLocaleString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredMunicipios.length > 50 && (
                <p className="text-small text-ink-tertiary text-center">
                  Mostrando 50 de {filteredMunicipios.length} municipios
                </p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
