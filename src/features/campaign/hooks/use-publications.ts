import { useState, useCallback } from 'react'
import { publicationsService } from '../services/publications'
import type {
  SchedulePublicationInput,
  PublishNowInput,
  PublishResult,
  ScheduledPost,
} from '../services/publications'

interface UsePublicationsOptions {
  campaignId: string
}

export function usePublications({ campaignId }: UsePublicationsOptions) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false)

  const schedulePublication = useCallback(
    async (input: Omit<SchedulePublicationInput, 'campaignId'>) => {
      setIsPublishing(true)
      try {
        const result = await publicationsService.schedule(campaignId, input)
        return result
      } finally {
        setIsPublishing(false)
      }
    },
    [campaignId]
  )

  const publishNow = useCallback(
    async (input: Omit<PublishNowInput, 'campaignId'>): Promise<{
      results: PublishResult[]
      allSucceeded: boolean
    }> => {
      setIsPublishing(true)
      try {
        const result = await publicationsService.publishNow(campaignId, input)
        return result
      } finally {
        setIsPublishing(false)
      }
    },
    [campaignId]
  )

  const fetchScheduledPosts = useCallback(
    async (options?: {
      status?: string[]
      platform?: string
      page?: number
      perPage?: number
    }) => {
      setIsLoadingScheduled(true)
      try {
        const result = await publicationsService.listScheduled(campaignId, options)
        setScheduledPosts(result.data)
        return result
      } finally {
        setIsLoadingScheduled(false)
      }
    },
    [campaignId]
  )

  const cancelScheduledPost = useCallback(
    async (postId: string) => {
      await publicationsService.cancel(campaignId, postId)
      setScheduledPosts(prev => prev.filter(p => p.id !== postId))
    },
    [campaignId]
  )

  return {
    isPublishing,
    scheduledPosts,
    isLoadingScheduled,
    schedulePublication,
    publishNow,
    fetchScheduledPosts,
    cancelScheduledPost,
  }
}
