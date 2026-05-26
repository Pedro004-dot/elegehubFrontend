/**
 * ClassificationTab - Tab "Por que essa categoria"
 *
 * Mostra a classificacao do municipio com:
 * - Categoria atribuida (prioritaria, crescente, etc)
 * - Condicoes determinantes (por que o municipio recebeu essa categoria)
 * - Lista completa de condicoes avaliadas (transparencia total)
 *
 * Principio: "Todas as decisoes de classificacao sao auditaveis"
 */

import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useClassification,
  CATEGORIA_CONFIG,
  CONDICAO_LABELS,
  type CategoriaClassificacao,
} from '../hooks/use-classification'

interface ClassificationTabProps {
  codigoIbge: string
  partidoId: number
}

function ClassificationSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NoClassificationState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Classificacao nao disponivel</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Este municipio ainda nao foi classificado para o partido selecionado.
          Execute o batch de classificacao para gerar as classificacoes.
        </p>
      </CardContent>
    </Card>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-destructive">Erro ao carregar</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">{error}</p>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

function CategoryBadge({ categoria }: { categoria: CategoriaClassificacao }) {
  const config = CATEGORIA_CONFIG[categoria]

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <span className="font-semibold" style={{ color: config.color }}>
        {config.label}
      </span>
    </div>
  )
}

function ConditionRow({
  id,
  resultado,
  valor_bruto,
  criterio,
  isDeterminante,
}: {
  id: string
  resultado: boolean
  valor_bruto: unknown
  criterio: string
  isDeterminante: boolean
}) {
  const label = CONDICAO_LABELS[id] || id

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        isDeterminante ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {resultado ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${resultado ? 'text-green-700' : 'text-muted-foreground'}`}>
            {label}
          </span>
          {isDeterminante && (
            <Badge variant="secondary" className="text-xs">
              Determinante
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{criterio}</p>
        {valor_bruto !== null && valor_bruto !== undefined && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Valor: {typeof valor_bruto === 'object' ? JSON.stringify(valor_bruto) : String(valor_bruto)}
          </p>
        )}
      </div>
    </div>
  )
}

export function ClassificationTab({ codigoIbge, partidoId }: ClassificationTabProps) {
  const { classificacao, loading, error, refetch } = useClassification({
    codigoIbge,
    partidoId,
  })

  if (loading) {
    return <ClassificationSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (!classificacao) {
    return <NoClassificationState />
  }

  const config = CATEGORIA_CONFIG[classificacao.categoria]
  const condicoesDeterminantesSet = new Set(classificacao.condicoes_determinantes)

  // Separar condicoes: determinantes primeiro, depois as outras
  const condicoesOrdenadas = [...classificacao.condicoes].sort((a, b) => {
    const aIsDet = condicoesDeterminantesSet.has(a.id)
    const bIsDet = condicoesDeterminantesSet.has(b.id)
    if (aIsDet && !bIsDet) return -1
    if (!aIsDet && bIsDet) return 1
    // Dentro do mesmo grupo, verdadeiros primeiro
    if (a.resultado && !b.resultado) return -1
    if (!a.resultado && b.resultado) return 1
    return 0
  })

  const condicoesVerdadeiras = classificacao.condicoes.filter((c) => c.resultado).length
  const condicoesFalsas = classificacao.condicoes.filter((c) => !c.resultado).length

  return (
    <div className="space-y-6">
      {/* Card principal: Categoria */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Classificacao Estrategica</CardTitle>
              <CardDescription>
                Partido {classificacao.partido_sigla} · Calculado em{' '}
                {new Date(classificacao.data_calculo).toLocaleDateString('pt-BR')}
              </CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Classificacao baseada em condicoes booleanas auditaveis.
                Sem scores opacos - cada decisao pode ser rastreada.
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <CategoryBadge categoria={classificacao.categoria} />
            <div className="flex-1">
              <p className="text-muted-foreground">{config.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-green-600">
                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                  {condicoesVerdadeiras} condicoes atendidas
                </span>
                <span className="text-red-500">
                  <XCircle className="h-4 w-4 inline mr-1" />
                  {condicoesFalsas} condicoes nao atendidas
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card: Condicoes Determinantes */}
      {classificacao.condicoes_determinantes.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Por que essa categoria?
            </CardTitle>
            <CardDescription>
              Estas condicoes foram decisivas para a classificacao como "{config.label}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {classificacao.condicoes_determinantes.map((condId) => {
                const label = CONDICAO_LABELS[condId] || condId
                return (
                  <li key={condId} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{label}</span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Card: Todas as Condicoes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todas as Condicoes Avaliadas</CardTitle>
          <CardDescription>
            Versao do algoritmo: {classificacao.versao_algoritmo} ·
            {classificacao.condicoes.length} condicoes no total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {condicoesOrdenadas.map((cond) => (
              <ConditionRow
                key={cond.id}
                id={cond.id}
                resultado={cond.resultado}
                valor_bruto={cond.valor_bruto}
                criterio={cond.criterio}
                isDeterminante={condicoesDeterminantesSet.has(cond.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-xs text-muted-foreground text-center py-2">
        Todas as decisoes de classificacao sao auditaveis.
        Nenhum score opaco - apenas condicoes booleanas transparentes.
      </div>
    </div>
  )
}

export default ClassificationTab
