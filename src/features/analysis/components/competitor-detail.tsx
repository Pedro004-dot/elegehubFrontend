import { CompetitorProfile } from './competitor-profile'
import { TerritorialMap } from './territorial-map'
import { StrengthsOpportunities } from './strengths-opportunities'
import { SpendingBreakdown } from './spending-breakdown'
import { SuggestedStrategies } from './suggested-strategies'
import type { Competitor } from '../types'

interface CompetitorDetailProps {
  competitor: Competitor
}

export function CompetitorDetail({ competitor }: CompetitorDetailProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="lg:sticky lg:top-4 lg:h-fit">
        <CompetitorProfile competitor={competitor} />
      </div>

      <div className="space-y-6">
        <TerritorialMap
          territorialData={competitor.territorialPresence}
          competitorName={competitor.name}
        />

        <StrengthsOpportunities
          strengths={competitor.strengths}
          opportunities={competitor.opportunities}
        />

        <SpendingBreakdown
          spendingHistory={competitor.spendingHistory}
          totalSpending={competitor.lastElection.totalSpending}
        />

        <SuggestedStrategies
          strategies={competitor.suggestedStrategies}
          competitorName={competitor.name}
        />
      </div>
    </div>
  )
}
