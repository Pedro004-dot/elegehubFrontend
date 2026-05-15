import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Play, Eye, Send, Check, RotateCcw } from 'lucide-react'
import type { VideoCut } from '../../types/video-cuts'
import { VIDEO_CUT_STATUS_CONFIG, formatDuration } from '../../types/video-cuts'
import { ViralScoreMeter } from './viral-score-meter'

interface VideoCutCardProps {
  cut: VideoCut
  onSelect: (cut: VideoCut) => void
  onPublish?: (cut: VideoCut) => void
  onApprove?: (cut: VideoCut) => void
  onRestore?: (cut: VideoCut) => void
}

export function VideoCutCard({
  cut,
  onSelect,
  onPublish,
  onApprove,
  onRestore,
}: VideoCutCardProps) {
  const statusConfig = VIDEO_CUT_STATUS_CONFIG[cut.status]

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Thumbnail */}
      <div
        className="relative aspect-[9/16] bg-muted overflow-hidden"
        onClick={() => onSelect(cut)}
      >
        <img
          src={cut.thumbnailUrl}
          alt={cut.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
            <Play className="h-5 w-5 text-black fill-black" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(cut.duration)}
        </div>

        {/* Format badge */}
        <div className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
          {cut.format}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-3 space-y-2">
        {/* Title */}
        <h3
          className="font-medium line-clamp-2 text-sm leading-tight cursor-pointer hover:text-primary"
          onClick={() => onSelect(cut)}
        >
          {cut.title}
        </h3>

        {/* Status badge */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: statusConfig.color }}
          />
          <span className={cn('text-xs font-medium', statusConfig.textColor)}>
            {statusConfig.label}
          </span>
        </div>

        {/* Source session */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>📍</span>
          <span>{cut.sourceSession}</span>
        </div>

        {/* Tags */}
        {cut.tags.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>🏷️</span>
            <span>{cut.tags.join(' · ')}</span>
          </div>
        )}

        {/* Viral score */}
        <div className="pt-1">
          <p className="text-xs text-muted-foreground mb-1">Score viral</p>
          <ViralScoreMeter score={cut.viralScore} size="sm" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onSelect(cut)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>

          {cut.status === 'ready' && onPublish && (
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onPublish(cut)
              }}
            >
              <Send className="h-3 w-3 mr-1" />
              Publicar
            </Button>
          )}

          {cut.status === 'review' && onApprove && (
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onApprove(cut)
              }}
            >
              <Check className="h-3 w-3 mr-1" />
              Aprovar
            </Button>
          )}

          {cut.status === 'archived' && onRestore && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onRestore(cut)
              }}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restaurar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
