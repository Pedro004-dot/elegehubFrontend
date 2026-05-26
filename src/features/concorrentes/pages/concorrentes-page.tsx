/**
 * ConcorrentesPage - Pagina de analise de concorrentes
 *
 * Permite buscar e analisar candidatos concorrentes com:
 * - Busca por nome ou partido
 * - Ficha completa do concorrente
 * - Top municipios por votos
 * - Gastos por categoria
 * - Financiamento por fonte
 * - Historico eleitoral
 */

import { useState, useCallback } from 'react'
import { Users, Search, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConcorrenteSearch } from '../components/concorrente-search'
import { ConcorrenteCard } from '../components/concorrente-card'
import { ConcorrenteDetailPanel } from '../components/concorrente-detail-panel'
import { useConcorrentesSearch } from '../hooks/use-concorrentes-search'
import { useTopCandidatos } from '../hooks/use-top-candidatos'
import type { ConcorrenteBasico } from '../types'

export function ConcorrentesPage() {
  const [selectedConcorrente, setSelectedConcorrente] = useState<ConcorrenteBasico | null>(null)
  const [isSearchMode, setIsSearchMode] = useState(false)

  const { concorrentes, total, isLoading, error, search, clear } = useConcorrentesSearch({
    cargo: 'deputado estadual',
    ano: 2022,
    limit: 50,
  })

  const { candidatos: topCandidatos, isLoading: isLoadingTop } = useTopCandidatos({
    cargo: 'deputado estadual',
    ano: 2022,
    limit: 100,
  })

  const handleSearch = useCallback(
    (termo: string) => {
      if (termo) {
        search(termo)
        setIsSearchMode(true)
      } else {
        clear()
        setIsSearchMode(false)
      }
      setSelectedConcorrente(null)
    },
    [search, clear]
  )

  const handleSelectFromDropdown = useCallback(
    (candidatoId: string | null) => {
      if (!candidatoId) return
      const candidato = topCandidatos.find((c) => c.id === Number(candidatoId))
      if (candidato) {
        setSelectedConcorrente(candidato)
        setIsSearchMode(false)
        clear()
      }
    },
    [topCandidatos, clear]
  )

  const handleSelectConcorrente = useCallback((concorrente: ConcorrenteBasico) => {
    setSelectedConcorrente(concorrente)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedConcorrente(null)
  }, [])

  return (
    <div className="flex h-full">
      {/* Lista de concorrentes */}
      <div className={`flex-1 flex flex-col ${selectedConcorrente ? 'max-w-md' : ''}`}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Analise de Concorrentes</h1>
          </div>
          <p className="text-muted-foreground mb-4">
            Busque candidatos que disputaram Deputado Estadual em MG (2022) para analisar sua forca
            territorial, gastos e financiamento.
          </p>

          {/* Select de candidatos */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Selecione um candidato</label>
            <Select
              value={selectedConcorrente?.id?.toString() || ''}
              onValueChange={handleSelectFromDropdown}
              disabled={isLoadingTop}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoadingTop ? 'Carregando candidatos...' : 'Selecione um candidato'} />
              </SelectTrigger>
              <SelectContent>
                {topCandidatos.map((candidato) => (
                  <SelectItem key={candidato.id} value={candidato.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{candidato.nomeUrna}</span>
                      <span className="text-muted-foreground text-xs">({candidato.partidoSigla})</span>
                      {candidato.totalVotos && (
                        <span className="text-muted-foreground text-xs ml-auto">
                          {candidato.totalVotos.toLocaleString('pt-BR')} votos
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Divisor */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou busque por nome</span>
            </div>
          </div>

          {/* Busca */}
          <ConcorrenteSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="flex items-center gap-2 p-4 mb-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{error.message}</p>
            </div>
          )}

          {concorrentes.length === 0 && !isLoading && !selectedConcorrente && !isSearchMode && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecione ou busque um concorrente</h3>
              <p className="text-muted-foreground max-w-sm">
                Escolha um candidato no select acima ou busque pelo nome de urna para analisar seus
                dados eleitorais.
              </p>
            </div>
          )}

          {concorrentes.length === 0 && !isLoading && isSearchMode && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground max-w-sm">
                Tente buscar por outro nome ou selecione um candidato no dropdown acima.
              </p>
            </div>
          )}

          {concorrentes.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {total} candidato(s) encontrado(s)
              </p>
              <div className="space-y-3">
                {concorrentes.map((concorrente) => (
                  <ConcorrenteCard
                    key={concorrente.id}
                    concorrente={concorrente}
                    onClick={() => handleSelectConcorrente(concorrente)}
                    isSelected={selectedConcorrente?.id === concorrente.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Painel de detalhes */}
      {selectedConcorrente && (
        <div className="w-[600px] border-l bg-background">
          <ConcorrenteDetailPanel
            concorrente={selectedConcorrente}
            onClose={handleClosePanel}
          />
        </div>
      )}
    </div>
  )
}

export default ConcorrentesPage
