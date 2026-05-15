import { useState } from 'react'
import { useVideoCuts } from '../hooks/use-video-cuts'
import { VideoCutsHeader } from '../components/video-cuts/video-cuts-header'
import { VideoCutsKpiBar } from '../components/video-cuts/video-cuts-kpi-bar'
import { VideoCutsFilters } from '../components/video-cuts/video-cuts-filters'
import { VideoCutsGrid } from '../components/video-cuts/video-cuts-grid'
import { VideoCutDetailDrawer } from '../components/video-cuts/video-cut-detail-drawer'
import { PublishModal } from '../components/video-cuts/publish-modal'
import type { VideoCut } from '../types/video-cuts'

export function VideoCutsPage() {
  const {
    cuts,
    kpis,
    selectedCut,
    setSelectedCut,
    activeFilters,
    setActiveFilters,
    period,
    setPeriod,
    approveCut,
    publishCut,
    restoreCut,
    updateCaption,
  } = useVideoCuts()

  // Estado para o modal de publicação
  const [cutToPublish, setCutToPublish] = useState<VideoCut | null>(null)

  const handlePublishClick = (cut: VideoCut) => {
    setCutToPublish(cut)
  }

  const handlePublishSuccess = () => {
    if (cutToPublish) {
      // Atualiza o status local do corte para 'published'
      publishCut(cutToPublish)
    }
    setCutToPublish(null)
    setSelectedCut(null)
  }

  const handleNewCut = () => {
    // TODO: Implementar modal de upload ou redirect para backoffice
    console.log('New cut clicked')
  }

  const handleDownload = (cut: typeof selectedCut) => {
    if (!cut) return
    // TODO: Implementar download do video
    console.log('Download cut:', cut.id)
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4 sm:p-6">
      {/* Header */}
      <VideoCutsHeader
        period={period}
        onPeriodChange={setPeriod}
        onNewCut={handleNewCut}
      />

      {/* KPI Bar */}
      <VideoCutsKpiBar kpis={kpis} />

      {/* Main content: Filters + Grid */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Filters sidebar - hidden on mobile */}
        <div className="hidden w-[200px] shrink-0 lg:block">
          <VideoCutsFilters
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          <VideoCutsGrid
            cuts={cuts}
            onSelectCut={setSelectedCut}
            onPublish={handlePublishClick}
            onApprove={approveCut}
            onRestore={restoreCut}
          />
        </div>
      </div>

      {/* Detail Drawer */}
      <VideoCutDetailDrawer
        cut={selectedCut}
        onClose={() => setSelectedCut(null)}
        onPublish={handlePublishClick}
        onApprove={approveCut}
        onDownload={handleDownload}
        onEditCaption={updateCaption}
      />

      {/* Modal de Publicação */}
      {cutToPublish && (
        <PublishModal
          cut={cutToPublish}
          open={!!cutToPublish}
          onClose={() => setCutToPublish(null)}
          onSuccess={handlePublishSuccess}
        />
      )}
    </div>
  )
}
