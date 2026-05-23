import { supabase } from '@/lib/supabase'
import { api } from '@/services/api'
import type { Campaign, CreateCampaignInput, InviteMemberInput, CampaignMember } from '../types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/**
 * Busca o usuario atual e suas campanhas do backend
 */
export async function fetchCurrentUser(): Promise<{
  id: string
  email: string
  campaigns: Array<{ id: string; role: string; name: string }>
}> {
  const { data } = await api.get<ApiResponse<{
    id: string
    email: string
    campaigns: Array<{ id: string; role: string; name: string }>
  }>>('/auth/me')
  return data.data
}

/**
 * Busca as campanhas do usuario com detalhes completos
 */
export async function fetchMyCampaigns(): Promise<Campaign[]> {
  const { data } = await api.get<ApiResponse<Campaign[]>>('/campaigns/me')
  return data.data
}

/**
 * Cria uma nova campanha
 */
export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const { data } = await api.post<ApiResponse<Campaign>>('/campaigns', input)
  return data.data
}

/**
 * Busca detalhes de uma campanha
 */
export async function fetchCampaign(campaignId: string): Promise<Campaign> {
  const { data } = await api.get<ApiResponse<Campaign>>(`/campaigns/${campaignId}`)
  return data.data
}

/**
 * Atualiza uma campanha
 */
export async function updateCampaign(
  campaignId: string,
  input: Partial<CreateCampaignInput>
): Promise<Campaign> {
  const { data } = await api.put<ApiResponse<Campaign>>(`/campaigns/${campaignId}`, input)
  return data.data
}

/**
 * Busca membros de uma campanha
 */
export async function fetchCampaignMembers(campaignId: string): Promise<CampaignMember[]> {
  const { data } = await api.get<ApiResponse<CampaignMember[]>>(
    `/campaigns/${campaignId}/members`
  )
  return data.data
}

/**
 * Convida um membro para a campanha
 */
export async function inviteMember(
  campaignId: string,
  input: InviteMemberInput
): Promise<CampaignMember> {
  const { data } = await api.post<ApiResponse<CampaignMember>>(
    `/campaigns/${campaignId}/members`,
    input
  )
  return data.data
}

/**
 * Atualiza o role de um membro
 */
export async function updateMemberRole(
  campaignId: string,
  memberId: string,
  role: 'admin' | 'editor' | 'viewer'
): Promise<CampaignMember> {
  const { data } = await api.put<ApiResponse<CampaignMember>>(
    `/campaigns/${campaignId}/members/${memberId}`,
    { role }
  )
  return data.data
}

/**
 * Remove um membro da campanha
 */
export async function removeMember(campaignId: string, memberId: string): Promise<void> {
  await api.delete(`/campaigns/${campaignId}/members/${memberId}`)
}

/**
 * Login com email e senha
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Cadastro com email e senha
 */
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Login com Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Logout
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Obtem a sessao atual
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return data.session
}

/**
 * Obtem o usuario atual
 */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return data.user
}
