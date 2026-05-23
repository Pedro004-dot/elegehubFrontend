/**
 * DiagnosticHistoryPage
 *
 * View all diagnostic versions with status, date, and actions.
 */

import { useNavigate } from 'react-router-dom'
import { useCurrentCampaign } from '@/features/auth/hooks/useCurrentCampaign'
import { useDiagnosticVersions } from '../hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  SectionHeader,
  EmptyState,
  StatusBadge,
} from '@/components/elegehub'
import {
  History,
  FileText,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import type { DiagnosticRun, DiagnosticStatus, ToneProfileId } from '../types'

const STATUS_CONFIG: Record<
  DiagnosticStatus,
  {
    label: string
    variant: 'opportunity' | 'attention' | 'risk' | 'neutral' | 'brand'
    icon: typeof CheckCircle
  }
> = {
  pending: { label: 'Pendente', variant: 'neutral', icon: Clock },
  running: { label: 'Gerando', variant: 'brand', icon: Loader2 },
  completed: { label: 'Completo', variant: 'opportunity', icon: CheckCircle },
  failed: { label: 'Falhou', variant: 'risk', icon: XCircle },
  cancelled: { label: 'Cancelado', variant: 'neutral', icon: XCircle },
}

const TONE_LABELS: Record<ToneProfileId, string> = {
  tecnico: 'Tecnico',
  marketeiro: 'Marketeiro',
  estrategista: 'Estrategista',
  custom: 'Personalizado',
}

const TRIGGER_LABELS: Record<string, string> = {
  manual: 'Manual',
  auto_after_onboarding: 'Apos onboarding',
  scheduled: 'Agendado',
}

export function DiagnosticHistoryPage() {
  const navigate = useNavigate()
  const campaign = useCurrentCampaign()
  const { versions, loading, error, refetch } = useDiagnosticVersions({
    campaignId: campaign.id,
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body text-ink-secondary">Carregando historico...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={History}
        title="Erro ao carregar historico"
        description={error.message}
        action={{ label: 'Tentar novamente', onClick: refetch }}
      />
    )
  }

  if (versions.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Nenhum diagnostico gerado"
        description="Gere seu primeiro diagnostico para comecar a ver o historico."
        action={{
          label: 'Gerar Diagnostico',
          onClick: () => navigate('/diagnostico/gerando'),
        }}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
      <SectionHeader
        eyebrow="HISTORICO"
        title="Versoes do Diagnostico"
        description={`${versions.length} versoes geradas para esta campanha.`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/diagnostico/configuracoes')}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Gerar Nova Versao
          </Button>
        }
      />

      <div className="mt-8 space-y-4">
        {versions.map((run) => (
          <VersionCard key={run.id} run={run} onView={() => navigate('/diagnostico')} />
        ))}
      </div>
    </div>
  )
}

function VersionCard({
  run,
  onView,
}: {
  run: DiagnosticRun
  onView: () => void
}) {
  const statusConfig = STATUS_CONFIG[run.status]
  const StatusIcon = statusConfig.icon

  const formattedDate = new Date(run.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const durationMinutes = run.duration_ms
    ? Math.round(run.duration_ms / 60000)
    : null

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-subtle flex items-center justify-center">
            <FileText className="w-5 h-5 text-ink-tertiary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-h3 text-ink-display">Versao {run.version}</h3>
              <StatusBadge variant={statusConfig.variant}>
                <StatusIcon
                  className={`w-3 h-3 mr-1 ${
                    run.status === 'running' ? 'animate-spin' : ''
                  }`}
                />
                {statusConfig.label}
              </StatusBadge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-small text-ink-tertiary">
              <span>{formattedDate}</span>
              <span>•</span>
              <span>Tom: {TONE_LABELS[run.tone_profile]}</span>
              <span>•</span>
              <span>{TRIGGER_LABELS[run.triggered_by]}</span>
              {durationMinutes !== null && (
                <>
                  <span>•</span>
                  <span>{durationMinutes}min</span>
                </>
              )}
            </div>
            {run.error_message && (
              <p className="text-small text-danger mt-2">{run.error_message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {run.status === 'completed' && (
            <>
              <Button variant="ghost" size="sm" onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                Ver
              </Button>
              {run.pdf_storage_path && (
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cost Info (collapsed by default) */}
      {run.status === 'completed' && (
        <div className="mt-4 pt-4 border-t border-border flex gap-6 text-caption text-ink-tertiary">
          <span>
            Custo: ${run.total_cost_usd.toFixed(4)}
          </span>
          <span>
            Tokens: {(run.total_tokens_input + run.total_tokens_output).toLocaleString()}
          </span>
        </div>
      )}
    </Card>
  )
}
