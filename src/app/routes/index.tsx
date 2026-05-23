import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'

// Auth Pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { OnboardingPage } from '@/features/auth/pages/OnboardingPage'
import { TeamSettingsPage } from '@/features/auth/pages/TeamSettingsPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

// Onboarding Wizard (7 etapas - completar perfil apos criar campanha)
import { OnboardingWizardPage } from '@/features/onboarding'

// App Pages (funcionais)
import { StrategicMapPage } from '@/features/strategic-map/pages/strategic-map'
import { WinnerProfilePage } from '@/features/analysis/pages/winner-profile'

// Diagnostic Pages
import { DiagnosticHomePage } from '@/features/diagnostic/pages/diagnostic-home-page'
import { DiagnosticGeneratingPage } from '@/features/diagnostic/pages/diagnostic-generating-page'
import { DiagnosticSectionPage } from '@/features/diagnostic/pages/diagnostic-section-page'
import { DiagnosticMapFullscreenPage } from '@/features/diagnostic/pages/diagnostic-map-fullscreen-page'
import { DiagnosticPresentPage } from '@/features/diagnostic/pages/diagnostic-present-page'
import { DiagnosticSettingsPage } from '@/features/diagnostic/pages/diagnostic-settings-page'
import { DiagnosticHistoryPage } from '@/features/diagnostic/pages/diagnostic-history-page'

// @deprecated - Paginas com mock data (escondidas mas mantidas para referencia)
import { DashboardPage } from '@/features/dashboard/pages/dashboard'
import { CompetitorRadarPage } from '@/features/analysis/pages/competitor-radar'
import { SimulatorPage } from '@/features/campaign/pages/simulator'
import { VideoCutsPage } from '@/features/campaign/pages/video-cuts'
import { SocialConnectionsPage } from '@/features/social-accounts/pages/social-connections'

export function AppRoutes() {
  return (
    <Routes>
      {/* ============================================ */}
      {/* Rotas Publicas (sem autenticacao) */}
      {/* ============================================ */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* OAuth Callback (Supabase redireciona para ca) */}
      <Route path="/auth/callback" element={<Navigate to="/" replace />} />

      {/* ============================================ */}
      {/* Onboarding - Criar primeira campanha (sem campanha) */}
      {/* ============================================ */}
      <Route
        path="/onboarding/create-campaign"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* Onboarding Wizard - Completar perfil (requer campanha) */}
      {/* Wizard de 7 etapas para configurar campanha */}
      {/* ============================================ */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireCampaign>
            <OnboardingWizardPage />
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* Rotas Protegidas (requer auth + campanha) */}
      {/* ============================================ */}
      <Route element={<ProtectedRoute requireCampaign />}>
        <Route element={<MainLayout />}>
          {/* Rota raiz redireciona para o mapa estrategico */}
          <Route path="/" element={<Navigate to="/mapa/plano-acao" replace />} />

          {/* Mapa Estrategico - FUNCIONAL (dados reais TSE) */}
          <Route path="/mapa/plano-acao" element={<StrategicMapPage />} />

          {/* Analise - Perfil Vencedor - FUNCIONAL (em desenvolvimento) */}
          <Route path="/analise/perfil-vencedor" element={<WinnerProfilePage />} />

          {/* Diagnostico Estrategico - FUNCIONAL */}
          <Route path="/diagnostico" element={<DiagnosticHomePage />} />
          <Route path="/diagnostico/gerando" element={<DiagnosticGeneratingPage />} />
          <Route path="/diagnostico/secao/:sectionType" element={<DiagnosticSectionPage />} />
          <Route path="/diagnostico/mapa" element={<DiagnosticMapFullscreenPage />} />
          <Route path="/diagnostico/apresentar" element={<DiagnosticPresentPage />} />
          <Route path="/diagnostico/configuracoes" element={<DiagnosticSettingsPage />} />
          <Route path="/diagnostico/historico" element={<DiagnosticHistoryPage />} />

          {/* Configuracoes - Equipe */}
          <Route path="/configuracoes/equipe" element={<TeamSettingsPage />} />

          {/* ============================================ */}
          {/* @deprecated - Paginas com mock data */}
          {/* Mantidas para referencia, mas escondidas do menu */}
          {/* ============================================ */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analise/radar-adversarios" element={<CompetitorRadarPage />} />
          <Route path="/campanha/simulador" element={<SimulatorPage />} />
          <Route path="/campanha/cortes" element={<VideoCutsPage />} />
          <Route path="/configuracoes/redes-sociais" element={<SocialConnectionsPage />} />
        </Route>
      </Route>

      {/* Catch-all: redireciona para login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
