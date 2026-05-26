import { Film, Play, Clock, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { VideoCut } from '../types'

interface VideoCutCardProps {
  cut: VideoCut
  onPlay: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function VideoCutCard({ cut, onPlay }: VideoCutCardProps) {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow" onClick={onPlay}>
      <div className="relative aspect-[9/16] bg-muted">
        {cut.thumbnailUrl ? (
          <img
            src={cut.thumbnailUrl}
            alt={cut.title}
            className="w-full h-full object-cover"
          />
        ) : cut.videoUrl ? (
          <video
            src={cut.videoUrl}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
            onLoadedData={(e) => {
              // Pausar no primeiro frame
              const video = e.currentTarget
              video.currentTime = 0.5
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted-foreground/10">
            <Film className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Overlay com play */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-primary fill-primary ml-1" />
          </div>
        </div>

        {/* Badge de duracao */}
        <Badge className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/70">
          <Clock className="w-3 h-3 mr-1" />
          {formatDuration(cut.duration)}
        </Badge>

        {/* Badge de formato */}
        <Badge variant="secondary" className="absolute top-2 left-2">
          {cut.format}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-medium truncate" title={cut.title}>{cut.title}</h3>
        {cut.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {cut.description}
          </p>
        )}

        {cut.tags && cut.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {cut.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {cut.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{cut.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Canais recomendados */}
        {cut.channelRecommendations && cut.channelRecommendations.length > 0 && (
          <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
            {cut.channelRecommendations.slice(0, 2).map(rec => (
              <span key={rec.channel} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  rec.adherence === 'high' ? 'bg-green-500' :
                  rec.adherence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                {rec.label}: {rec.adherencePercent}%
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
