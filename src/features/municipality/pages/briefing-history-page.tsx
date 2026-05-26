/**
 * BriefingHistoryPage - Historico de briefings acessados
 *
 * Exibe lista de municipios cujos briefings foram acessados recentemente.
 * Mostra status do cache e permite navegar rapidamente para o briefing.
 */

import { useNavigate } from 'react-router-dom'
import {
  History,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useBriefingHistory } from '../hooks/use-briefing-history'

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `Ha ${diffMins} min`
  if (diffHours < 24) return `Ha ${diffHours}h`
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Ha ${diffDays} dias`
  return date.toLocaleDateString('pt-BR')
}

export function BriefingHistoryPage() {
  const navigate = useNavigate()
  const { history, clearHistory, removeFromHistory } = useBriefingHistory()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <History className="h-6 w-6 text-brand" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Historico de Briefings
              </h1>
              <p className="text-sm text-muted-foreground">
                {history.length} {history.length === 1 ? 'briefing' : 'briefings'} acessados
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar historico
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="p-4 rounded-full bg-muted">
              <History className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">Nenhum briefing acessado</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Os briefings que voce visualizar aparecerao aqui
              </p>
            </div>
            <Button onClick={() => navigate('/mapa')}>
              Explorar mapa
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Briefings recentes</CardTitle>
                <CardDescription>
                  Clique em um municipio para ver o briefing completo
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Municipio</TableHead>
                      <TableHead>Acessado</TableHead>
                      <TableHead>Cache</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow
                        key={item.codigoIbge}
                        className="cursor-pointer"
                        onClick={() => navigate(`/municipio/${item.codigoIbge}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.nomeMunicipio}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-sm">
                              {formatRelativeTime(item.geradoEm)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.cacheValido ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              Valido
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <AlertCircle className="h-3 w-3 text-yellow-600" />
                              Expirado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFromHistory(item.codigoIbge)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Info sobre cache */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Sobre o cache</h3>
              <p className="text-sm text-muted-foreground">
                Os briefings sao cacheados por 7 dias. Briefings com cache expirado
                serao regenerados automaticamente ao acessar. Voce pode forcar uma
                atualizacao clicando em "Atualizar" na pagina do briefing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BriefingHistoryPage
