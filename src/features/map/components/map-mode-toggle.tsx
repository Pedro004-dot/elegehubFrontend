/**
 * MapModeToggle - Alterna entre modos de visualizacao do mapa
 *
 * - Indicadores: coloracao por indicador selecionado (gradiente)
 * - Classificacao: coloracao por categoria (prioritaria, crescente, etc)
 */

import { BarChart3, Target } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type MapMode = 'indicadores' | 'classificacao'

interface MapModeToggleProps {
  value: MapMode
  onChange: (mode: MapMode) => void
  disabled?: boolean
  classificationCount?: number
}

export function MapModeToggle({
  value,
  onChange,
  disabled,
  classificationCount,
}: MapModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Modo:</span>
      <Tabs value={value} onValueChange={(v) => onChange(v as MapMode)}>
        <TabsList className="h-9">
          <TabsTrigger
            value="indicadores"
            disabled={disabled}
            className="gap-1.5"
            title="Colorir por indicador (dados publicos)"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Indicadores</span>
          </TabsTrigger>

          <TabsTrigger
            value="classificacao"
            disabled={disabled}
            className="gap-1.5"
            title="Colorir por categoria estrategica do partido"
          >
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Classificacao</span>
            {classificationCount !== undefined && classificationCount > 0 && (
              <span className="ml-1 text-xs bg-primary/10 px-1.5 rounded-full">
                {classificationCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

export default MapModeToggle
