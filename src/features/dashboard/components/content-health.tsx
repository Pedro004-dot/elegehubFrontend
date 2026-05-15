import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowUpIcon } from 'lucide-react'
import type { ContentHealth as ContentHealthType } from '../types'

interface ContentHealthProps {
  health: ContentHealthType
}

export function ContentHealth({ health }: ContentHealthProps) {
  const publishedPercent =
    health.totalVideos > 0
      ? Math.round((health.publishedCount / health.totalVideos) * 100)
      : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Saúde do Conteúdo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline progress */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Pipeline de Vídeos
            </span>
            <span className="text-xs font-medium text-foreground">
              {publishedPercent}%
            </span>
          </div>
          <Progress value={publishedPercent} className="h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            {health.publishedCount} publicados · {health.pendingReviewCount} em
            revisão · {health.readyCount} prontos
          </p>
        </div>

        {/* Viral score */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Viral Score Médio</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {health.averageViralScore}/100
              </span>
              {health.viralScoreTrend > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-green-500">
                  <ArrowUpIcon className="h-3 w-3" />
                  {health.viralScoreTrend} pts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/campanha/cortes"
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full' })}
        >
          Ver biblioteca
        </Link>
      </CardContent>
    </Card>
  )
}
