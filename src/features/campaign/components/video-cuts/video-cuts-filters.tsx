import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { VideoCutStatus } from '../../types/video-cuts'
import { VIDEO_CUT_STATUS_CONFIG } from '../../types/video-cuts'

interface VideoCutsFiltersProps {
  activeFilters: VideoCutStatus[]
  onFilterChange: (filters: VideoCutStatus[]) => void
}

const FILTER_OPTIONS: VideoCutStatus[] = ['ready', 'review', 'published', 'archived']

export function VideoCutsFilters({
  activeFilters,
  onFilterChange,
}: VideoCutsFiltersProps) {
  const toggleFilter = (status: VideoCutStatus) => {
    if (activeFilters.includes(status)) {
      onFilterChange(activeFilters.filter((f) => f !== status))
    } else {
      onFilterChange([...activeFilters, status])
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Filtrar por status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {FILTER_OPTIONS.map((status) => {
          const config = VIDEO_CUT_STATUS_CONFIG[status]
          const isActive = activeFilters.includes(status)

          return (
            <label
              key={status}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
                  isActive
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'
                )}
                onClick={() => toggleFilter(status)}
              >
                {isActive && (
                  <svg
                    className="h-3 w-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />

              <span
                className={cn(
                  'text-sm transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {config.label}
              </span>
            </label>
          )
        })}

        {activeFilters.length > 0 && (
          <button
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onFilterChange([])}
          >
            Limpar filtros
          </button>
        )}
      </CardContent>
    </Card>
  )
}
