/**
 * ActionPlanSection
 *
 * Displays the strategic action plan with timeline,
 * budget allocation, and prioritized actions.
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import {
  Calendar,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import type { ActionPlanData, ActionItem } from '../../types'

interface ActionPlanSectionProps {
  data: unknown
}

const PHASE_COLORS = {
  'pre-campanha': 'bg-blue-500',
  campanha: 'bg-brand',
  'pos-campanha': 'bg-purple-500',
}

const PRIORITY_VARIANTS: Record<string, 'risk' | 'attention' | 'opportunity' | 'neutral'> = {
  alta: 'risk',
  media: 'attention',
  baixa: 'neutral',
}

export function ActionPlanSection({ data }: ActionPlanSectionProps) {
  const actionPlan = data as ActionPlanData
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  if (!actionPlan) {
    return null
  }

  // Group actions by phase
  const actionsByPhase = actionPlan.acoes?.reduce(
    (acc, action) => {
      const phase = action.fase || 'campanha'
      if (!acc[phase]) acc[phase] = []
      acc[phase].push(action)
      return acc
    },
    {} as Record<string, ActionItem[]>
  ) || {}

  const phases = Object.keys(actionsByPhase)

  // Calculate budget by channel
  const budgetByChannel = actionPlan.orcamento_por_canal || []

  // Filter actions based on selected phase
  const displayedActions = selectedPhase
    ? actionsByPhase[selectedPhase] || []
    : actionPlan.acoes?.slice(0, 10) || []

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="PLANO DE ACAO"
        title="Sua rota para a vitoria"
        description="Acoes priorizadas, cronograma e alocacao de recursos para maximizar suas chances."
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5">
          <BigNumber
            size="sm"
            label="TOTAL DE ACOES"
            value={actionPlan.acoes?.length || 0}
            suffix=" acoes"
          />
        </Card>
        <Card className="p-5">
          <BigNumber
            size="sm"
            label="ORCAMENTO TOTAL"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            }).format(actionPlan.orcamento_total || 0)}
          />
        </Card>
        <Card className="p-5">
          <BigNumber
            size="sm"
            label="ACOES PRIORITARIAS"
            value={
              actionPlan.acoes?.filter((a) => a.prioridade === 'alta').length || 0
            }
            suffix=" acoes"
          />
        </Card>
        <Card className="p-5">
          <BigNumber
            size="sm"
            label="DURACAO"
            value={actionPlan.duracao_meses || 0}
            suffix=" meses"
          />
        </Card>
      </div>

      {/* Timeline by Phase */}
      {phases.length > 0 && (
        <div>
          <h3 className="text-h2 text-ink-display mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand" />
            Cronograma por Fase
          </h3>
          <div className="flex gap-4">
            {phases.map((phase) => {
              const phaseActions = actionsByPhase[phase] || []
              const isSelected = selectedPhase === phase
              return (
                <button
                  key={phase}
                  onClick={() =>
                    setSelectedPhase(isSelected ? null : phase)
                  }
                  className={`flex-1 p-6 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-brand bg-brand-subtle'
                      : 'border-border bg-surface-base hover:bg-surface-hover'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full mb-3 ${
                      PHASE_COLORS[phase as keyof typeof PHASE_COLORS] ||
                      'bg-ink-tertiary'
                    }`}
                  />
                  <p className="text-h3 text-ink-display capitalize">{phase}</p>
                  <p className="text-small text-ink-tertiary mt-1">
                    {phaseActions.length} acoes
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Budget Allocation */}
      {budgetByChannel.length > 0 && (
        <div>
          <h3 className="text-h2 text-ink-display mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-success" />
            Alocacao de Orcamento
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Donut Chart Placeholder */}
            <Card className="p-6">
              <div className="h-[200px] flex items-center justify-center bg-surface-subtle rounded-lg">
                <p className="text-ink-tertiary">
                  Grafico de orcamento sera implementado aqui
                </p>
              </div>
            </Card>

            {/* Channel List */}
            <Card className="p-6">
              <div className="space-y-4">
                {budgetByChannel.map((channel, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body text-ink-primary">
                        {channel.canal}
                      </span>
                      <span className="text-body font-mono tabular-nums text-ink-display">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        }).format(channel.valor)}
                      </span>
                    </div>
                    <Progress
                      value={
                        ((channel.valor || 0) /
                          (actionPlan.orcamento_total || 1)) *
                        100
                      }
                      className="h-1.5"
                    />
                    <p className="text-caption text-ink-tertiary mt-1">
                      {(
                        ((channel.valor || 0) /
                          (actionPlan.orcamento_total || 1)) *
                        100
                      ).toFixed(1)}
                      % do total
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Top Actions Table */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-h2 text-ink-display flex items-center gap-2">
            <Target className="w-6 h-6 text-brand" />
            {selectedPhase
              ? `Acoes - ${selectedPhase}`
              : 'Top 10 Acoes Prioritarias'}
          </h3>
          {selectedPhase && (
            <button
              onClick={() => setSelectedPhase(null)}
              className="text-small text-brand hover:underline"
            >
              Ver todas
            </button>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Acao</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="text-right">Orcamento</TableHead>
                <TableHead>Impacto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedActions.map((action, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-ink-tertiary">
                    {String(i + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell>
                    <p className="text-body text-ink-primary font-medium">
                      {action.titulo}
                    </p>
                    {action.descricao && (
                      <p className="text-small text-ink-tertiary mt-1 line-clamp-1">
                        {action.descricao}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={PRIORITY_VARIANTS[action.prioridade || 'media']}
                    >
                      {action.prioridade || 'Media'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-small text-ink-secondary">
                      <Clock className="w-3.5 h-3.5" />
                      {action.prazo || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {action.orcamento
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        }).format(action.orcamento)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <span className="text-small text-ink-secondary">
                      {action.impacto_esperado || '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {(actionPlan.acoes?.length || 0) > 10 && !selectedPhase && (
          <p className="text-small text-ink-tertiary mt-4 text-center">
            Mostrando 10 de {actionPlan.acoes?.length} acoes
          </p>
        )}
      </div>

      {/* Main Recommendation */}
      {actionPlan.recomendacao_principal && (
        <div className="p-6 bg-brand-subtle border border-brand-border rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div>
              <EyebrowLabel className="text-brand">
                RECOMENDACAO PRINCIPAL
              </EyebrowLabel>
              <p className="text-body-lg text-ink-display mt-2">
                {actionPlan.recomendacao_principal}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Win */}
      {actionPlan.quick_win && (
        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-start gap-4">
            <ArrowRight className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <EyebrowLabel className="text-success">
                PROXIMA ACAO IMEDIATA
              </EyebrowLabel>
              <p className="text-h3 text-ink-display mt-2">
                {actionPlan.quick_win.titulo}
              </p>
              <p className="text-body text-ink-secondary mt-2">
                {actionPlan.quick_win.descricao}
              </p>
              <p className="text-small text-ink-tertiary mt-3 font-mono">
                Prazo: {actionPlan.quick_win.prazo}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
