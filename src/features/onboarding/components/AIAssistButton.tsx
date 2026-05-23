import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sparkles, Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIAssistButtonProps<T> {
  onSuggest: () => Promise<T>
  onAccept: (suggestion: T) => void
  onDismiss?: () => void
  renderSuggestion: (suggestion: T) => React.ReactNode
  buttonLabel?: string
  dialogTitle?: string
  dialogDescription?: string
  disclaimer?: string
  disabled?: boolean
  className?: string
}

type AIAssistState = 'idle' | 'loading' | 'showing' | 'error'

export function AIAssistButton<T>({
  onSuggest,
  onAccept,
  onDismiss,
  renderSuggestion,
  buttonLabel = 'Sugerir com IA',
  dialogTitle = 'Sugestao da IA',
  dialogDescription = 'A IA analisou seu perfil e gerou uma sugestao.',
  disclaimer = 'Sugestao gerada por IA. Revise e adapte conforme necessario.',
  disabled = false,
  className,
}: AIAssistButtonProps<T>) {
  const [state, setState] = useState<AIAssistState>('idle')
  const [suggestion, setSuggestion] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = async () => {
    setState('loading')
    setError(null)
    setIsOpen(true)

    try {
      const result = await onSuggest()
      setSuggestion(result)
      setState('showing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar sugestao')
      setState('error')
    }
  }

  const handleAccept = () => {
    if (suggestion) {
      onAccept(suggestion)
    }
    setIsOpen(false)
    setState('idle')
    setSuggestion(null)
  }

  const handleDismiss = () => {
    onDismiss?.()
    setIsOpen(false)
    setState('idle')
    setSuggestion(null)
    setError(null)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || state === 'loading'}
        className={cn('gap-2', className)}
      >
        {state === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {buttonLabel}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {dialogTitle}
            </DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {state === 'loading' && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Gerando sugestao...</p>
              </div>
            )}

            {state === 'error' && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                  className="mt-3"
                >
                  Tentar novamente
                </Button>
              </div>
            )}

            {state === 'showing' && suggestion && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  {renderSuggestion(suggestion)}
                </div>

                {disclaimer && (
                  <p className="text-xs text-muted-foreground italic">{disclaimer}</p>
                )}
              </div>
            )}
          </div>

          {state === 'showing' && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleDismiss}>
                <X className="mr-1 h-4 w-4" />
                Descartar
              </Button>
              <Button onClick={handleAccept}>
                <Check className="mr-1 h-4 w-4" />
                Usar sugestao
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
