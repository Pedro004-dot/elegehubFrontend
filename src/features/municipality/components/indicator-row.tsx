/**
 * IndicatorRow - Linha individual de indicador
 *
 * Exibe: nome, valor, unidade, contexto comparativo, tendencia e fonte.
 * Conforme CLAUDE.md secao 7.3: "dado cru e cidadao de primeira classe"
 */

import { ArrowUp, ArrowDown, Minus, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import type { Indicador } from '../types'

interface IndicatorRowProps {
  indicador: Indicador
}

/**
 * Retorna a cor do badge baseado na posicao relativa
 */
function getContextBadgeVariant(
  posicao: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (posicao.includes('acima')) return 'default'
  if (posicao.includes('abaixo')) return 'destructive'
  if (posicao.includes('favoravel')) return 'default'
  return 'secondary'
}

/**
 * Retorna o icone e cor da tendencia
 */
function getTrendDisplay(direcao: 'crescimento' | 'estavel' | 'queda') {
  switch (direcao) {
    case 'crescimento':
      return {
        icon: <ArrowUp className="h-3.5 w-3.5" />,
        colorClass: 'text-green-600',
        bgClass: 'bg-green-50',
      }
    case 'queda':
      return {
        icon: <ArrowDown className="h-3.5 w-3.5" />,
        colorClass: 'text-red-600',
        bgClass: 'bg-red-50',
      }
    default:
      return {
        icon: <Minus className="h-3.5 w-3.5" />,
        colorClass: 'text-gray-500',
        bgClass: 'bg-gray-50',
      }
  }
}

/**
 * Formata o valor para exibicao
 */
function formatValue(valor: number | string, unidade: string): string {
  if (valor === 'N/D') return 'N/D'

  if (typeof valor === 'number') {
    // Formatar numeros grandes
    if (Math.abs(valor) >= 1000000) {
      return `${(valor / 1000000).toFixed(1)}M ${unidade}`.trim()
    }
    if (Math.abs(valor) >= 1000) {
      return `${(valor / 1000).toFixed(1)}k ${unidade}`.trim()
    }
    // Formatar percentuais e decimais
    if (unidade === '%') {
      return `${valor.toFixed(1)}%`
    }
    // Numeros inteiros
    if (Number.isInteger(valor)) {
      return `${valor.toLocaleString('pt-BR')} ${unidade}`.trim()
    }
    return `${valor.toFixed(2)} ${unidade}`.trim()
  }

  return `${valor} ${unidade}`.trim()
}

export function IndicatorRow({ indicador }: IndicatorRowProps) {
  const { nome, valor, unidade, contextoComparativo, tendencia, fonte } = indicador

  const formattedValue = formatValue(valor, unidade)
  const badgeVariant = getContextBadgeVariant(contextoComparativo.posicaoRelativa)

  return (
    <div className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-md transition-colors">
      {/* Nome e Valor */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{nome}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  Fonte: {fonte.tabela}.{fonte.campo} ({fonte.ano})
                </p>
                {typeof contextoComparativo.mediaEstadual === 'number' && (
                  <p className="text-xs mt-1">
                    Media estadual: {contextoComparativo.mediaEstadual.toLocaleString('pt-BR')}
                    {unidade === '%' ? '%' : ` ${unidade}`}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-lg font-semibold text-foreground mt-0.5">{formattedValue}</div>
      </div>

      {/* Contexto e Tendencia */}
      <div className="flex items-center gap-2 ml-4">
        {/* Badge de contexto */}
        <Badge variant={badgeVariant} className="text-xs whitespace-nowrap">
          {contextoComparativo.posicaoRelativa}
        </Badge>

        {/* Tendencia */}
        {tendencia && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${getTrendDisplay(tendencia.direcao).bgClass}`}
          >
            <span className={getTrendDisplay(tendencia.direcao).colorClass}>
              {getTrendDisplay(tendencia.direcao).icon}
            </span>
            <span
              className={`text-xs font-medium ${getTrendDisplay(tendencia.direcao).colorClass}`}
            >
              {tendencia.variacao > 0 ? '+' : ''}
              {tendencia.variacao.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndicatorRow
