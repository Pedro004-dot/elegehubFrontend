import { useAuthContext } from '@/app/providers/AuthProvider'
import type { Campaign } from '../types'

/**
 * Hook para acessar a campanha atual.
 * Lanca erro se nenhuma campanha estiver selecionada.
 */
export function useCurrentCampaign(): Campaign {
  const { currentCampaign } = useAuthContext()

  if (!currentCampaign) {
    throw new Error('Nenhuma campanha selecionada. O usuario precisa criar ou selecionar uma campanha.')
  }

  return currentCampaign
}

/**
 * Hook para acessar a campanha atual de forma segura.
 * Retorna null se nenhuma campanha estiver selecionada.
 */
export function useCurrentCampaignSafe(): Campaign | null {
  const { currentCampaign } = useAuthContext()
  return currentCampaign
}
