import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import * as api from '../services/onboarding-api'
import type {
  OnboardingStatus,
  OnboardingStep,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
  Step7Data,
} from '../types'

interface UseOnboardingWizardReturn {
  // State
  currentStep: OnboardingStep
  status: OnboardingStatus | null
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Navigation
  goToStep: (step: OnboardingStep) => void
  goNext: () => void
  goPrevious: () => void

  // Data operations
  loadStatus: () => Promise<void>
  saveStep1: (data: Step1Data) => Promise<boolean>
  saveStep2: (data: Step2Data) => Promise<boolean>
  saveStep3: (data: Step3Data) => Promise<boolean>
  saveStep4: (data: Step4Data) => Promise<boolean>
  saveStep5: (data: Step5Data) => Promise<boolean>
  saveStep6: (data: Step6Data) => Promise<boolean>
  saveStep7: (data: Step7Data) => Promise<{ jobId?: string }>

  // Helpers
  canGoNext: boolean
  canGoPrevious: boolean
  isStepComplete: (step: OnboardingStep) => boolean
}

export function useOnboardingWizard(): UseOnboardingWizardReturn {
  const { currentCampaign } = useAuth()
  const campaignId = currentCampaign?.id || ''

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial status
  const loadStatus = useCallback(async () => {
    if (!campaignId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await api.getOnboardingStatus(campaignId)
      setStatus(data)

      // Se onboarding completo, vai para step 7 (ou tela final)
      if (data.completedAt) {
        setCurrentStep(7)
      } else if (data.currentStep > 0) {
        // Continua do step salvo
        setCurrentStep(Math.min(data.currentStep + 1, 7) as OnboardingStep)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar status')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  // Navigation
  const goToStep = useCallback((step: OnboardingStep) => {
    if (step >= 1 && step <= 7) {
      setCurrentStep(step)
      setError(null)
    }
  }, [])

  const goNext = useCallback(() => {
    if (currentStep < 7) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep)
      setError(null)
    }
  }, [currentStep])

  const goPrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep)
      setError(null)
    }
  }, [currentStep])

  // Save handlers
  const saveStep1 = useCallback(async (data: Step1Data): Promise<boolean> => {
    if (!campaignId) return false

    setIsSaving(true)
    setError(null)

    try {
      await api.saveStep1(campaignId, data)
      await loadStatus() // Reload status after save
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [campaignId, loadStatus])

  const saveStep2 = useCallback(async (data: Step2Data): Promise<boolean> => {
    if (!campaignId) return false

    setIsSaving(true)
    setError(null)

    try {
      await api.saveStep2(campaignId, data)
      await loadStatus()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [campaignId, loadStatus])

  const saveStep3 = useCallback(async (data: Step3Data): Promise<boolean> => {
    if (!campaignId) return false

    setIsSaving(true)
    setError(null)

    try {
      await api.saveStep3(campaignId, data)
      await loadStatus()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [campaignId, loadStatus])

  const saveStep4 = useCallback(async (data: Step4Data): Promise<boolean> => {
    if (!campaignId) return false

    setIsSaving(true)
    setError(null)

    try {
      await api.saveStep4(campaignId, data)
      await loadStatus()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [campaignId, loadStatus])

  const saveStep5 = useCallback(async (data: Step5Data): Promise<boolean> => {
    if (!campaignId) return false

    setIsSaving(true)
    setError(null)

    try {
      await api.saveStep5(campaignId, data)
      await loadStatus()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [campaignId, loadStatus])

  const saveStep6 = useCallback(async (data: Step6Data): Promise<boolean> => {
    if (!campaignId) return false

    setIsSaving(true)
    setError(null)

    try {
      await api.saveStep6(campaignId, data)
      await loadStatus()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [campaignId, loadStatus])

  const saveStep7 = useCallback(async (data: Step7Data): Promise<{ jobId?: string }> => {
    if (!campaignId) return {}

    setIsSaving(true)
    setError(null)

    try {
      const result = await api.saveStep7(campaignId, data)
      await loadStatus()
      return { jobId: result.enrichmentJobId }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      return {}
    } finally {
      setIsSaving(false)
    }
  }, [campaignId, loadStatus])

  // Helpers
  const isStepComplete = useCallback((step: OnboardingStep): boolean => {
    if (!status) return false
    return status.currentStep >= step
  }, [status])

  const canGoNext = currentStep < 7
  const canGoPrevious = currentStep > 1

  return {
    currentStep,
    status,
    isLoading,
    isSaving,
    error,
    goToStep,
    goNext,
    goPrevious,
    loadStatus,
    saveStep1,
    saveStep2,
    saveStep3,
    saveStep4,
    saveStep5,
    saveStep6,
    saveStep7,
    canGoNext,
    canGoPrevious,
    isStepComplete,
  }
}
