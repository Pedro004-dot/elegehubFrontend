import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle as signInWithGoogleService,
  signOut as signOutService,
  fetchMyCampaigns,
  createCampaign as createCampaignService,
} from '@/features/auth/services/authService'
import type { Campaign, CreateCampaignInput, AuthContextValue } from '@/features/auth/types'

const CURRENT_CAMPAIGN_KEY = 'elegehub_current_campaign_id'

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)

  const isAuthenticated = !!user && !!session

  // Carrega campanhas do usuario
  const loadCampaigns = useCallback(async () => {
    if (!session) {
      setCampaigns([])
      setCurrentCampaign(null)
      setIsLoadingCampaigns(false)
      return
    }

    setIsLoadingCampaigns(true)
    try {
      const userCampaigns = await fetchMyCampaigns()
      setCampaigns(userCampaigns)

      // Restaura campanha selecionada do localStorage ou usa a primeira
      const savedCampaignId = localStorage.getItem(CURRENT_CAMPAIGN_KEY)
      const savedCampaign = userCampaigns.find((c) => c.id === savedCampaignId)

      if (savedCampaign) {
        setCurrentCampaign(savedCampaign)
      } else if (userCampaigns.length > 0) {
        const firstCampaign = userCampaigns[0]
        if (firstCampaign) {
          setCurrentCampaign(firstCampaign)
          localStorage.setItem(CURRENT_CAMPAIGN_KEY, firstCampaign.id)
        }
      } else {
        setCurrentCampaign(null)
        localStorage.removeItem(CURRENT_CAMPAIGN_KEY)
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error)
      setCampaigns([])
      setCurrentCampaign(null)
    } finally {
      setIsLoadingCampaigns(false)
    }
  }, [session])

  // Inicializa auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Escuta mudancas de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (event === 'SIGNED_OUT') {
          setCampaigns([])
          setCurrentCampaign(null)
          localStorage.removeItem(CURRENT_CAMPAIGN_KEY)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Carrega campanhas quando session muda
  useEffect(() => {
    if (session && !isLoading) {
      loadCampaigns()
    }
  }, [session, isLoading, loadCampaigns])

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await signInWithEmail(email, password)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await signUpWithEmail(email, password)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await signInWithGoogleService()
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await signOutService()
      setCampaigns([])
      setCurrentCampaign(null)
      localStorage.removeItem(CURRENT_CAMPAIGN_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const switchCampaign = useCallback((campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (campaign) {
      setCurrentCampaign(campaign)
      localStorage.setItem(CURRENT_CAMPAIGN_KEY, campaignId)
    }
  }, [campaigns])

  const createCampaign = useCallback(async (input: CreateCampaignInput): Promise<Campaign> => {
    const newCampaign = await createCampaignService(input)
    setCampaigns((prev) => [newCampaign, ...prev])
    setCurrentCampaign(newCampaign)
    localStorage.setItem(CURRENT_CAMPAIGN_KEY, newCampaign.id)
    return newCampaign
  }, [])

  const refreshCampaigns = useCallback(async () => {
    await loadCampaigns()
  }, [loadCampaigns])

  const value: AuthContextValue = {
    user,
    session,
    campaigns,
    currentCampaign,
    isLoading,
    isLoadingCampaigns,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    switchCampaign,
    createCampaign,
    refreshCampaigns,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
