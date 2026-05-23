import { useAuthContext } from '@/app/providers/AuthProvider'

/**
 * Hook para acessar o contexto de autenticacao.
 * Retorna o usuario, sessao, campanhas e funcoes de auth.
 */
export function useAuth() {
  return useAuthContext()
}
