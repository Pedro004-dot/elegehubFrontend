import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Download, Check, Send, Copy, Pencil, X, Save } from 'lucide-react'
import type { VideoCut } from '../../types/video-cuts'
import { VIDEO_CUT_STATUS_CONFIG, formatDuration, ADHERENCE_CONFIG } from '../../types/video-cuts'
import { ViralScoreMeter } from './viral-score-meter'

interface VideoCutDetailDrawerProps {
  cut: VideoCut | null
  onClose: () => void
  onPublish: (cut: VideoCut) => void
  onApprove: (cut: VideoCut) => void
  onDownload?: (cut: VideoCut) => void
  onEditCaption?: (cut: VideoCut, caption: string) => void
}

export function VideoCutDetailDrawer({
  cut,
  onClose,
  onPublish,
  onApprove,
  onDownload,
  onEditCaption,
}: VideoCutDetailDrawerProps) {
  const [isEditingCaption, setIsEditingCaption] = useState(false)
  const [editedCaption, setEditedCaption] = useState('')
  const [copiedHashtags, setCopiedHashtags] = useState(false)

  if (!cut) return null

  const statusConfig = VIDEO_CUT_STATUS_CONFIG[cut.status]

  const handleEditCaption = () => {
    setEditedCaption(cut.suggestedCaption)
    setIsEditingCaption(true)
  }

  const handleSaveCaption = () => {
    if (onEditCaption && editedCaption !== cut.suggestedCaption) {
      onEditCaption(cut, editedCaption)
    }
    setIsEditingCaption(false)
  }

  const handleCopyHashtags = async () => {
    await navigator.clipboard.writeText(cut.suggestedHashtags.join(' '))
    setCopiedHashtags(true)
    setTimeout(() => setCopiedHashtags(false), 2000)
  }

  return (
    <Sheet open={!!cut} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] overflow-y-auto"
        showCloseButton
      >
        <SheetHeader className="pb-0">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: statusConfig.color }}
            />
            <span className={cn('text-xs font-medium', statusConfig.textColor)}>
              {statusConfig.label}
            </span>
          </div>
          <SheetTitle className="text-left">{cut.title}</SheetTitle>
          <SheetDescription className="text-left">
            {cut.sourceSession} · {cut.tags.join(' · ')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Video Player */}
          <div className="relative aspect-[9/16] bg-muted rounded-lg overflow-hidden">
            <img
              src={cut.thumbnailUrl}
              alt={cut.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                <svg
                  className="h-6 w-6 text-black fill-black ml-1"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Video info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span>⏱️</span>
              <span>Duracao: {formatDuration(cut.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>📐</span>
              <span>Formato: {cut.format}</span>
            </div>
          </div>

          <Separator />

          {/* Viral Score */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Score de Potencial Viral</h3>
            <ViralScoreMeter
              score={cut.viralScore}
              reasons={cut.viralScoreReasons}
              showReasons
              size="md"
            />
          </div>

          <Separator />

          {/* Transcription */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Transcricao do Corte</h3>
            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground italic">
              "{cut.transcription}"
            </div>
          </div>

          <Separator />

          {/* Suggested Caption */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Legenda Sugerida</h3>
              {!isEditingCaption ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleEditCaption}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsEditingCaption(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleSaveCaption}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                </div>
              )}
            </div>

            {isEditingCaption ? (
              <textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="w-full min-h-[100px] rounded-lg border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                {cut.suggestedCaption}
              </div>
            )}

            {/* Hashtags */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {cut.suggestedHashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs shrink-0"
                onClick={handleCopyHashtags}
              >
                {copiedHashtags ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-green-500" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Channel Recommendations */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Canais Recomendados</h3>
            <div className="space-y-2.5">
              {cut.channelRecommendations.map((rec) => {
                const adherenceConfig = ADHERENCE_CONFIG[rec.adherence]
                return (
                  <div key={rec.channel} className="flex items-center gap-3">
                    <span className="text-lg w-6">{rec.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{rec.label}</span>
                        <span
                          className="text-xs font-medium ml-2"
                          style={{ color: adherenceConfig.color }}
                        >
                          {adherenceConfig.label}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${rec.adherencePercent}%`,
                            backgroundColor: adherenceConfig.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 pt-2">
          {onDownload && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onDownload(cut)}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          )}

          {cut.status === 'review' && (
            <Button className="flex-1" onClick={() => onApprove(cut)}>
              <Check className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          )}

          {cut.status === 'ready' && (
            <Button className="flex-1" onClick={() => onPublish(cut)}>
              <Send className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
