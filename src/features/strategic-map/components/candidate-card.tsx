import { useState } from 'react'
import { User, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CandidatoResumo } from '../services/analytics'
import { getCandidatoFotoUrl } from '../services/analytics'

interface CandidateCardProps {
  candidato: CandidatoResumo
  isSelected?: boolean
  onSelect?: (candidato: CandidatoResumo) => void
  compact?: boolean
}

const ESPECTRO_COLORS: Record<string, string> = {
  esquerda: '#dc2626',
  'centro-esquerda': '#f97316',
  centro: '#a855f7',
  'centro-direita': '#3b82f6',
  direita: '#16a34a',
}

export function CandidateCard({
  candidato,
  isSelected = false,
  onSelect,
  compact = false,
}: CandidateCardProps) {
  const [imageError, setImageError] = useState(false)
  const fotoUrl = getCandidatoFotoUrl(candidato.sq_candidato)

  const espectroColor = candidato.espectro
    ? ESPECTRO_COLORS[candidato.espectro] || '#6b7280'
    : '#6b7280'

  const formatVotes = (votes: number) => {
    if (votes >= 1000000) return `${(votes / 1000000).toFixed(1)}M`
    if (votes >= 1000) return `${(votes / 1000).toFixed(1)}K`
    return votes.toString()
  }

  if (compact) {
    return (
      <button
        onClick={() => onSelect?.(candidato)}
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg border transition-all w-full text-left',
          'hover:bg-accent hover:border-primary/30',
          isSelected && 'bg-primary/10 border-primary ring-2 ring-primary/20'
        )}
      >
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {!imageError ? (
            <img
              src={fotoUrl}
              alt={candidato.nome_urna}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          {isSelected && (
            <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
              <Check className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{candidato.nome_urna}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="px-1.5 py-0.5 rounded text-white font-medium"
              style={{ backgroundColor: espectroColor }}
            >
              {candidato.partido_sigla || 'S/P'}
            </span>
            <span>{formatVotes(candidato.total_votos)} votos</span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onSelect?.(candidato)}
      className={cn(
        'flex flex-col items-center gap-3 p-4 rounded-xl border transition-all',
        'hover:bg-accent hover:border-primary/30 hover:shadow-md',
        isSelected && 'bg-primary/10 border-primary ring-2 ring-primary/20'
      )}
    >
      <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted">
        {!imageError ? (
          <img
            src={fotoUrl}
            alt={candidato.nome_urna}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
            <Check className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="font-semibold text-sm">{candidato.nome_urna}</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span
            className="px-2 py-0.5 rounded text-white text-xs font-medium"
            style={{ backgroundColor: espectroColor }}
          >
            {candidato.partido_sigla || 'S/P'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatVotes(candidato.total_votos)} votos
        </p>
        {candidato.espectro && (
          <p className="text-xs text-muted-foreground capitalize">
            {candidato.espectro}
          </p>
        )}
      </div>
    </button>
  )
}
