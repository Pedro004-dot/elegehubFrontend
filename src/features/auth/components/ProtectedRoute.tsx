import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  /**
   * Se true, requer que o usuario tenha pelo menos uma campanha.
   * Redireciona para /onboarding/create-campaign se nao tiver.
   */
  requireCampaign?: boolean
  /**
   * Roles permitidas para acessar a rota.
   * Se nao especificado, qualquer membro tem acesso.
   */
  allowedRoles?: Array<'owner' | 'admin' | 'editor' | 'viewer'>
  /**
   * Componente filho a ser renderizado. Se nao fornecido, usa Outlet.
   */
  children?: React.ReactNode
}

/**
 * Skeleton que simula o layout da aplicacao durante carregamento.
 * Melhora UX percebido vs spinner generico.
 */
function AppSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar skeleton */}
      <div className="hidden w-64 flex-shrink-0 border-r bg-card p-4 md:block">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-full animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header skeleton */}
        <div className="h-14 border-b bg-card px-4 flex items-center justify-between">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="mt-6 h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function ProtectedRoute({
  requireCampaign = false,
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isLoadingCampaigns, campaigns, currentCampaign } = useAuth()
  const location = useLocation()

  // Mostra skeleton enquanto verifica autenticacao ou carrega campanhas
  // Skeleton eh melhor que spinner pois da sensacao de progresso
  if (isLoading || (isAuthenticated && isLoadingCampaigns)) {
    return <AppSkeleton />
  }

  // Redireciona para login se nao autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verifica se precisa de campanha
  if (requireCampaign) {
    // Se nao tem nenhuma campanha, redireciona para criar
    if (campaigns.length === 0) {
      return <Navigate to="/onboarding/create-campaign" replace />
    }

    // Se tem campanhas mas nenhuma selecionada, mostra skeleton
    if (!currentCampaign) {
      return <AppSkeleton />
    }

    // Verifica role se especificado
    if (allowedRoles && currentCampaign.userRole) {
      if (!allowedRoles.includes(currentCampaign.userRole)) {
        return (
          <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
              <p className="text-muted-foreground">
                Voce nao tem permissao para acessar esta pagina.
              </p>
              <p className="text-sm text-muted-foreground">
                Seu role: {currentCampaign.userRole} | Requerido: {allowedRoles.join(' ou ')}
              </p>
            </div>
          </div>
        )
      }
    }
  }

  return children ? <>{children}</> : <Outlet />
}
