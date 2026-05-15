import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface VideoCutsHeaderProps {
  period: string
  onPeriodChange: (period: string) => void
  onNewCut?: () => void
}

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Ultimos 7 dias' },
  { value: '30d', label: 'Ultimos 30 dias' },
  { value: 'month', label: 'Este mes' },
  { value: 'all', label: 'Todos' },
]

export function VideoCutsHeader({
  period,
  onPeriodChange,
  onNewCut,
}: VideoCutsHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cortes Gerados pela IA</h1>
        <p className="text-sm text-muted-foreground">
          Videos prontos para publicacao em redes sociais
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Select value={period} onValueChange={(v) => v && onPeriodChange(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Selecione o periodo" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onNewCut && (
          <Button onClick={onNewCut}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Corte
          </Button>
        )}
      </div>
    </div>
  )
}
