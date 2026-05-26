/**
 * SuggestionPanel - Painel de Sugestao da IA
 *
 * Permite ao usuario solicitar sugestoes em 3 escopos legitimos:
 * - Sumario: resumir o que esta na tela
 * - Narrativa: justificar por que o municipio merece atencao
 * - Pauta: recomendar temas de discurso
 *
 * Conforme CLAUDE.md secao 6:
 * - A IA NUNCA estima votos ou probabilidade de vitoria
 * - A IA NUNCA recomenda alocacao de orcamento
 * - A IA NUNCA compara/ranqueia municipios
 */

import { useState } from 'react'
import {
  Sparkles,
  FileText,
  BookOpen,
  MessageSquare,
  X,
  Loader2,
  Info,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSugestaoIA } from '../hooks/use-sugestao-ia'
import { SUGESTAO_ESCOPOS, type SugestaoEscopo, type BriefingMunicipio } from '../types'

interface SuggestionPanelProps {
  codigoIbge: string
  briefing: BriefingMunicipio | null
}

const ESCOPO_ICONS: Record<SugestaoEscopo, React.ReactNode> = {
  sumario: <FileText className="h-4 w-4" />,
  narrativa: <BookOpen className="h-4 w-4" />,
  pauta: <MessageSquare className="h-4 w-4" />,
}

export function SuggestionPanel({ codigoIbge, briefing }: SuggestionPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEscopo, setSelectedEscopo] = useState<SugestaoEscopo | null>(null)

  const { sugestao, isLoading, generate, clear } = useSugestaoIA(codigoIbge, briefing)

  const handleSelectEscopo = async (escopo: SugestaoEscopo) => {
    setSelectedEscopo(escopo)
    setIsOpen(true)
    await generate(escopo)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedEscopo(null)
    clear()
  }

  const handleChangeEscopo = async (escopo: SugestaoEscopo) => {
    setSelectedEscopo(escopo)
    await generate(escopo)
  }

  return (
    <>
      {/* Botao principal */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Sugestao da IA:</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">
              A IA organiza os dados em narrativa. Nunca estima votos ou compara municipios.
            </p>
          </TooltipContent>
        </Tooltip>

        {(Object.keys(SUGESTAO_ESCOPOS) as SugestaoEscopo[]).map((escopo) => {
          const config = SUGESTAO_ESCOPOS[escopo]
          const icon = ESCOPO_ICONS[escopo]

          return (
            <Tooltip key={escopo}>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectEscopo(escopo)}
                  disabled={!briefing}
                >
                  {icon}
                  <span className="ml-1.5 hidden sm:inline">{config.titulo}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.descricao}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Sheet com resultado */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand" />
                <SheetTitle>Sugestao da IA</SheetTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SheetDescription>
              {selectedEscopo && SUGESTAO_ESCOPOS[selectedEscopo].descricao}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Seletor de escopo */}
            <div className="flex gap-2">
              {(Object.keys(SUGESTAO_ESCOPOS) as SugestaoEscopo[]).map((escopo) => {
                const config = SUGESTAO_ESCOPOS[escopo]
                const icon = ESCOPO_ICONS[escopo]
                const isSelected = selectedEscopo === escopo

                return (
                  <Button
                    key={escopo}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleChangeEscopo(escopo)}
                    disabled={isLoading}
                  >
                    {icon}
                    <span className="ml-1.5">{config.titulo}</span>
                  </Button>
                )
              })}
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <p className="text-sm text-muted-foreground">
                  Gerando sugestao...
                </p>
              </div>
            )}

            {/* Resultado */}
            {!isLoading && sugestao && (
              <div className="space-y-4">
                {/* Conteudo */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {sugestao.conteudo.split('\n').map((line, i) => {
                    // Processar markdown basico
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h3 key={i} className="text-base font-semibold mt-4 mb-2">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      )
                    }
                    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                      return (
                        <p key={i} className="text-sm text-muted-foreground italic">
                          {line.replace(/\*/g, '')}
                        </p>
                      )
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={i} className="text-sm ml-4">
                          {line.substring(2)}
                        </li>
                      )
                    }
                    if (line.trim() === '') {
                      return <br key={i} />
                    }
                    return (
                      <p key={i} className="text-sm">
                        {line}
                      </p>
                    )
                  })}
                </div>

                {/* Metadados */}
                <div className="pt-4 border-t space-y-3">
                  {/* Indicadores consultados */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Database className="h-3.5 w-3.5" />
                      <span>Indicadores consultados:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sugestao.indicadoresConsultados.map((ind, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {ind}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground">
                    Gerado em {new Date(sugestao.geradoEm).toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Aviso */}
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Esta sugestao e baseada nos dados disponiveis e serve como ponto de partida
                    para analise. A decisao final e sempre do candidato e sua equipe.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default SuggestionPanel
