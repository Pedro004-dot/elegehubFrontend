import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { MapIcon } from 'lucide-react'
import type { MapSummary } from '../types'
import { CLASSIFICATION_CONFIG } from '@/features/strategic-map/types'

interface CompactMapProps {
  summary: MapSummary
}

export function CompactMap({ summary }: CompactMapProps) {
  const { classificationCounts } = summary

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Mapa Territorial
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mini map placeholder */}
        <Link
          to="/mapa/plano-acao"
          className="relative mb-4 flex h-40 items-center justify-center rounded-lg border border-border bg-muted/50 transition-colors hover:bg-muted"
        >
          <div className="text-center">
            <MapIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Clique para ver o mapa
            </p>
          </div>
        </Link>

        {/* Legend with counts */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CLASSIFICATION_CONFIG.consolidar.color }}
            />
            <span className="text-xs text-muted-foreground">
              Consolidar ({classificationCounts.consolidar})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CLASSIFICATION_CONFIG.conquistar.color }}
            />
            <span className="text-xs text-muted-foreground">
              Conquistar ({classificationCounts.conquistar})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CLASSIFICATION_CONFIG.disputar.color }}
            />
            <span className="text-xs text-muted-foreground">
              Disputar ({classificationCounts.disputar})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CLASSIFICATION_CONFIG.evitar.color }}
            />
            <span className="text-xs text-muted-foreground">
              Evitar ({classificationCounts.evitar})
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <Link
            to="/mapa/plano-acao"
            className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full' })}
          >
            Ver mapa completo
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
