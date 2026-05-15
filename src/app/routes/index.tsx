import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'

// Pages
import { DashboardPage } from '@/features/dashboard/pages/dashboard'
import { StrategicMapPage } from '@/features/strategic-map/pages/strategic-map'
import { WinnerProfilePage } from '@/features/analysis/pages/winner-profile'
import { CompetitorRadarPage } from '@/features/analysis/pages/competitor-radar'
import { SimulatorPage } from '@/features/campaign/pages/simulator'
import { VideoCutsPage } from '@/features/campaign/pages/video-cuts'
import { SocialConnectionsPage } from '@/features/social-accounts/pages/social-connections'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Dashboard */}
        <Route path="/" element={<DashboardPage />} />

        {/* Mapa Estratégico */}
        <Route path="/mapa/plano-acao" element={<StrategicMapPage />} />

        {/* Análise */}
        <Route path="/analise/perfil-vencedor" element={<WinnerProfilePage />} />
        <Route path="/analise/radar-adversarios" element={<CompetitorRadarPage />} />

        {/* Campanha */}
        <Route path="/campanha/simulador" element={<SimulatorPage />} />
        <Route path="/campanha/cortes" element={<VideoCutsPage />} />

        {/* Configurações */}
        <Route path="/configuracoes/redes-sociais" element={<SocialConnectionsPage />} />
      </Route>
    </Routes>
  )
}
