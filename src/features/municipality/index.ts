/**
 * Municipality Feature - Index
 *
 * Feature para visualizacao de municipio individual.
 * Tabs: Briefing (6 secoes) | Indicadores (6 temas)
 * Painel de Sugestao da IA (3 escopos)
 */

// Pages
export { MunicipalityPage } from './pages/municipality-page'
export { MunicipalityListPage } from './pages/municipality-list-page'
export { BriefingHistoryPage } from './pages/briefing-history-page'

// Components
export { IndicatorsTab } from './components/indicators-tab'
export { SuggestionPanel } from './components/suggestion-panel'
export * from './components/briefing-sections'

// Hooks
export { useBriefing, useSugestaoIA, useMunicipalityList, useBriefingHistory } from './hooks'

// Types
export * from './types'
