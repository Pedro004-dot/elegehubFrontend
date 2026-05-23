/**
 * ExecutiveSummarySection
 *
 * Displays the executive summary with key insights, strength/risk cards,
 * strategic bet, and top 3 actions.
 */

import { Card } from '@/components/ui/card'
import {
  BigNumber,
  EyebrowLabel,
  SectionHeader,
  InlineQuote,
} from '@/components/elegehub'
import type { ExecutiveSummaryData } from '../../types'

interface ExecutiveSummarySectionProps {
  data: unknown
}

export function ExecutiveSummarySection({ data }: ExecutiveSummarySectionProps) {
  const summary = data as ExecutiveSummaryData

  if (!summary) {
    return null
  }

  return (
    <div className="space-y-12">
      <SectionHeader
        eyebrow="SUMARIO EXECUTIVO"
        title="Visao geral da campanha"
        description="Sintese dos principais insights e recomendacoes estrategicas."
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <BigNumber
          label="META DE VOTOS"
          value={summary.resumo_numerico.votos_meta}
          suffix=" votos"
        />
        <BigNumber
          label="PROJECAO REALISTA"
          value={summary.resumo_numerico.votos_projecao}
          suffix=" votos"
          trend={
            ((summary.resumo_numerico.votos_projecao -
              summary.resumo_numerico.votos_meta) /
              summary.resumo_numerico.votos_meta) *
            100
          }
        />
        <BigNumber
          label="ORCAMENTO RECOMENDADO"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
          }).format(summary.resumo_numerico.orcamento_recomendado)}
        />
      </div>

      {/* Current State */}
      <InlineQuote variant="brand">
        {summary.estado_atual_candidatura}
      </InlineQuote>

      {/* Strength and Risk Cards */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 border-l-4 border-l-success">
          <EyebrowLabel className="text-success">PRINCIPAL FORCA</EyebrowLabel>
          <h3 className="text-h3 mt-3 text-ink-display">
            {summary.principal_forca.titulo}
          </h3>
          <p className="text-body text-ink-secondary mt-2">
            {summary.principal_forca.frase}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-danger">
          <EyebrowLabel className="text-danger">MAIOR RISCO</EyebrowLabel>
          <h3 className="text-h3 mt-3 text-ink-display">
            {summary.maior_risco.titulo}
          </h3>
          <p className="text-body text-ink-secondary mt-2">
            {summary.maior_risco.frase}
          </p>
        </Card>
      </div>

      {/* Strategic Bet */}
      <div className="p-6 bg-brand-subtle border border-brand-border rounded-lg">
        <EyebrowLabel className="text-brand">
          APOSTA ESTRATEGICA RECOMENDADA
        </EyebrowLabel>
        <p className="text-body-lg text-ink-display mt-3 leading-relaxed">
          {summary.aposta_estrategica_recomendada}
        </p>
      </div>

      {/* Top 3 Actions */}
      <div>
        <h3 className="text-h2 text-ink-display">
          Proximas 3 acoes nos proximos 30 dias
        </h3>
        <ol className="mt-6 space-y-4">
          {summary.top_3_acoes_30_dias.map((acao, i) => (
            <li
              key={i}
              className="flex gap-6 p-5 bg-surface-subtle rounded-lg"
            >
              <span className="text-display-sm font-mono text-brand">
                0{i + 1}
              </span>
              <div className="flex-1">
                <p className="text-h3 text-ink-display">{acao.acao}</p>
                <p className="text-small text-ink-tertiary mt-1 font-mono">
                  {acao.prazo}
                </p>
                <p className="text-body text-ink-secondary mt-2">
                  {acao.impacto_esperado}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
