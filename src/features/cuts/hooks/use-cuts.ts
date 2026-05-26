import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import { useCurrentCampaignSafe } from '@/features/auth/hooks/useCurrentCampaign'
import type { VideoCut, CutsResponse } from '../types'

interface UseCutsOptions {
  page?: number
  perPage?: number
  status?: string
  tags?: string[]
  autoFetch?: boolean
}

interface UseCutsReturn {
  data: VideoCut[]
  total: number
  totalPages: number
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Mock data para desenvolvimento/demonstracao
const MOCK_CUTS: VideoCut[] = [
  {
    id: '1',
    campaignId: 'mock-campaign',
    title: 'Compromisso com a Saude Publica',
    description: 'Fala sobre melhorias no atendimento do SUS e construcao de novas UBS',
    thumbnailUrl: undefined,
    videoUrl: undefined,
    duration: 47,
    format: '9:16',
    status: 'ready',
    tags: ['saude', 'campanha', 'sus'],
    suggestedCaption: 'A saude do nosso povo e prioridade! Vamos juntos construir um sistema de saude que funciona.',
    suggestedHashtags: ['#saude', '#sus', '#campanha2026', '#MG'],
    channelRecommendations: [
      { channel: 'instagram', label: 'Reels', adherence: 'high', adherencePercent: 94 },
      { channel: 'tiktok', label: 'TikTok', adherence: 'high', adherencePercent: 96 },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    campaignId: 'mock-campaign',
    title: 'Educacao de Qualidade para Todos',
    description: 'Proposta de investimento em escolas e valorizacao dos professores',
    thumbnailUrl: undefined,
    videoUrl: undefined,
    duration: 52,
    format: '9:16',
    status: 'ready',
    tags: ['educacao', 'campanha', 'professores'],
    suggestedCaption: 'Investir em educacao e investir no futuro! Nossas criancas merecem escolas de qualidade.',
    suggestedHashtags: ['#educacao', '#escola', '#professores', '#campanha2026'],
    channelRecommendations: [
      { channel: 'instagram', label: 'Reels', adherence: 'high', adherencePercent: 91 },
      { channel: 'facebook', label: 'Facebook', adherence: 'medium', adherencePercent: 78 },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    campaignId: 'mock-campaign',
    title: 'Geracao de Emprego e Renda',
    description: 'Plano de incentivo a pequenos negocios e geracao de emprego',
    thumbnailUrl: undefined,
    videoUrl: undefined,
    duration: 38,
    format: '16:9',
    status: 'ready',
    tags: ['emprego', 'economia', 'campanha'],
    suggestedCaption: 'Trabalho digno para quem quer trabalhar! Vamos gerar oportunidades em todo o estado.',
    suggestedHashtags: ['#emprego', '#trabalho', '#economia', '#MG'],
    channelRecommendations: [
      { channel: 'youtube', label: 'YouTube Shorts', adherence: 'high', adherencePercent: 88 },
      { channel: 'instagram', label: 'Reels', adherence: 'medium', adherencePercent: 75 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function useCuts(options: UseCutsOptions = {}): UseCutsReturn {
  const { page = 1, perPage = 12, status = 'ready', tags, autoFetch = true } = options
  const currentCampaign = useCurrentCampaignSafe()

  const [data, setData] = useState<VideoCut[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCuts = useCallback(async () => {
    if (!currentCampaign?.id) {
      setData(MOCK_CUTS)
      setTotal(MOCK_CUTS.length)
      setTotalPages(1)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        status,
      })
      if (tags?.length) params.set('tags', tags.join(','))

      const { data: response } = await api.get<CutsResponse>(`/cuts?${params}`, {
        headers: {
          'x-campaign-id': currentCampaign.id,
        },
      })
      setData(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err) {
      console.warn('Usando dados mock para cortes:', err)
      setError(err as Error)
      // Fallback para dados mock em desenvolvimento
      setData(MOCK_CUTS)
      setTotal(MOCK_CUTS.length)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [page, perPage, status, tags, currentCampaign?.id])

  useEffect(() => {
    if (autoFetch) {
      fetchCuts()
    }
  }, [autoFetch, fetchCuts])

  return { data, total, totalPages, isLoading, error, refetch: fetchCuts }
}
