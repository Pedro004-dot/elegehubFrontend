import { Card } from '@/components/ui/card'
import { StepIndicator } from './StepIndicator'
import { STEP_DESCRIPTIONS } from '../types'
import type { OnboardingStep } from '../types'

interface WizardContainerProps {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  onStepClick?: (step: OnboardingStep) => void
  children: React.ReactNode
}

export function WizardContainer({
  currentStep,
  completedSteps,
  onStepClick,
  children,
}: WizardContainerProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Configuracao da Campanha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete as etapas para gerar seu diagnostico personalizado
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mx-auto mb-6 w-full max-w-4xl">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={onStepClick}
        />
      </div>

      {/* Step Description */}
      <div className="mx-auto mb-4 w-full max-w-2xl text-center">
        <p className="text-muted-foreground">{STEP_DESCRIPTIONS[currentStep]}</p>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl flex-1">
        <Card className="flex flex-col overflow-hidden">
          {children}
        </Card>
      </div>
    </div>
  )
}
