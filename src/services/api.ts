import axios from 'axios'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Cache de sessao para evitar chamadas repetidas ao Supabase auth
let cachedSession: Session | null = null
let sessionExpiresAt = 0

/**
 * Limpa o cache de autenticacao.
 * Deve ser chamado no logout para garantir que o proximo request busque nova sessao.
 */
export function clearAuthCache() {
  cachedSession = null
  sessionExpiresAt = 0
}

/**
 * Atualiza o cache de sessao.
 * Pode ser chamado pelo AuthProvider quando a sessao mudar.
 */
export function updateAuthCache(session: Session | null) {
  if (session) {
    cachedSession = session
    // expires_in e em segundos, convertemos para timestamp
    // Subtrai 60s de margem para renovar antes de expirar
    sessionExpiresAt = Date.now() + (session.expires_in ? session.expires_in * 1000 - 60000 : 3600000)
  } else {
    clearAuthCache()
  }
}

// Interceptor que adiciona o token do Supabase em cada requisicao
// Usa cache para evitar chamadas repetidas ao getSession()
api.interceptors.request.use(async (config) => {
  try {
    const now = Date.now()

    // Usa cache se token ainda valido
    if (cachedSession && now < sessionExpiresAt) {
      config.headers.Authorization = `Bearer ${cachedSession.access_token}`
      return config
    }

    // Busca nova sessao e atualiza cache
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      updateAuthCache(session)
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch (error) {
    console.error('Erro ao obter sessao Supabase:', error)
  }

  return config
})

// Interceptor de resposta para tratar erros de autenticacao
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tenta fazer refresh do token
      try {
        const { data, error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError) {
          // Se falhar o refresh, limpa cache, faz logout e redireciona
          clearAuthCache()
          await supabase.auth.signOut()
          window.location.href = '/login'
        } else if (data.session) {
          // Atualiza cache com nova sessao
          updateAuthCache(data.session)
          // Retry da requisicao original com novo token
          error.config.headers.Authorization = `Bearer ${data.session.access_token}`
          return api.request(error.config)
        }
      } catch (refreshError) {
        console.error('Erro ao fazer refresh do token:', refreshError)
        clearAuthCache()
        await supabase.auth.signOut()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)
