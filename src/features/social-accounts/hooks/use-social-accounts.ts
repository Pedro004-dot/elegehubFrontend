import { useState, useEffect, useCallback } from 'react'
import type { SocialAccount, SocialPlatform } from '../types'
import { socialAccountsService } from '../services/social-accounts'

interface UseSocialAccountsOptions {
  campaignId: string
}

export function useSocialAccounts({ campaignId }: UseSocialAccountsOptions) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    if (!campaignId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await socialAccountsService.list(campaignId)
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contas')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const connectAccount = useCallback((platform: SocialPlatform) => {
    socialAccountsService.initiateOAuth(platform, campaignId)
  }, [campaignId])

  const disconnectAccount = useCallback(async (accountId: string, revokeAccess = false) => {
    try {
      await socialAccountsService.disconnect(accountId, revokeAccess)
      setAccounts(prev => prev.filter(a => a.id !== accountId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desconectar conta')
      throw err
    }
  }, [])

  const refreshToken = useCallback(async (accountId: string) => {
    try {
      const newExpiresAt = await socialAccountsService.refreshToken(accountId)
      setAccounts(prev =>
        prev.map(a =>
          a.id === accountId
            ? { ...a, tokenExpiresAt: newExpiresAt, isTokenExpiring: false }
            : a
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao renovar token')
      throw err
    }
  }, [])

  const getAccountsByPlatform = useCallback((platform: SocialPlatform) => {
    return accounts.filter(a => a.platform === platform && a.isActive)
  }, [accounts])

  const hasAccountForPlatform = useCallback((platform: SocialPlatform) => {
    return accounts.some(a => a.platform === platform && a.isActive)
  }, [accounts])

  return {
    accounts,
    isLoading,
    error,
    refetch: fetchAccounts,
    connectAccount,
    disconnectAccount,
    refreshToken,
    getAccountsByPlatform,
    hasAccountForPlatform,
  }
}
