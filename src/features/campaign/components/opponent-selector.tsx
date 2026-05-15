import { cn } from '@/lib/utils'
import { OPPONENTS } from '../data/channels'
import type { OpponentId } from '../types'

interface OpponentSelectorProps {
  selected: OpponentId
  onSelect: (opponentId: OpponentId) => void
}

export function OpponentSelector({
  selected,
  onSelect,
}: OpponentSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Perfil de Adversario Principal
      </label>

      <div className="space-y-2">
        {OPPONENTS.map((opponent) => (
          <button
            key={opponent.id}
            type="button"
            onClick={() => onSelect(opponent.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              selected === opponent.id
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted'
            )}
          >
            <div
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full border-2',
                selected === opponent.id
                  ? 'border-primary'
                  : 'border-muted-foreground/50'
              )}
            >
              {selected === opponent.id && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1">
              <span className="font-medium">{opponent.name}</span>
              <span className="ml-2 text-muted-foreground">
                - {opponent.partyAcronym}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
