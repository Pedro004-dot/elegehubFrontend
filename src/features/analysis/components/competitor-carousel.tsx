import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { CompetitorCard } from './competitor-card'
import type { Competitor } from '../types'

interface CompetitorCarouselProps {
  competitors: Competitor[]
  selectedCompetitor: Competitor | null
  onSelectCompetitor: (competitor: Competitor) => void
}

export function CompetitorCarousel({
  competitors,
  selectedCompetitor,
  onSelectCompetitor,
}: CompetitorCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 220
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full shadow-md"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-6 py-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {competitors.map((competitor) => (
          <CompetitorCard
            key={competitor.id}
            competitor={competitor}
            isSelected={selectedCompetitor?.id === competitor.id}
            onSelect={onSelectCompetitor}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full shadow-md"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
