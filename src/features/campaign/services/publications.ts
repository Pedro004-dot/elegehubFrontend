import { api } from '@/services/api'

export interface SchedulePublicationInput {
  videoCutId: string
  socialAccountIds: string[]
  caption?: string
  hashtags?: string[]
  scheduledFor: string
}

export interface PublishNowInput {
  videoCutId: string
  socialAccountIds: string[]
  caption?: string
  hashtags?: string[]
}

export interface PublishResult {
  accountId: string
  platform: string
  success: boolean
  postId?: string
  postUrl?: string
  error?: string
}

export interface ScheduledPost {
  id: string
  videoCutId: string
  socialAccountId: string
  platform: string
  caption?: string
  hashtags?: string[]
  scheduledFor: Date
  status: 'pending' | 'processing' | 'published' | 'failed' | 'cancelled'
  platformPostId?: string
  platformPostUrl?: string
  errorMessage?: string
  retryCount: number
  publishedAt?: Date
  createdAt: Date
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export const publicationsService = {
  // Agendar publicação
  async schedule(campaignId: string, input: SchedulePublicationInput): Promise<{
    id: string
    platform: string
    scheduledFor: Date
    status: string
  }[]> {
    const response = await api.post(
      `/publications/campaign/${campaignId}/schedule`,
      input
    )
    return response.data.data.map((post: any) => ({
      ...post,
      scheduledFor: new Date(post.scheduledFor),
    }))
  },

  // Publicar imediatamente
  async publishNow(campaignId: string, input: PublishNowInput): Promise<{
    results: PublishResult[]
    allSucceeded: boolean
  }> {
    const response = await api.post(
      `/publications/campaign/${campaignId}/publish-now`,
      input
    )
    return response.data.data
  },

  // Listar publicações agendadas
  async listScheduled(
    campaignId: string,
    options?: {
      status?: string[]
      platform?: string
      page?: number
      perPage?: number
    }
  ): Promise<{
    data: ScheduledPost[]
    meta: {
      page: number
      perPage: number
      total: number
      totalPages: number
    }
  }> {
    const params = new URLSearchParams()

    if (options?.status) {
      options.status.forEach(s => params.append('status', s))
    }
    if (options?.platform) {
      params.append('platform', options.platform)
    }
    if (options?.page) {
      params.append('page', options.page.toString())
    }
    if (options?.perPage) {
      params.append('perPage', options.perPage.toString())
    }

    const response = await api.get<PaginatedResponse<ScheduledPost>>(
      `/publications/campaign/${campaignId}/scheduled?${params.toString()}`
    )

    return {
      data: response.data.data.map(post => ({
        ...post,
        scheduledFor: new Date(post.scheduledFor),
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
        createdAt: new Date(post.createdAt),
      })),
      meta: response.data.meta,
    }
  },

  // Cancelar publicação agendada
  async cancel(campaignId: string, postId: string): Promise<void> {
    await api.delete(`/publications/campaign/${campaignId}/scheduled/${postId}`)
  },
}
