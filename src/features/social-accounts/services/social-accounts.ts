import { api } from '@/services/api'
import type { SocialAccount, SocialPlatform } from '../types'

export interface ListSocialAccountsResponse {
  success: boolean
  data: SocialAccount[]
}

export interface DisconnectAccountResponse {
  success: boolean
  message: string
}

export interface RefreshTokenResponse {
  success: boolean
  data: {
    id: string
    tokenExpiresAt: string
  }
}

export interface SelectPageResponse {
  success: boolean
  data: {
    id: string
    platform: SocialPlatform
    platformName: string
    pageName: string
  }
}

export const socialAccountsService = {
  // Listar contas conectadas
  async list(campaignId: string): Promise<SocialAccount[]> {
    const response = await api.get<ListSocialAccountsResponse>(
      `/social-accounts/campaign/${campaignId}`
    )
    return response.data.data.map(account => ({
      ...account,
      connectedAt: new Date(account.connectedAt),
      tokenExpiresAt: account.tokenExpiresAt ? new Date(account.tokenExpiresAt) : undefined,
    }))
  },

  // Iniciar OAuth - redireciona para a plataforma
  initiateOAuth(platform: SocialPlatform, campaignId: string, returnUrl?: string): void {
    const baseUrl = import.meta.env.VITE_API_URL
    const params = new URLSearchParams({
      campaignId,
      ...(returnUrl && { returnUrl }),
    })
    window.location.href = `${baseUrl}/social/auth/${platform}?${params.toString()}`
  },

  // Selecionar página após OAuth
  async selectPage(
    code: string,
    platform: SocialPlatform,
    pageId: string,
    campaignId: string
  ): Promise<SelectPageResponse['data']> {
    const response = await api.post<SelectPageResponse>('/social/auth/select-page', {
      code,
      platform,
      pageId,
      campaignId,
    })
    return response.data.data
  },

  // Desconectar conta
  async disconnect(accountId: string, revokeAccess = false): Promise<void> {
    await api.delete<DisconnectAccountResponse>(`/social-accounts/${accountId}`, {
      data: { revokeAccess },
    })
  },

  // Renovar token
  async refreshToken(accountId: string): Promise<Date | undefined> {
    const response = await api.post<RefreshTokenResponse>(
      `/social-accounts/${accountId}/refresh`
    )
    return response.data.data.tokenExpiresAt
      ? new Date(response.data.data.tokenExpiresAt)
      : undefined
  },
}
