/**
 * @deprecated Esta pagina sera removida na v2.
 * O Radar de Adversarios usa dados mockados e foi removido do menu.
 * Usar dados reais da API /analytics/candidatos quando disponivel.
 */

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
