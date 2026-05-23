/**
 * @deprecated Esta pagina sera removida na v2.
 * O Simulador usa dados mockados e foi removido do menu.
 * Sera reimplementado com modelo preditivo real no futuro.
 */

import { Separator } from '@/components/ui/separator'
import { SimulatorHeader } from '../components/simulator-header'
import { BudgetSlider } from '../components/budget-slider'
import { FocusSlider } from '../components/focus-slider'
import { ChannelSelector } from '../components/channel-selector'
import { OpponentSelector } from '../components/opponent-selector'
import { ProjectionResults } from '../components/projection-results'
import { SavedScenarios } from '../components/saved-scenarios'
import { SimulatorMap } from '../components/simulator-map'
import { useSimulator } from '../hooks/use-simulator'

export function SimulatorPage() {
  const {
    state,
    currentOutput,
    comparison,
    savedScenarios,
    updateBudget,
    updateFocus,
    toggleChannel,
    selectOpponent,
    loadScenario,
    saveCurrentScenario,
  } = useSimulator()

  return (
    <div className="flex h-full flex-col">
      <div className="p-6 pb-4">
        <SimulatorHeader />
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden px-6">
        {/* Left Panel - Controls (40%) */}
        <div className="w-[40%] space-y-6 overflow-y-auto pb-6">
          <BudgetSlider value={state.budget} onChange={updateBudget} />

          <Separator />

          <FocusSlider value={state.focusCapital} onChange={updateFocus} />

          <Separator />

          <ChannelSelector
            activeChannels={state.activeChannels}
            onToggle={toggleChannel}
          />

          <Separator />

          <OpponentSelector
            selected={state.selectedOpponent}
            onSelect={selectOpponent}
          />

          <Separator />

          <ProjectionResults output={currentOutput} comparison={comparison} />
        </div>

        {/* Right Panel - Map (60%) */}
        <div className="w-[60%] pb-6">
          <SimulatorMap scenarioOutput={currentOutput} />
        </div>
      </div>

      {/* Footer - Saved Scenarios */}
      <div className="border-t p-6 pt-4">
        <SavedScenarios
          scenarios={savedScenarios}
          onLoad={loadScenario}
          onSaveNew={saveCurrentScenario}
        />
      </div>
    </div>
  )
}
