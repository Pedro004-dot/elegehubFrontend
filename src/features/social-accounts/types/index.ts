export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube'

export interface SocialAccount {
  id: string
  platform: SocialPlatform
  platformUsername?: string
  platformName?: string
  pageId?: string
  pageName?: string
  profilePictureUrl?: string
  isActive: boolean
  connectedAt: Date
  tokenExpiresAt?: Date
  isTokenExpiring: boolean
}

export interface PageInfo {
  id: string
  name: string
  accessToken: string
  category?: string
  instagramAccountId?: string
}

export interface PlatformConfig {
  id: SocialPlatform
  name: string
  description: string
  icon: string
  color: string
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Reels e Stories',
    icon: '📸',
    color: '#E4405F',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Vídeos e Reels',
    icon: '📘',
    color: '#1877F2',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Vídeos curtos',
    icon: '🎵',
    color: '#000000',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Shorts',
    icon: '▶️',
    color: '#FF0000',
  },
]
