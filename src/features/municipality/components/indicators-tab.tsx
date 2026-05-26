/**
 * IndicatorsTab - Tab de indicadores por tema
 *
 * Exibe os 6 temas de indicadores conforme CLAUDE.md secao 7.3:
 * - Presenca do partido
 * - Comportamento eleitoral
 * - Perfil do eleitorado
 * - Condicoes socioeconomicas
 * - Saude publica
 * - Liderancas locais
 *
 * Cada indicador mostra valor, contexto comparativo e fonte.
 */

import {
  BarChart3,
  Users,
  Vote,
  Briefcase,
  HeartPulse,
  UserCheck,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Database,
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TEMA_INFO, type TemaType, type TemaIndicadores } from '../types'
import { useIndicadores } from '../hooks/use-indicadores'
import { IndicatorRow } from './indicator-row'

interface IndicatorsTabProps {
  codigoIbge: string
  partidoId?: number
}

const TEMA_ICONS: Record<TemaType, React.ReactNode> = {
  presenca_partido: <Vote className="h-5 w-5" />,
  comportamento_eleitoral: <BarChart3 className="h-5 w-5" />,
  perfil_eleitorado: <Users className="h-5 w-5" />,
  condicoes_socioeconomicas: <Briefcase className="h-5 w-5" />,
  saude_publica: <HeartPulse className="h-5 w-5" />,
  liderancas_locais: <UserCheck className="h-5 w-5" />,
}

const TEMAS_ORDER: TemaType[] = [
  'presenca_partido',
  'comportamento_eleitoral',
  'perfil_eleitorado',
  'condicoes_socioeconomicas',
  'saude_publica',
  'liderancas_locais',
]

/**
 * Skeleton para carregamento
 */
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {TEMAS_ORDER.map((temaId) => (
        <Card key={temaId}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-4 w-60 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Estado de erro
 */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="p-4 rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">Erro ao carregar indicadores</h3>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar novamente
      </Button>
    </div>
  )
}

/**
 * Card de tema individual
 */
function ThemeCard({ tema, isExpanded, onToggle }: {
  tema: TemaIndicadores
  isExpanded: boolean
  onToggle: () => void
}) {
  const info = TEMA_INFO[tema.tema] || { titulo: tema.titulo, descricao: tema.descricao }
  const icon = TEMA_ICONS[tema.tema]
  const hasIndicators = tema.indicadores.length > 0

  return (
    <Card className={!hasIndicators ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-primary">{icon}</span>
            <CardTitle className="text-base">{info.titulo}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {tema.indicadores.length} indicadores
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
        <CardDescription className="text-xs">{info.descricao}</CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {hasIndicators ? (
            <div className="divide-y">
              {tema.indicadores.map((indicador, idx) => (
                <IndicatorRow key={`${tema.tema}-${idx}`} indicador={indicador} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 bg-muted/30 rounded-md">
              <p className="text-sm text-muted-foreground">
                Dados nao disponiveis para este tema
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Tab principal de indicadores
 */
export function IndicatorsTab({ codigoIbge, partidoId = 13 }: IndicatorsTabProps) {
  const { temas, metadata, isLoading, error, refetch } = useIndicadores(codigoIbge, partidoId)

  // Estado para controlar quais temas estao expandidos
  const [expandedTemas, setExpandedTemas] = useState<Set<TemaType>>(
    new Set(['presenca_partido', 'comportamento_eleitoral'])
  )

  const toggleTema = (temaId: TemaType) => {
    setExpandedTemas((prev) => {
      const next = new Set(prev)
      if (next.has(temaId)) {
        next.delete(temaId)
      } else {
        next.add(temaId)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedTemas(new Set(TEMAS_ORDER))
  }

  const collapseAll = () => {
    setExpandedTemas(new Set())
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Indicadores por Tema</h2>
          <p className="text-sm text-muted-foreground">Carregando indicadores...</p>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  // Error state
  if (error && !temas) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Indicadores por Tema</h2>
        </div>
        <ErrorState error={error} onRetry={refetch} />
      </div>
    )
  }

  // Organizar temas na ordem correta
  const temasOrdenados = TEMAS_ORDER.map((temaId) =>
    temas?.find((t) => t.tema === temaId)
  ).filter((t): t is TemaIndicadores => t !== undefined)

  // Calcular total de indicadores
  const totalIndicadores = temasOrdenados.reduce(
    (acc, tema) => acc + tema.indicadores.length,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Indicadores por Tema</h2>
          <p className="text-sm text-muted-foreground">
            {totalIndicadores} indicadores em {temasOrdenados.length} temas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expandir todos
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Recolher todos
          </Button>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Grid de temas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {temasOrdenados.map((tema) => (
          <ThemeCard
            key={tema.tema}
            tema={tema}
            isExpanded={expandedTemas.has(tema.tema)}
            onToggle={() => toggleTema(tema.tema)}
          />
        ))}
      </div>

      {/* Footer com metadados */}
      {metadata && (
        <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5" />
            <span>
              Dados calculados em{' '}
              {new Date(metadata.dataCalculo).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <span>
            Municipio: {metadata.nomeMunicipio} ({metadata.codigoIbge})
          </span>
        </div>
      )}
    </div>
  )
}

export default IndicatorsTab
