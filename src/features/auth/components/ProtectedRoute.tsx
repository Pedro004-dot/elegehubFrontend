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

export function ProtectedRoute({
  requireCampaign = false,
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isLoadingCampaigns, campaigns, currentCampaign } = useAuth()
  const location = useLocation()

  // Mostra loading enquanto verifica autenticacao ou carrega campanhas
  if (isLoading || (isAuthenticated && isLoadingCampaigns)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">
            {isLoading ? 'Carregando...' : 'Carregando campanhas...'}
          </p>
        </div>
      </div>
    )
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

    // Se tem campanhas mas nenhuma selecionada, seleciona a primeira
    if (!currentCampaign) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Carregando campanha...</p>
          </div>
        </div>
      )
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
