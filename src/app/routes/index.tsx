import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'

// Auth Pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { OnboardingPage } from '@/features/auth/pages/OnboardingPage'
import { TeamSettingsPage } from '@/features/auth/pages/TeamSettingsPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

// Mapa Exploratorio (Etapa 3 - Refatorado)
import { ExploratoryMapPage } from '@/features/map'

// Municipio (Etapa 4 - Refatorado)
// Lista de Municipios e Historico (Etapa 6)
import { MunicipalityPage, MunicipalityListPage, BriefingHistoryPage } from '@/features/municipality'

// Cortes (Galeria de videos)
import { CutsGalleryPage } from '@/features/cuts'

// Concorrentes (Analise de concorrentes)
import { ConcorrentesPage } from '@/features/concorrentes/pages/concorrentes-page'

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
      {/* Onboarding - Tela unica com 4 campos */}
      {/* Redireciona direto para /mapa apos criar campanha */}
      {/* ============================================ */}
      <Route
        path="/onboarding/create-campaign"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      {/* Rota legada - redireciona para nova tela */}
      <Route path="/onboarding" element={<Navigate to="/onboarding/create-campaign" replace />} />

      {/* ============================================ */}
      {/* Rotas Protegidas (requer auth + campanha) */}
      {/* ============================================ */}
      <Route element={<ProtectedRoute requireCampaign />}>
        <Route element={<MainLayout />}>
          {/* Rota raiz redireciona para o mapa */}
          <Route path="/" element={<Navigate to="/mapa" replace />} />

          {/* Mapa Exploratorio (Etapa 3 - Refatorado) */}
          {/* Coloracao por indicador, sem classificacoes ou scores */}
          <Route path="/mapa" element={<ExploratoryMapPage />} />
          {/* Rotas legadas - redirecionam para mapa */}
          <Route path="/mapa/plano-acao" element={<Navigate to="/mapa" replace />} />
          <Route path="/oportunidade" element={<Navigate to="/mapa" replace />} />

          {/* Municipio (Etapa 4 - Refatorado) */}
          {/* Tabs: Briefing + Indicadores */}
          <Route path="/municipio/:codigoIbge" element={<MunicipalityPage />} />
          {/* Rotas legadas - redirecionam para nova estrutura */}
          <Route path="/oportunidade/briefing/:codigoIbge" element={<Navigate to="/municipio/:codigoIbge" replace />} />

          {/* Configuracoes - Equipe */}
          <Route path="/configuracoes/equipe" element={<TeamSettingsPage />} />

          {/* Lista de Municipios (Etapa 6) */}
          <Route path="/municipios" element={<MunicipalityListPage />} />

          {/* Historico de Briefings (Etapa 6) */}
          <Route path="/historico" element={<BriefingHistoryPage />} />

          {/* Cortes - Galeria de videos */}
          <Route path="/cortes" element={<CutsGalleryPage />} />

          {/* Concorrentes - Analise de concorrentes */}
          <Route path="/concorrentes" element={<ConcorrentesPage />} />

          {/* TODO Etapa 7: Perfil do usuario (edicao dos 4 campos) */}
          {/* <Route path="/perfil" element={<ProfilePage />} /> */}
        </Route>
      </Route>

      {/* Catch-all: redireciona para login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
