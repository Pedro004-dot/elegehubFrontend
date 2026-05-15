import { useState, useCallback } from 'react'
import type { Competitor } from '../types'
import { MOCK_COMPETITORS } from '../data/mock-competitors'

export function useCompetitors() {
  const [competitors] = useState<Competitor[]>(MOCK_COMPETITORS)
  const [selectedCompetitor, setSelectedCompetitor] =
    useState<Competitor | null>(MOCK_COMPETITORS[0] || null)

  const selectCompetitor = useCallback((competitor: Competitor) => {
    setSelectedCompetitor(competitor)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedCompetitor(null)
  }, [])

  return {
    competitors,
    selectedCompetitor,
    selectCompetitor,
    clearSelection,
  }
}
