import type { User, Session } from '@supabase/supabase-js'

export interface Campaign {
  id: string
  name: string
  candidate_name: string
  position: string
  state: string
  year: number
  owner_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  userRole?: 'owner' | 'admin' | 'editor' | 'viewer'
}

export interface CampaignMember {
  id: string
  campaign_id: string
  user_id: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  created_at: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  campaigns: Campaign[]
  currentCampaign: Campaign | null
  isLoading: boolean
  isLoadingCampaigns: boolean
  isAuthenticated: boolean
}

export interface CreateCampaignInput {
  name: string
  candidateName: string
  position: string
  state: string
  year?: number
}

export interface InviteMemberInput {
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

export type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  switchCampaign: (campaignId: string) => void
  createCampaign: (input: CreateCampaignInput) => Promise<Campaign>
  refreshCampaigns: () => Promise<void>
}
