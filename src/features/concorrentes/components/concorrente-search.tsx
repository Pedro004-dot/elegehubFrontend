/**
 * ConcorrenteSearch - Componente de busca de concorrentes
 */

import { useState, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ConcorrenteSearchProps {
  onSearch: (termo: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function ConcorrenteSearch({
  onSearch,
  isLoading = false,
  placeholder = 'Buscar por nome ou partido...',
}: ConcorrenteSearchProps) {
  const [termo, setTermo] = useState('')

  const handleSearch = useCallback(() => {
    if (termo.trim().length >= 2) {
      onSearch(termo.trim())
    }
  }, [termo, onSearch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleClear = useCallback(() => {
    setTermo('')
    onSearch('')
  }, [onSearch])

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9"
          disabled={isLoading}
        />
        {termo && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={handleClear}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button onClick={handleSearch} disabled={isLoading || termo.length < 2}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Buscar'
        )}
      </Button>
    </div>
  )
}

export default ConcorrenteSearch
