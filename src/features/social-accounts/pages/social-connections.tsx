import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSocialAccounts } from '../hooks/use-social-accounts'
import { PlatformIcon } from '../components/platform-icon'
import { PLATFORMS } from '../types'
import type { SocialPlatform, SocialAccount } from '../types'
import { Trash2, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

// TODO: Obter campaignId do contexto de autenticação
const CAMPAIGN_ID = 'demo-campaign-id'

export function SocialConnectionsPage() {
  const [searchParams] = useSearchParams()
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const {
    isLoading,
    error,
    connectAccount,
    disconnectAccount,
    refreshToken,
    getAccountsByPlatform,
  } = useSocialAccounts({ campaignId: CAMPAIGN_ID })

  // Verificar parâmetros de URL após OAuth
  useEffect(() => {
    const success = searchParams.get('success')
    const errorParam = searchParams.get('error')
    const platform = searchParams.get('platform')

    if (success === 'true' && platform) {
      setNotification({
        type: 'success',
        message: `Conta do ${platform} conectada com sucesso!`,
      })
    } else if (errorParam) {
      setNotification({
        type: 'error',
        message: decodeURIComponent(errorParam),
      })
    }

    // Limpar notificação após 5 segundos
    if (success || errorParam) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const handleConnect = (platform: SocialPlatform) => {
    connectAccount(platform)
  }

  const handleDisconnect = async (account: SocialAccount) => {
    if (confirm(`Deseja desconectar a conta ${account.platformName || account.platform}?`)) {
      try {
        await disconnectAccount(account.id)
        setNotification({
          type: 'success',
          message: 'Conta desconectada com sucesso',
        })
      } catch {
        setNotification({
          type: 'error',
          message: 'Erro ao desconectar conta',
        })
      }
    }
  }

  const handleRefresh = async (account: SocialAccount) => {
    try {
      await refreshToken(account.id)
      setNotification({
        type: 'success',
        message: 'Token renovado com sucesso',
      })
    } catch {
      setNotification({
        type: 'error',
        message: 'Erro ao renovar token. Tente reconectar a conta.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Conexões de Redes Sociais</h1>
        <p className="text-muted-foreground">
          Conecte suas contas para publicar vídeos diretamente do CRM
        </p>
      </div>

      {/* Notificação */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de plataformas */}
      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const platformAccounts = getAccountsByPlatform(platform.id)
          const isConnected = platformAccounts.length > 0

          return (
            <Card key={platform.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <PlatformIcon platform={platform.id} size={48} />
                <div className="flex-1">
                  <CardTitle className="text-lg">{platform.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{platform.description}</p>
                </div>
                {isConnected ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Desconectado
                  </span>
                )}
              </CardHeader>

              <CardContent>
                {isConnected ? (
                  <div className="space-y-3">
                    {platformAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="p-3 bg-muted/50 rounded-lg space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          {account.profilePictureUrl ? (
                            <img
                              src={account.profilePictureUrl}
                              alt=""
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <PlatformIcon platform={account.platform} size={24} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {account.platformName || account.platformUsername || 'Conta conectada'}
                            </p>
                            {account.pageName && (
                              <p className="text-sm text-muted-foreground truncate">
                                Página: {account.pageName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Alerta de token expirando */}
                        {account.isTokenExpiring && (
                          <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 px-3 py-2 rounded">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Token expira em breve. Renove para continuar publicando.</span>
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefresh(account)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Renovar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDisconnect(account)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Desconectar
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Botão para conectar outra conta */}
                    {(platform.id === 'facebook' || platform.id === 'instagram') && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleConnect(platform.id)}
                      >
                        Conectar outra página
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleConnect(platform.id)}
                  >
                    Conectar {platform.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Informações adicionais */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          <strong>Nota:</strong> Suas credenciais são armazenadas de forma segura e usadas apenas
          para publicar conteúdo em seu nome.
        </p>
        <p>
          Você pode revogar o acesso a qualquer momento desconectando a conta.
        </p>
      </div>
    </div>
  )
}
