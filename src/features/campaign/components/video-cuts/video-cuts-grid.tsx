import type { VideoCut } from '../../types/video-cuts'
import { VideoCutCard } from './video-cut-card'

interface VideoCutsGridProps {
  cuts: VideoCut[]
  onSelectCut: (cut: VideoCut) => void
  onPublish: (cut: VideoCut) => void
  onApprove: (cut: VideoCut) => void
  onRestore?: (cut: VideoCut) => void
}

export function VideoCutsGrid({
  cuts,
  onSelectCut,
  onPublish,
  onApprove,
  onRestore,
}: VideoCutsGridProps) {
  if (cuts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-3">🎬</div>
          <p className="text-lg font-medium">Nenhum corte encontrado</p>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou aguarde novos cortes serem processados
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cuts.map((cut) => (
        <VideoCutCard
          key={cut.id}
          cut={cut}
          onSelect={onSelectCut}
          onPublish={onPublish}
          onApprove={onApprove}
          onRestore={onRestore}
        />
      ))}
    </div>
  )
}
