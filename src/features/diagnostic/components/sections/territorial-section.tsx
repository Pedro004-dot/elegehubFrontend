/**
 * TerritorialSection
 *
 * Displays territorial analysis with macro view, map,
 * budget allocation, and municipality table.
 *
 * Uses the deterministic municipality analysis algorithm when campaignId is provided.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BigNumber,
  EyebrowLabel,
  SectionHeader,
  StatusBadge,
} from '@/components/elegehub'
import { Search, Maximize2, ArrowUpDown, Loader2 } from 'lucide-react'
import { TerritorialMap } from '../map'
import { useMunicipalityAnalysis } from '../../hooks'
import type { TerritorialData, TerritorialClassification, TerritorialMunicipio } from '../../types'

interface TerritorialSectionProps {
  data?: unknown
  /** State code (UF) for rendering the map - e.g., "MG", "SP" */
  uf?: string
  /** Campaign ID for fetching deterministic analysis */
  campaignId?: string
}

const CLASSIFICATION_LABELS: Record<TerritorialClassification, string> = {
  fiel: 'Fiel',
  pendular: 'Pendular',
  disputavel: 'Disputável',
  hostil: 'Hostil',
  alta_abstencao: 'Alta Abstenção',
}

const CLASSIFICATION_VARIANTS: Record<TerritorialClassification, 'opportunity' | 'attention' | 'risk' | 'neutral'> = {
  fiel: 'opportunity',
  pendular: 'attention',
  disputavel: 'attention',
  hostil: 'risk',
  alta_abstencao: 'neutral',
}

type SortField = 'score' | 'votos' | 'roi' | 'eleitorado' | 'nome'
type SortDirection = 'asc' | 'desc'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function TerritorialSection({ data, uf = 'MG', campaignId }: TerritorialSectionProps) {
  const navigate = useNavigate()
  const territorial = data as TerritorialData | undefined
  const [searchQuery, setSearchQuery] = useState('')
  const [classificationFilter, setClassificationFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Fetch deterministic analysis if campaignId is provided
  const { data: analysisData, loading, error } = useMunicipalityAnalysis({
    campaignId: campaignId || '',
    enabled: !!campaignId,
  })

  // Use deterministic data if available, otherwise fall back to AI data
  const useDeterministic = !!analysisData?.municipios?.length
  const municipios: TerritorialMunicipio[] = useDeterministic
    ? analysisData.municipios
    : (territorial?.municipios_classificados || []) as TerritorialMunicipio[]

  const estatisticas = analysisData?.estatisticas
  const meta = analysisData?.meta

  // Show loading state
  if (campaignId && loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <span className="ml-3 text-ink-secondary">Carregando análise territorial...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-danger-subtle border border-danger rounded-lg">
        <p className="text-danger">Erro ao carregar análise: {error.message}</p>
      </div>
    )
  }

  if (!municipios.length) {
    return null
  }

  // Calculate classification counts
  const classificationCounts = municipios.reduce(
    (acc, m) => {
      const classification = m.classification || m.classificacao || 'pendular'
      acc[classification] = (acc[classification] || 0) + 1
      return acc
    },
    {} as Record<TerritorialClassification, number>
  )

  // Sort municipalities
  const sortedMunicipios = [...municipios].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'score':
        comparison = (a.score || 0) - (b.score || 0)
        break
      case 'votos':
        comparison = (a.votos_potenciais_ajustado || 0) - (b.votos_potenciais_ajustado || 0)
        break
      case 'roi':
        comparison = (a.roi || 0) - (b.roi || 0)
        break
      case 'eleitorado':
        comparison = (a.eleitorado || a.eleitores || 0) - (b.eleitorado || b.eleitores || 0)
        break
      case 'nome':
        comparison = a.nome.localeCompare(b.nome)
        break
    }
    return sortDirection === 'desc' ? -comparison : comparison
  })

  // Filter municipalities
  const filteredMunicipios = sortedMunicipios.filter((m) => {
    const matchesSearch = m.nome.toLowerCase().includes(searchQuery.toLowerCase())
    const classification = m.classification || m.classificacao || 'pendular'
    const matchesClass =
      classificationFilter === 'all' || classification === classificationFilter
    return matchesSearch && matchesClass
  })

  // Calculate totals for macro view
  const totalEleitores = municipios.reduce(
    (sum, m) => sum + (m.eleitorado || m.eleitores || 0),
    0
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-surface-hover select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-brand' : 'text-ink-tertiary'}`} />
      </div>
    </TableHead>
  )

  // Classifications to show (include disputavel if using deterministic data)
  const classificationsToShow: TerritorialClassification[] = useDeterministic
    ? ['fiel', 'pendular', 'disputavel', 'hostil']
    : ['fiel', 'pendular', 'hostil', 'alta_abstencao']

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="ANÁLISE TERRITORIAL"
        title="Mapeamento estratégico do território"
        description={
          meta
            ? `Análise para ${meta.partido_sigla} (${meta.partido_espectro || 'sem espectro'}) em ${meta.uf} - ${meta.cargo}`
            : 'Classificação dos municípios por potencial eleitoral e recomendações de alocação de recursos.'
        }
      />

      {/* Macro View Cards - Enhanced with deterministic data */}
      <div className={`grid gap-6 ${useDeterministic ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <Card className="p-6">
          <BigNumber
            label="TOTAL DE MUNICÍPIOS"
            value={estatisticas?.total_municipios || municipios.length}
            suffix=" municípios"
          />
        </Card>
        <Card className="p-6">
          <BigNumber
            label="VOTOS POTENCIAIS"
            value={estatisticas?.votos_potenciais_ajustado_total || 0}
            suffix=" votos"
          />
        </Card>
        {useDeterministic && (
          <>
            <Card className="p-6">
              <BigNumber
                label="CUSTO TOTAL ESTIMADO"
                value={formatCurrency(estatisticas?.custo_total_estimado || 0)}
              />
            </Card>
            <Card className="p-6">
              <BigNumber
                label="SCORE MÉDIO"
                value={estatisticas?.score_medio || 0}
                suffix="%"
              />
            </Card>
          </>
        )}
        {!useDeterministic && (
          <>
            <Card className="p-6">
              <BigNumber
                label="TOTAL DE ELEITORES"
                value={totalEleitores}
                suffix=" eleitores"
              />
            </Card>
            <Card className="p-6">
              <BigNumber
                label="MUNICÍPIOS FIÉIS"
                value={classificationCounts.fiel || 0}
                suffix=" municípios"
              />
            </Card>
          </>
        )}
      </div>

      {/* Classification Summary - Updated with disputavel */}
      <div className={`grid gap-4 ${useDeterministic ? 'grid-cols-4' : 'grid-cols-4'}`}>
        {classificationsToShow.map((classification) => (
          <button
            key={classification}
            onClick={() =>
              setClassificationFilter(
                classificationFilter === classification ? 'all' : classification
              )
            }
            className={`p-4 rounded-lg border transition-all ${
              classificationFilter === classification
                ? 'border-brand bg-brand-subtle'
                : 'border-border bg-surface-base hover:bg-surface-hover'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    classification === 'fiel'
                      ? '#22c55e'
                      : classification === 'pendular'
                      ? '#eab308'
                      : classification === 'disputavel'
                      ? '#f97316'
                      : classification === 'hostil'
                      ? '#ef4444'
                      : '#71717a',
                }}
              />
              <span className="text-small font-medium text-ink-primary">
                {CLASSIFICATION_LABELS[classification]}
              </span>
            </div>
            <p className="text-h2 font-mono tabular-nums text-ink-display">
              {estatisticas?.por_classificacao?.[classification] || classificationCounts[classification] || 0}
            </p>
            <p className="text-caption text-ink-tertiary">municípios</p>
          </button>
        ))}
      </div>

      {/* Territorial Map */}
      <div className="relative">
        <TerritorialMap
          municipios={municipios}
          uf={meta?.uf || uf}
          height={400}
          activeFilters={classificationFilter === 'all' ? [] : [classificationFilter as TerritorialClassification]}
          showControls
          className="rounded-lg overflow-hidden border border-border"
        />
        <Button
          variant="outline"
          size="sm"
          className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm"
          onClick={() => navigate('/diagnostico/mapa')}
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Expandir
        </Button>
      </div>

      {/* Recommendations */}
      {territorial?.recomendacoes && (
        <div className="p-6 bg-brand-subtle border border-brand-border rounded-lg">
          <EyebrowLabel className="text-brand">RECOMENDAÇÃO ESTRATÉGICA</EyebrowLabel>
          <p className="text-body-lg text-ink-display mt-3 leading-relaxed">
            {territorial.recomendacoes}
          </p>
        </div>
      )}

      {/* Municipalities Table - Enhanced with deterministic data */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-h2 text-ink-display">
            Municípios ({filteredMunicipios.length})
          </h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
              <Input
                placeholder="Buscar município..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={classificationFilter} onValueChange={(value) => setClassificationFilter(value || 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="fiel">Fiel</SelectItem>
                <SelectItem value="pendular">Pendular</SelectItem>
                {useDeterministic && <SelectItem value="disputavel">Disputável</SelectItem>}
                <SelectItem value="hostil">Hostil</SelectItem>
                {!useDeterministic && <SelectItem value="alta_abstencao">Alta Abstenção</SelectItem>}
              </SelectContent>
            </Select>
            {useDeterministic && (
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="votos">Votos Potenciais</SelectItem>
                  <SelectItem value="roi">ROI</SelectItem>
                  <SelectItem value="eleitorado">Eleitorado</SelectItem>
                  <SelectItem value="nome">Nome</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="nome">Município</SortableHeader>
                <TableHead>Classificação</TableHead>
                {useDeterministic ? (
                  <>
                    <SortableHeader field="score">
                      <span className="text-right w-full">Score</span>
                    </SortableHeader>
                    <SortableHeader field="votos">
                      <span className="text-right w-full">Votos Pot.</span>
                    </SortableHeader>
                    <SortableHeader field="eleitorado">
                      <span className="text-right w-full">Eleitorado</span>
                    </SortableHeader>
                    <TableHead className="text-right">Custo Est.</TableHead>
                    <SortableHeader field="roi">
                      <span className="text-right w-full">ROI</span>
                    </SortableHeader>
                  </>
                ) : (
                  <>
                    <TableHead className="text-right">Eleitores</TableHead>
                    <TableHead className="text-right">% Estado</TableHead>
                    <TableHead>Tendência</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMunicipios.slice(0, 50).map((municipio) => {
                const classification = municipio.classification || municipio.classificacao || 'pendular'
                const eleitores = municipio.eleitorado || municipio.eleitores || 0
                return (
                  <TableRow key={municipio.municipio_id || municipio.codigo_ibge || municipio.nome}>
                    <TableCell className="font-medium">{municipio.nome}</TableCell>
                    <TableCell>
                      <StatusBadge variant={CLASSIFICATION_VARIANTS[classification]}>
                        {CLASSIFICATION_LABELS[classification]}
                      </StatusBadge>
                    </TableCell>
                    {useDeterministic ? (
                      <>
                        <TableCell className="text-right font-mono tabular-nums">
                          <span className={`${
                            (municipio.score || 0) >= 0.65 ? 'text-success' :
                            (municipio.score || 0) >= 0.45 ? 'text-warning' :
                            (municipio.score || 0) >= 0.25 ? 'text-orange-500' :
                            'text-danger'
                          }`}>
                            {municipio.score_percentual || Math.round((municipio.score || 0) * 100)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {(municipio.votos_potenciais_ajustado || 0).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {eleitores.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-ink-secondary">
                          {formatCurrency(municipio.custo?.custo_estimado || 0)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          <span className={`${
                            Number(municipio.roi || 0) >= 1 ? 'text-success' :
                            Number(municipio.roi || 0) >= 0.5 ? 'text-warning' :
                            'text-danger'
                          }`}>
                            {Number(municipio.roi || 0).toFixed(2)}
                          </span>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-right font-mono tabular-nums">
                          {eleitores.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {totalEleitores > 0 ? ((eleitores / totalEleitores) * 100).toFixed(2) : '0.00'}%
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-small ${
                              municipio.tendencia === 'crescente' || municipio.tendencia === 'crescimento'
                                ? 'text-success'
                                : municipio.tendencia === 'decrescente' || municipio.tendencia === 'retracao'
                                ? 'text-danger'
                                : 'text-ink-tertiary'
                            }`}
                          >
                            {municipio.tendencia === 'crescente' || municipio.tendencia === 'crescimento'
                              ? '↑ Crescente'
                              : municipio.tendencia === 'decrescente' || municipio.tendencia === 'retracao'
                              ? '↓ Decrescente'
                              : '→ Estável'}
                          </span>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {filteredMunicipios.length > 50 && (
          <p className="text-small text-ink-tertiary mt-4 text-center">
            Mostrando 50 de {filteredMunicipios.length} municípios
          </p>
        )}
      </div>
    </div>
  )
}
