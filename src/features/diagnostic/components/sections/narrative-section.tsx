/**
 * NarrativeSection
 *
 * Displays narrative strategy with pillars, synthesis phrase,
 * slogans, and communication alerts.
 */

import { Card } from '@/components/ui/card'
import {
  EyebrowLabel,
  SectionHeader,
  InlineQuote,
  StatusBadge,
} from '@/components/elegehub'
import { MessageSquare, Quote, AlertTriangle, Lightbulb, Zap } from 'lucide-react'
import type { NarrativeData } from '../../types'

interface NarrativeSectionProps {
  data: unknown
}

export function NarrativeSection({ data }: NarrativeSectionProps) {
  const narrative = data as NarrativeData

  if (!narrative) {
    return null
  }

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="ESTRATEGIA NARRATIVA"
        title="Construa sua mensagem vencedora"
        description="Pilares narrativos, frases-sintese e recomendacoes de comunicacao baseadas no territorio."
      />

      {/* Synthesis Phrase */}
      {narrative.frase_sintese && (
        <InlineQuote variant="brand" icon={<Quote className="w-6 h-6" />}>
          {narrative.frase_sintese}
        </InlineQuote>
      )}

      {/* Narrative Pillars */}
      {narrative.pilares && narrative.pilares.length > 0 && (
        <div>
          <h3 className="text-h2 text-ink-display mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand" />
            Pilares Narrativos
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {narrative.pilares.map((pilar, i) => (
              <Card key={i} className="p-6 border-t-4 border-t-brand">
                <span className="text-display-sm font-mono text-brand">
                  0{i + 1}
                </span>
                <h4 className="text-h3 text-ink-display mt-3">{pilar.titulo}</h4>
                <p className="text-body text-ink-secondary mt-3">
                  {pilar.descricao}
                </p>
                {pilar.exemplos && pilar.exemplos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-caption text-ink-tertiary uppercase tracking-wider mb-2">
                      Exemplos de uso
                    </p>
                    <ul className="space-y-2">
                      {pilar.exemplos.map((exemplo, j) => (
                        <li
                          key={j}
                          className="text-small text-ink-secondary flex items-start gap-2"
                        >
                          <span className="text-brand">•</span>
                          {exemplo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Slogans */}
      {narrative.slogans && narrative.slogans.length > 0 && (
        <div>
          <h3 className="text-h2 text-ink-display mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-warning" />
            Sugestoes de Slogan
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {narrative.slogans.map((slogan, i) => (
              <Card
                key={i}
                className="p-5 hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <p className="text-h3 text-ink-display">"{slogan.texto}"</p>
                {slogan.contexto && (
                  <p className="text-small text-ink-secondary mt-2">
                    {slogan.contexto}
                  </p>
                )}
                {slogan.score && (
                  <div className="mt-3 flex items-center gap-2">
                    <StatusBadge
                      variant={
                        slogan.score >= 0.8
                          ? 'opportunity'
                          : slogan.score >= 0.6
                          ? 'attention'
                          : 'neutral'
                      }
                    >
                      Score: {Math.round(slogan.score * 100)}%
                    </StatusBadge>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Key Messages */}
      {narrative.mensagens_chave && narrative.mensagens_chave.length > 0 && (
        <div>
          <h3 className="text-h2 text-ink-display mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-success" />
            Mensagens-Chave
          </h3>
          <div className="space-y-4">
            {narrative.mensagens_chave.map((msg, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-h2 font-mono text-brand">0{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-body-lg text-ink-display">{msg.mensagem}</p>
                    {msg.publico_alvo && (
                      <p className="text-small text-ink-tertiary mt-2">
                        Publico-alvo: {msg.publico_alvo}
                      </p>
                    )}
                    {msg.canal_recomendado && (
                      <div className="mt-3">
                        <StatusBadge variant="brand">
                          {msg.canal_recomendado}
                        </StatusBadge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Communication Alerts */}
      {narrative.alertas && narrative.alertas.length > 0 && (
        <div>
          <h3 className="text-h2 text-ink-display mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-danger" />
            Alertas de Comunicacao
          </h3>
          <div className="space-y-3">
            {narrative.alertas.map((alerta, i) => (
              <Card key={i} className="p-5 border-l-4 border-l-danger">
                <p className="text-body text-ink-primary font-medium">
                  {alerta.titulo}
                </p>
                <p className="text-body text-ink-secondary mt-2">
                  {alerta.descricao}
                </p>
                {alerta.recomendacao && (
                  <div className="mt-3 p-3 bg-surface-subtle rounded-md">
                    <p className="text-small text-ink-secondary">
                      <span className="font-medium text-ink-primary">
                        Como evitar:
                      </span>{' '}
                      {alerta.recomendacao}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tom de Voz */}
      {narrative.tom_recomendado && (
        <div className="p-6 bg-brand-subtle border border-brand-border rounded-lg">
          <EyebrowLabel className="text-brand">TOM DE VOZ RECOMENDADO</EyebrowLabel>
          <p className="text-body-lg text-ink-display mt-3">
            {narrative.tom_recomendado}
          </p>
          {narrative.caracteristicas_tom && (
            <div className="mt-4 flex flex-wrap gap-2">
              {narrative.caracteristicas_tom.map((car, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-white/50 rounded-full text-small text-ink-primary"
                >
                  {car}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
