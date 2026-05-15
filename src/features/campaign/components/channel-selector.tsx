import { Switch } from '@/components/ui/switch'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../types'

interface ChannelSelectorProps {
  activeChannels: ChannelId[]
  onToggle: (channelId: ChannelId) => void
}

export function ChannelSelector({
  activeChannels,
  onToggle,
}: ChannelSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Canais Prioritarios
      </label>

      <div className="space-y-3">
        {CHANNELS.map((channel) => (
          <div
            key={channel.id}
            className="flex items-center justify-between gap-3"
          >
            <label
              htmlFor={channel.id}
              className="flex-1 cursor-pointer text-sm"
            >
              {channel.label}
            </label>
            <Switch
              id={channel.id}
              checked={activeChannels.includes(channel.id)}
              onCheckedChange={() => onToggle(channel.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
