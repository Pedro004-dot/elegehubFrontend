import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useSocialAccounts } from '@/features/social-accounts/hooks/use-social-accounts'
import { usePublications } from '../../hooks/use-publications'
import { PlatformIcon } from '@/features/social-accounts/components/platform-icon'
import type { VideoCut } from '../../types/video-cuts'
import {
  Send,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X,
} from 'lucide-react'

// TODO: Obter do contexto
const CAMPAIGN_ID = 'demo-campaign-id'

interface PublishModalProps {
  cut: VideoCut
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PublishModal({ cut, open, onClose, onSuccess }: PublishModalProps) {
  const { accounts, isLoading: isLoadingAccounts } = useSocialAccounts({ campaignId: CAMPAIGN_ID })
  const { schedulePublication, publishNow, isPublishing } = usePublications({ campaignId: CAMPAIGN_ID })

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('12:00')
  const [results, setResults] = useState<Array<{
    platform: string
    success: boolean
    error?: string
    postUrl?: string
  }> | null>(null)

  // Resetar estado quando abrir
  useEffect(() => {
    if (open) {
      setCaption(cut.suggestedCaption ?? '')
      setHashtags(cut.suggestedHashtags?.join(' ') || '')
      setSelectedAccounts([])
      setIsScheduled(false)
      setResults(null)

      // Definir data mínima como amanhã
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setScheduleDate(tomorrow.toISOString().split('T')[0] ?? '')
    }
  }, [open, cut])

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handlePublish = async () => {
    if (selectedAccounts.length === 0) return

    const hashtagsArray = hashtags
      .split(/\s+/)
      .filter(h => h.length > 0)
      .map(h => (h.startsWith('#') ? h : `#${h}`))

    try {
      if (isScheduled && scheduleDate) {
        const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}:00`)

        await schedulePublication({
          videoCutId: cut.id,
          socialAccountIds: selectedAccounts,
          caption,
          hashtags: hashtagsArray,
          scheduledFor: scheduledFor.toISOString(),
        })

        setResults([{ platform: 'all', success: true }])

        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      } else {
        const result = await publishNow({
          videoCutId: cut.id,
          socialAccountIds: selectedAccounts,
          caption,
          hashtags: hashtagsArray,
        })

        setResults(
          result.results.map(r => ({
            platform: r.platform,
            success: r.success,
            error: r.error,
            postUrl: r.postUrl,
          }))
        )

        if (result.allSucceeded) {
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 3000)
        }
      }
    } catch (error) {
      setResults([
        {
          platform: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      ])
    }
  }

  // Filtrar contas recomendadas baseado no canal
  const recommendedPlatforms = cut.channelRecommendations
    ?.filter(r => r.adherence === 'high')
    .map(r => r.channel) || []

  const activeAccounts = accounts.filter(a => a.isActive)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Publicar: {cut.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Preview do vídeo */}
          <div className="flex gap-4">
            <img
              src={cut.thumbnailUrl}
              alt={cut.title}
              className="w-20 h-32 object-cover rounded-lg bg-muted"
            />
            <div className="flex-1">
              <p className="font-medium line-clamp-2">{cut.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {cut.duration}s • {cut.format}
              </p>
              {cut.viralScore && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Score viral:</span>{' '}
                  <span className="font-medium text-green-600">{cut.viralScore}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resultados */}
          {results && (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    result.success
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                  <div className="flex-1">
                    {result.success ? (
                      isScheduled ? (
                        <span>Publicação agendada com sucesso!</span>
                      ) : (
                        <span>Publicado no {result.platform}!</span>
                      )
                    ) : (
                      <span>Erro: {result.error}</span>
                    )}
                  </div>
                  {result.postUrl && (
                    <a
                      href={result.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      Ver post
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Seleção de contas */}
          {!results && (
            <>
              <div>
                <label className="text-sm font-medium">Publicar em:</label>
                {isLoadingAccounts ? (
                  <div className="mt-2 flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activeAccounts.length === 0 ? (
                  <div className="mt-2 p-4 bg-amber-50 rounded-lg flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Nenhuma conta conectada</p>
                      <p className="text-sm">
                        Conecte suas redes sociais nas configurações.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {activeAccounts.map(account => {
                      const isRecommended = recommendedPlatforms.includes(account.platform)
                      const isSelected = selectedAccounts.includes(account.id)

                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => toggleAccount(account.id)}
                          className={`
                            w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                            ${isSelected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
                          `}
                        >
                          <PlatformIcon platform={account.platform} size={32} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {account.platformName || account.platform}
                            </p>
                            {account.pageName && (
                              <p className="text-xs text-muted-foreground truncate">
                                {account.pageName}
                              </p>
                            )}
                          </div>
                          {isRecommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex-shrink-0">
                              Recomendado
                            </span>
                          )}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-primary bg-primary' : 'border-muted'
                            }`}
                          >
                            {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Legenda */}
              <div>
                <label className="text-sm font-medium">Legenda:</label>
                <Textarea
                  value={caption}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value)}
                  rows={3}
                  className="mt-2"
                  placeholder="Escreva a legenda do post..."
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-sm font-medium">Hashtags:</label>
                <Textarea
                  value={hashtags}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHashtags(e.target.value)}
                  rows={2}
                  className="mt-2"
                  placeholder="#eleicoes2026 #politica..."
                />
              </div>

              {/* Agendamento */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Agendar publicação</span>
                </div>
                <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
              </div>

              {isScheduled && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Data</label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-muted-foreground">Horário</label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPublishing}>
            {results ? 'Fechar' : 'Cancelar'}
          </Button>
          {!results && (
            <Button
              onClick={handlePublish}
              disabled={selectedAccounts.length === 0 || isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isScheduled ? 'Agendando...' : 'Publicando...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isScheduled ? 'Agendar' : 'Publicar Agora'}
                </>
              )}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
