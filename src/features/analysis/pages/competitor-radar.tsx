import { CompetitorHeader } from '../components/competitor-header'
import { CompetitorCarousel } from '../components/competitor-carousel'
import { CompetitorDetail } from '../components/competitor-detail'
import { useCompetitors } from '../hooks/use-competitors'

export function CompetitorRadarPage() {
  const { competitors, selectedCompetitor, selectCompetitor } = useCompetitors()

  return (
    <div className="space-y-6 p-6">
      <CompetitorHeader />

      <CompetitorCarousel
        competitors={competitors}
        selectedCompetitor={selectedCompetitor}
        onSelectCompetitor={selectCompetitor}
      />

      {selectedCompetitor && (
        <CompetitorDetail competitor={selectedCompetitor} />
      )}
    </div>
  )
}
