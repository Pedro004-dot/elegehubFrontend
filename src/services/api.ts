import axios from 'axios'
import { supabase } from '@/lib/supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor que adiciona o token do Supabase em cada requisicao
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.access_token) {
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
        const { error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError) {
          // Se falhar o refresh, faz logout e redireciona
          await supabase.auth.signOut()
          window.location.href = '/login'
        } else {
          // Retry da requisicao original com novo token
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            error.config.headers.Authorization = `Bearer ${session.access_token}`
            return api.request(error.config)
          }
        }
      } catch (refreshError) {
        console.error('Erro ao fazer refresh do token:', refreshError)
        await supabase.auth.signOut()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)
