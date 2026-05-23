/**
 * BenchmarkSection
 *
 * Displays benchmark analysis comparing the candidate
 * to historical winners in similar positions.
 */

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  BigNumber,
  EyebrowLabel,
  SectionHeader,
  StatusBadge,
} from '@/components/elegehub'
import { TrendingUp, TrendingDown, Target } from 'lucide-react'
import type { BenchmarkData } from '../../types'

interface BenchmarkSectionProps {
  data: unknown
}

export function BenchmarkSection({ data }: BenchmarkSectionProps) {
  const benchmark = data as BenchmarkData

  if (!benchmark) {
    return null
  }

  const gap = benchmark.projecao
    ? benchmark.projecao.votos - benchmark.meta_votos
    : 0
  const gapPercent = benchmark.meta_votos
    ? (gap / benchmark.meta_votos) * 100
    : 0

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="BENCHMARK ELEITORAL"
        title="Como voce se compara aos eleitos"
        description="Analise comparativa com candidatos eleitos em posicoes similares nas ultimas eleicoes."
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5">
          <BigNumber
            size="sm"
            label="META DE VOTOS"
            value={benchmark.meta_votos}
            suffix=" votos"
          />
        </Card>
        <Card className="p-5">
          <BigNumber
            size="sm"
            label="MEDIA ELEITOS"
            value={benchmark.media_eleitos}
            suffix=" votos"
          />
        </Card>
        <Card className="p-5">
          <BigNumber
            size="sm"
            label="CAC HISTORICO"
            value={`R$ ${benchmark.cac_historico?.toFixed(2) || '-'}`}
          />
          <p className="text-caption text-ink-tertiary mt-1">custo por voto</p>
        </Card>
        <Card className="p-5">
          <BigNumber
            size="sm"
            label="ORCAMENTO MINIMO"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            }).format(benchmark.orcamento_minimo || 0)}
          />
        </Card>
      </div>

      {/* Projection Card */}
      {benchmark.projecao && (
        <Card className="p-6 bg-surface-subtle border-2 border-brand">
          <div className="flex items-start justify-between">
            <div>
              <EyebrowLabel className="text-brand">SUA PROJECAO</EyebrowLabel>
              <p className="text-display-sm font-mono tabular-nums text-ink-display mt-2">
                {benchmark.projecao.votos.toLocaleString('pt-BR')} votos
              </p>
              <p className="text-body text-ink-secondary mt-2">
                {benchmark.projecao.descricao}
              </p>
            </div>
            <div className="text-right">
              <StatusBadge
                variant={gapPercent >= 0 ? 'opportunity' : 'risk'}
                className="mb-2"
              >
                {gapPercent >= 0 ? 'Acima da meta' : 'Abaixo da meta'}
              </StatusBadge>
              <p className="text-h2 font-mono tabular-nums flex items-center justify-end gap-2">
                {gapPercent >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-danger" />
                )}
                <span className={gapPercent >= 0 ? 'text-success' : 'text-danger'}>
                  {gapPercent >= 0 ? '+' : ''}
                  {gapPercent.toFixed(1)}%
                </span>
              </p>
            </div>
          </div>

          {/* Gap Gauge */}
          <div className="mt-6">
            <div className="flex justify-between text-small text-ink-tertiary mb-2">
              <span>Meta: {benchmark.meta_votos.toLocaleString('pt-BR')}</span>
              <span>
                Projecao: {benchmark.projecao.votos.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="relative h-3 bg-surface-muted rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-brand rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (benchmark.projecao.votos / benchmark.meta_votos) * 100
                  )}%`,
                }}
              />
              <div
                className="absolute h-full w-0.5 bg-ink-display"
                style={{ left: '100%', transform: 'translateX(-50%)' }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Historical Comparison */}
      {benchmark.comparativo_historico && (
        <div>
          <h3 className="text-h2 text-ink-display mb-6">
            Comparativo com eleitos anteriores
          </h3>
          <div className="grid gap-4">
            {benchmark.comparativo_historico.map((eleito, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-h3 text-ink-display">{eleito.nome}</p>
                    <p className="text-small text-ink-tertiary">
                      {eleito.cargo} • {eleito.ano}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-h2 font-mono tabular-nums text-ink-display">
                      {eleito.votos.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-small text-ink-tertiary">votos</p>
                  </div>
                </div>
                {eleito.caracteristicas && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {eleito.caracteristicas.map((car, j) => (
                      <span
                        key={j}
                        className="px-2 py-1 bg-surface-subtle rounded text-small text-ink-secondary"
                      >
                        {car}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance Dimensions */}
      {benchmark.dimensoes && (
        <div>
          <h3 className="text-h2 text-ink-display mb-6">
            Desempenho por dimensao
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {benchmark.dimensoes.map((dim, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-body font-medium text-ink-primary">
                    {dim.nome}
                  </span>
                  <span className="text-h3 font-mono tabular-nums text-ink-display">
                    {dim.score}%
                  </span>
                </div>
                <Progress value={dim.score} className="h-2" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-caption text-ink-tertiary">
                    Media: {dim.media_eleitos}%
                  </span>
                  <span
                    className={`text-caption flex items-center gap-1 ${
                      dim.score >= dim.media_eleitos
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {dim.score >= dim.media_eleitos ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {dim.score >= dim.media_eleitos ? 'Acima' : 'Abaixo'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {benchmark.recomendacao && (
        <div className="p-6 bg-brand-subtle border border-brand-border rounded-lg">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div>
              <EyebrowLabel className="text-brand">
                RECOMENDACAO DE BENCHMARK
              </EyebrowLabel>
              <p className="text-body-lg text-ink-display mt-2">
                {benchmark.recomendacao}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
