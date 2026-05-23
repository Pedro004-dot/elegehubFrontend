import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react'

interface StepNavigationProps {
  currentStep: number
  isSaving: boolean
  canGoBack: boolean
  canGoForward: boolean
  onBack: () => void
  onNext: () => void
  onSaveAndExit?: () => void
  nextLabel?: string
  isLastStep?: boolean
}

export function StepNavigation({
  isSaving,
  canGoBack,
  canGoForward,
  onBack,
  onNext,
  onSaveAndExit,
  nextLabel,
  isLastStep = false,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t bg-background p-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={!canGoBack || isSaving}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>

        {onSaveAndExit && (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveAndExit}
            disabled={isSaving}
          >
            <Save className="mr-1 h-4 w-4" />
            Salvar e sair
          </Button>
        )}
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={!canGoForward || isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            {nextLabel || (isLastStep ? 'Concluir' : 'Proximo')}
            {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
          </>
        )}
      </Button>
    </div>
  )
}
