import { useState, useMemo, useCallback } from 'react'
import type { VideoCut, VideoCutStatus, VideoCutsKpis } from '../types/video-cuts'
import { MOCK_VIDEO_CUTS, calculateKpis } from '../data/mock-video-cuts'

export interface UseVideoCutsReturn {
  cuts: VideoCut[]
  allCuts: VideoCut[]
  kpis: VideoCutsKpis
  selectedCut: VideoCut | null
  setSelectedCut: (cut: VideoCut | null) => void
  activeFilters: VideoCutStatus[]
  setActiveFilters: (filters: VideoCutStatus[]) => void
  period: string
  setPeriod: (period: string) => void
  approveCut: (cut: VideoCut) => void
  publishCut: (cut: VideoCut) => void
  archiveCut: (cut: VideoCut) => void
  restoreCut: (cut: VideoCut) => void
  updateCaption: (cut: VideoCut, caption: string) => void
}

export function useVideoCuts(): UseVideoCutsReturn {
  const [allCuts, setAllCuts] = useState<VideoCut[]>(MOCK_VIDEO_CUTS)
  const [selectedCut, setSelectedCut] = useState<VideoCut | null>(null)
  const [activeFilters, setActiveFilters] = useState<VideoCutStatus[]>(['ready', 'review'])
  const [period, setPeriod] = useState('7d')

  // KPIs computados a partir de todos os cortes
  const kpis = useMemo(() => calculateKpis(allCuts), [allCuts])

  // Cortes filtrados por status
  const cuts = useMemo(() => {
    if (activeFilters.length === 0) {
      return allCuts
    }
    return allCuts.filter((cut) => activeFilters.includes(cut.status))
  }, [allCuts, activeFilters])

  // Aprovar corte (review -> ready)
  const approveCut = useCallback((cut: VideoCut) => {
    setAllCuts((prev) =>
      prev.map((c) => (c.id === cut.id ? { ...c, status: 'ready' as VideoCutStatus } : c))
    )
    // Atualizar selectedCut se for o mesmo
    setSelectedCut((prev) =>
      prev?.id === cut.id ? { ...prev, status: 'ready' as VideoCutStatus } : prev
    )
  }, [])

  // Publicar corte (ready -> published)
  const publishCut = useCallback((cut: VideoCut) => {
    const now = new Date()
    setAllCuts((prev) =>
      prev.map((c) =>
        c.id === cut.id ? { ...c, status: 'published' as VideoCutStatus, publishedAt: now } : c
      )
    )
    setSelectedCut((prev) =>
      prev?.id === cut.id
        ? { ...prev, status: 'published' as VideoCutStatus, publishedAt: now }
        : prev
    )
  }, [])

  // Arquivar corte
  const archiveCut = useCallback((cut: VideoCut) => {
    setAllCuts((prev) =>
      prev.map((c) => (c.id === cut.id ? { ...c, status: 'archived' as VideoCutStatus } : c))
    )
    setSelectedCut((prev) =>
      prev?.id === cut.id ? { ...prev, status: 'archived' as VideoCutStatus } : prev
    )
  }, [])

  // Restaurar corte arquivado (archived -> ready)
  const restoreCut = useCallback((cut: VideoCut) => {
    setAllCuts((prev) =>
      prev.map((c) => (c.id === cut.id ? { ...c, status: 'ready' as VideoCutStatus } : c))
    )
    setSelectedCut((prev) =>
      prev?.id === cut.id ? { ...prev, status: 'ready' as VideoCutStatus } : prev
    )
  }, [])

  // Atualizar legenda sugerida
  const updateCaption = useCallback((cut: VideoCut, caption: string) => {
    setAllCuts((prev) =>
      prev.map((c) => (c.id === cut.id ? { ...c, suggestedCaption: caption } : c))
    )
    setSelectedCut((prev) =>
      prev?.id === cut.id ? { ...prev, suggestedCaption: caption } : prev
    )
  }, [])

  return {
    cuts,
    allCuts,
    kpis,
    selectedCut,
    setSelectedCut,
    activeFilters,
    setActiveFilters,
    period,
    setPeriod,
    approveCut,
    publishCut,
    archiveCut,
    restoreCut,
    updateCaption,
  }
}
