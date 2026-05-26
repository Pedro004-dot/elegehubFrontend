/**
 * useBriefingHistory - Hook para gerenciar historico de briefings
 *
 * Armazena localmente os briefings acessados recentemente.
 * Em producao, seria integrado com backend para persistencia.
 */

import { useState, useEffect, useCallback } from 'react'
import type { BriefingHistoricoItem } from '../types'

const STORAGE_KEY = 'elegehub_briefing_history'
const MAX_HISTORY_ITEMS = 20

interface UseBriefingHistoryReturn {
  history: BriefingHistoricoItem[]
  addToHistory: (item: Omit<BriefingHistoricoItem, 'geradoEm' | 'cacheValido' | 'cacheExpiraEm'>) => void
  clearHistory: () => void
  removeFromHistory: (codigoIbge: string) => void
}

export function useBriefingHistory(): UseBriefingHistoryReturn {
  const [history, setHistory] = useState<BriefingHistoricoItem[]>([])

  // Carregar historico do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as BriefingHistoricoItem[]
        // Atualizar status do cache
        const updated = parsed.map((item) => ({
          ...item,
          cacheValido: new Date(item.cacheExpiraEm) > new Date(),
        }))
        setHistory(updated)
      }
    } catch (err) {
      console.error('[useBriefingHistory] Erro ao carregar historico:', err)
    }
  }, [])

  // Salvar no localStorage quando historico mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (err) {
      console.error('[useBriefingHistory] Erro ao salvar historico:', err)
    }
  }, [history])

  const addToHistory = useCallback(
    (item: Omit<BriefingHistoricoItem, 'geradoEm' | 'cacheValido' | 'cacheExpiraEm'>) => {
      setHistory((prev) => {
        // Remover item existente se houver
        const filtered = prev.filter((h) => h.codigoIbge !== item.codigoIbge)

        // Adicionar no inicio
        const newItem: BriefingHistoricoItem = {
          ...item,
          geradoEm: new Date().toISOString(),
          cacheValido: true,
          cacheExpiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        }

        // Limitar tamanho
        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)

        return updated
      })
    },
    []
  )

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const removeFromHistory = useCallback((codigoIbge: string) => {
    setHistory((prev) => prev.filter((h) => h.codigoIbge !== codigoIbge))
  }, [])

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  }
}

export default useBriefingHistory
