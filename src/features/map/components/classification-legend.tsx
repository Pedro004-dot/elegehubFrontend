/**
 * ClassificationLegend - Legenda para modo de classificacao
 *
 * Mostra as 4 categorias com suas cores e contagens.
 * Quando cache vazio, mostra botao para calcular.
 */

import { Calculator, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CATEGORIA_CONFIGS, type CategoriaClassificacao } from '../types'

interface ClassificationLegendProps {
  /** Contagem de municipios por categoria */
  stats: Record<CategoriaClassificacao, number>
  /** Callback para iniciar calculo */
  onStartCalculation?: () => void
  /** Indica se esta calculando */
  calculating?: boolean
}

const CATEGORIA_ORDER: CategoriaClassificacao[] = [
  'prioritaria',
  'crescente',
  'exploratoria',
  'fora_radar',
]

export function ClassificationLegend({ stats, onStartCalculation, calculating }: ClassificationLegendProps) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0)
  const isEmpty = total === 0

  return (
    <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border p-3 z-10">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Classificacao Estrategica</span>
          <span className="text-xs text-muted-foreground">{total} municipios</span>
        </div>

        {/* Se vazio e tem callback, mostrar botao para calcular */}
        {isEmpty && onStartCalculation && (
          <div className="py-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onStartCalculation}
              disabled={calculating}
              className="w-full text-xs"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="w-3 h-3 mr-1.5" />
                  Calcular Classificacoes
                </>
              )}
            </Button>
            {calculating && (
              <p className="text-xs text-muted-foreground mt-1.5 text-center">
                Isso pode levar alguns minutos
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          {CATEGORIA_ORDER.map((categoria) => {
            const config = CATEGORIA_CONFIGS[categoria]
            const count = stats[categoria] || 0
            const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0

            return (
              <div key={categoria} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm border"
                  style={{
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                  }}
                />
                <span className="text-xs flex-1">{config.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {count} ({percentage}%)
                </span>
              </div>
            )
          })}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Baseado em condicoes booleanas auditaveis
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClassificationLegend
