/**
 * MunicipalityListPage - Lista tabular de municipios
 *
 * Exibe todos os municipios do estado em formato tabular.
 * Permite filtrar por nome, ordenar por colunas, e navegar para briefing.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  List,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Users,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentCampaignSafe } from '@/features/auth/hooks/useCurrentCampaign'
import { BRAZIL_STATES } from '@/features/map/data/states'
import { useMunicipalityList } from '../hooks/use-municipality-list'

type SortField = 'nome' | 'populacao' | 'percentualVotoPartido'
type SortOrder = 'asc' | 'desc'

function formatNumber(num: number | null): string {
  if (num === null) return '-'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`
  return num.toLocaleString('pt-BR')
}

function formatPercent(num: number | null): string {
  if (num === null) return '-'
  return `${num.toFixed(1)}%`
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export function MunicipalityListPage() {
  const navigate = useNavigate()
  const campaign = useCurrentCampaignSafe()

  const [selectedState, setSelectedState] = useState(campaign?.state || 'MG')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const { municipalities, total, loading, error } = useMunicipalityList({
    uf: selectedState,
    search,
    sortBy,
    sortOrder,
  })

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleStateChange = (value: string | null) => {
    if (value) {
      setSelectedState(value)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    )
  }

  const stateName = BRAZIL_STATES.find((s) => s.uf === selectedState)?.name || selectedState

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <List className="h-6 w-6 text-brand" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Municipios de {stateName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Carregando...' : `${total} municipios`}
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
      </div>

      {/* Filtros */}
      <div className="px-6 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar municipio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {municipalities.length} {municipalities.length === 1 ? 'resultado' : 'resultados'}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">{error}</p>
          </div>
        ) : municipalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum municipio encontrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  <button
                    className="flex items-center hover:text-foreground transition-colors"
                    onClick={() => handleSort('nome')}
                  >
                    Municipio
                    <SortIcon field="nome" />
                  </button>
                </TableHead>
                <TableHead>Mesorregiao</TableHead>
                <TableHead className="text-right">
                  <button
                    className="flex items-center justify-end w-full hover:text-foreground transition-colors"
                    onClick={() => handleSort('populacao')}
                  >
                    Populacao
                    <SortIcon field="populacao" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    className="flex items-center justify-end w-full hover:text-foreground transition-colors"
                    onClick={() => handleSort('percentualVotoPartido')}
                  >
                    % Voto Vencedor
                    <SortIcon field="percentualVotoPartido" />
                  </button>
                </TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {municipalities.map((municipio) => (
                <TableRow
                  key={municipio.codigoIbge}
                  className="cursor-pointer"
                  onClick={() => navigate(`/municipio/${municipio.codigoIbge}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{municipio.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {municipio.mesorregiao}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-mono">{formatNumber(municipio.populacao)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPercent(municipio.percentualVotoPartido)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

export default MunicipalityListPage
