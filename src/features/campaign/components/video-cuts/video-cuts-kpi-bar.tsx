import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Video, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import type { VideoCutsKpis } from '../../types/video-cuts'
import { formatTotalDuration } from '../../types/video-cuts'

interface VideoCutsKpiBarProps {
  kpis: VideoCutsKpis
}

interface KpiCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  color?: string
  bgColor?: string
}

function KpiCard({ icon, value, label, color, bgColor }: KpiCardProps) {
  return (
    <Card className="flex-1 min-w-[140px]">
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            bgColor || 'bg-primary/10'
          )}
        >
          <span className={color || 'text-primary'}>{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function VideoCutsKpiBar({ kpis }: VideoCutsKpiBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <KpiCard
        icon={<Video className="h-5 w-5" />}
        value={kpis.totalCuts}
        label="cortes esta semana"
        color="text-blue-500"
        bgColor="bg-blue-500/10"
      />

      <KpiCard
        icon={<Clock className="h-5 w-5" />}
        value={formatTotalDuration(kpis.totalDuration)}
        label="processados"
        color="text-purple-500"
        bgColor="bg-purple-500/10"
      />

      <KpiCard
        icon={<CheckCircle className="h-5 w-5" />}
        value={kpis.publishedCount}
        label="ja publicados"
        color="text-green-500"
        bgColor="bg-green-500/10"
      />

      <KpiCard
        icon={<AlertCircle className="h-5 w-5" />}
        value={kpis.reviewCount}
        label="em revisao"
        color="text-yellow-500"
        bgColor="bg-yellow-500/10"
      />
    </div>
  )
}
