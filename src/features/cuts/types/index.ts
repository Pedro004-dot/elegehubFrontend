export type VideoCutStatus = 'ready' | 'review' | 'published' | 'archived'
export type VideoCutFormat = '9:16' | '16:9' | '1:1'

export interface ChannelRecommendation {
  channel: 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'whatsapp'
  label: string
  adherence: 'high' | 'medium' | 'low'
  adherencePercent: number
}

export interface VideoCut {
  id: string
  campaignId: string
  title: string
  description?: string
  thumbnailUrl?: string
  videoUrl?: string
  storagePath?: string
  duration: number
  format: VideoCutFormat
  fileSize?: number
  status: VideoCutStatus
  viralScore?: number
  viralScoreReasons?: string[]
  transcription?: string
  suggestedCaption?: string
  suggestedHashtags?: string[]
  sourceSession?: string
  tags?: string[]
  channelRecommendations?: ChannelRecommendation[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface CutsResponse {
  data: VideoCut[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface CutsStats {
  total: number
  byStatus: Record<VideoCutStatus, number>
  byFormat: Record<VideoCutFormat, number>
}
