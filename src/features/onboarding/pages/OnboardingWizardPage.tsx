import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardContainer } from '../components/WizardContainer'
import { Step1Identidade } from '../components/steps/Step1Identidade'
import { Step2Historico } from '../components/steps/Step2Historico'
import { Step3Perfil } from '../components/steps/Step3Perfil'
import { Step4Rede } from '../components/steps/Step4Rede'
import { Step5Recursos } from '../components/steps/Step5Recursos'
import { Step6Adversarios } from '../components/steps/Step6Adversarios'
import { Step7Objetivos } from '../components/steps/Step7Objetivos'
import { StepComplete } from '../components/steps/StepComplete'
import { useOnboardingWizard } from '../hooks/useOnboardingWizard'
import type { OnboardingStep } from '../types'
import { Loader2 } from 'lucide-react'

export function OnboardingWizardPage() {
  const navigate = useNavigate()
  const [showComplete, setShowComplete] = useState(false)
  const [enrichmentJobId, setEnrichmentJobId] = useState<string>()

  const {
    currentStep,
    status,
    isLoading,
    isSaving,
    goToStep,
    goNext,
    goPrevious,
    saveStep1,
    saveStep2,
    saveStep3,
    saveStep4,
    saveStep5,
    saveStep6,
    saveStep7,
    isStepComplete,
  } = useOnboardingWizard()

  const handleSaveAndExit = () => {
    navigate('/mapa/plano-acao')
  }

  const handleStep7Complete = async (data: Parameters<typeof saveStep7>[0]) => {
    const result = await saveStep7(data)
    if (result.jobId) {
      setEnrichmentJobId(result.jobId)
      setShowComplete(true)
    }
    return result
  }

  // Calculate completed steps for indicator
  const getCompletedSteps = (): OnboardingStep[] => {
    const completed: OnboardingStep[] = []
    for (let i = 1; i <= 7; i++) {
      if (isStepComplete(i as OnboardingStep)) {
        completed.push(i as OnboardingStep)
      }
    }
    return completed
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show completion screen after step 7
  if (showComplete || status?.completedAt) {
    return <StepComplete initialJobId={enrichmentJobId} />
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Identidade
            initialData={status || undefined}
            isSaving={isSaving}
            onSave={saveStep1}
            onNext={goNext}
            onSaveAndExit={handleSaveAndExit}
          />
        )
      case 2:
        return (
          <Step2Historico
            initialData={status || undefined}
            isSaving={isSaving}
            onSave={saveStep2}
            onNext={goNext}
            onBack={goPrevious}
            onSaveAndExit={handleSaveAndExit}
          />
        )
      case 3:
        return (
          <Step3Perfil
            initialData={status || undefined}
            isSaving={isSaving}
            onSave={saveStep3}
            onNext={goNext}
            onBack={goPrevious}
            onSaveAndExit={handleSaveAndExit}
          />
        )
      case 4:
        return (
          <Step4Rede
            initialData={status || undefined}
            isSaving={isSaving}
            onSave={saveStep4}
            onNext={goNext}
            onBack={goPrevious}
            onSaveAndExit={handleSaveAndExit}
          />
        )
      case 5:
        return (
          <Step5Recursos
            initialData={status || undefined}
            isSaving={isSaving}
            onSave={saveStep5}
            onNext={goNext}
            onBack={goPrevious}
            onSaveAndExit={handleSaveAndExit}
          />
        )
      case 6:
        return (
          <Step6Adversarios
            initialData={status || undefined}
            isSaving={isSaving}
            onSave={saveStep6}
            onNext={goNext}
            onBack={goPrevious}
            onSaveAndExit={handleSaveAndExit}
          />
        )
      case 7:
        return (
          <Step7Objetivos
            initialData={status || undefined}
            isSaving={isSaving}
            onSave={handleStep7Complete}
            onNext={() => setShowComplete(true)}
            onBack={goPrevious}
            onSaveAndExit={handleSaveAndExit}
          />
        )
      default:
        return null
    }
  }

  return (
    <WizardContainer
      currentStep={currentStep}
      completedSteps={getCompletedSteps()}
      onStepClick={goToStep}
    >
      {renderStep()}
    </WizardContainer>
  )
}
