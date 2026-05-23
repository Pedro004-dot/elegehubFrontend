import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { OnboardingStep } from '../types'
import { STEP_LABELS } from '../types'

interface StepIndicatorProps {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  onStepClick?: (step: OnboardingStep) => void
}

export function StepIndicator({ currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  const steps = [1, 2, 3, 4, 5, 6, 7] as OnboardingStep[]

  return (
    <div className="w-full">
      {/* Mobile: Simple text indicator */}
      <div className="mb-4 text-center text-sm text-muted-foreground md:hidden">
        Etapa {currentStep} de 7: {STEP_LABELS[currentStep]}
      </div>

      {/* Desktop: Full step indicator */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step)
            const isCurrent = step === currentStep
            const isClickable = isCompleted || step <= Math.max(...completedSteps, 0) + 1

            return (
              <div key={step} className="flex flex-1 items-center">
                {/* Step circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && !isCompleted && 'border-primary bg-background text-primary',
                    !isCurrent && !isCompleted && 'border-muted-foreground/30 bg-background text-muted-foreground',
                    isClickable && 'cursor-pointer hover:border-primary/70',
                    !isClickable && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step}
                </button>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2',
                      completedSteps.includes((step + 1) as OnboardingStep)
                        ? 'bg-primary'
                        : 'bg-muted-foreground/20'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Step labels */}
        <div className="mt-2 flex justify-between">
          {steps.map((step) => (
            <div
              key={step}
              className={cn(
                'flex-1 text-center text-xs',
                step === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground'
              )}
            >
              {STEP_LABELS[step]}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar (mobile) */}
      <div className="md:hidden">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
