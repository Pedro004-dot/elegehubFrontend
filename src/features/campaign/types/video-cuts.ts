export type VideoCutStatus = 'ready' | 'review' | 'published' | 'archived'

export interface VideoCut {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  duration: number // em segundos
  format: '9:16' | '16:9' | '1:1'
  status: VideoCutStatus
  viralScore: number // 0-100
  viralScoreReasons: string[]
  transcription: string
  suggestedCaption: string
  suggestedHashtags: string[]
  sourceSession: string // ex: "Sessao de 06/11"
  tags: string[]
  channelRecommendations: ChannelRecommendation[]
  createdAt: Date
  publishedAt?: Date
}

export interface ChannelRecommendation {
  channel: 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'whatsapp'
  label: string
  icon: string
  adherence: 'high' | 'medium' | 'low'
  adherencePercent: number
}

export interface VideoCutsKpis {
  totalCuts: number
  totalDuration: number // em minutos
  publishedCount: number
  reviewCount: number
  readyCount: number
  archivedCount: number
}

export const VIDEO_CUT_STATUS_CONFIG: Record<
  VideoCutStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  ready: {
    label: 'Pronto',
    color: '#22c55e',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-500',
  },
  review: {
    label: 'Em revisao',
    color: '#eab308',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-500',
  },
  published: {
    label: 'Publicado',
    color: '#3b82f6',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
  },
  archived: {
    label: 'Arquivado',
    color: '#6b7280',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-500',
  },
}

export const CHANNEL_CONFIG: Record<
  ChannelRecommendation['channel'],
  { label: string; icon: string }
> = {
  instagram: { label: 'Instagram Reels', icon: '📱' },
  tiktok: { label: 'TikTok', icon: '🎵' },
  facebook: { label: 'Facebook Reels', icon: '📘' },
  youtube: { label: 'YouTube Shorts', icon: '▶️' },
  whatsapp: { label: 'WhatsApp Status', icon: '💬' },
}

export const ADHERENCE_CONFIG: Record<
  ChannelRecommendation['adherence'],
  { label: string; color: string }
> = {
  high: { label: 'Alta', color: '#22c55e' },
  medium: { label: 'Media', color: '#eab308' },
  low: { label: 'Baixa', color: '#ef4444' },
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatTotalDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
}

export function getViralScoreStars(score: number): number {
  if (score >= 80) return 4
  if (score >= 60) return 3
  if (score >= 40) return 2
  return 1
}

export function getViralScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}
