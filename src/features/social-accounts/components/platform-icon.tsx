import type { SocialPlatform } from '../types'

interface PlatformIconProps {
  platform: SocialPlatform
  size?: number
  className?: string
}

const PLATFORM_ICONS: Record<SocialPlatform, { emoji: string; bgColor: string }> = {
  instagram: { emoji: '📸', bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  facebook: { emoji: '📘', bgColor: 'bg-blue-600' },
  tiktok: { emoji: '🎵', bgColor: 'bg-black' },
  youtube: { emoji: '▶️', bgColor: 'bg-red-600' },
}

export function PlatformIcon({ platform, size = 40, className = '' }: PlatformIconProps) {
  const config = PLATFORM_ICONS[platform]

  return (
    <div
      className={`flex items-center justify-center rounded-lg text-white ${config.bgColor} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {config.emoji}
    </div>
  )
}

export function PlatformName({ platform }: { platform: SocialPlatform }) {
  const names: Record<SocialPlatform, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    youtube: 'YouTube',
  }

  return <span>{names[platform]}</span>
}
