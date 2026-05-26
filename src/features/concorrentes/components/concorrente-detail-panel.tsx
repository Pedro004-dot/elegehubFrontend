/**
 * ConcorrenteDetailPanel - Painel de analise detalhada de um concorrente
 */

import { useEffect, useState } from 'react'
import {
  X,
  User,
  MapPin,
  DollarSign,
  Users,
  History,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConcorrenteDetail } from '../hooks/use-concorrente-detail'
import type { ConcorrenteBasico } from '../types'

interface ConcorrenteDetailPanelProps {
  concorrente: ConcorrenteBasico
  onClose: () => void
}

/**
 * Formata valor monetario
 */
function formatCurrency(valor: number | null | undefined): string {
  if (!valor) return '-'
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/**
 * Formata numero de votos
 */
function formatVotos(votos: number | null | undefined): string {
  if (!votos) return '-'
  return votos.toLocaleString('pt-BR')
}

export function ConcorrenteDetailPanel({
  concorrente,
  onClose,
}: ConcorrenteDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('ficha')

  const {
    analise,
    votos,
    gastos,
    financiamento,
    historico,
    doadores,
    despesas,
    isLoading,
    fetchVotos,
    fetchGastos,
    fetchFinanciamento,
    fetchHistorico,
    fetchDoadores,
    fetchDespesas,
  } = useConcorrenteDetail(concorrente.id)

  // Carregar dados da tab ativa
  useEffect(() => {
    if (activeTab === 'mapa' && votos.length === 0) {
      fetchVotos(20)
    } else if (activeTab === 'gastos') {
      if (!gastos) fetchGastos()
      if (despesas.length === 0) fetchDespesas()
    } else if (activeTab === 'financiamento') {
      if (!financiamento) fetchFinanciamento()
      if (doadores.length === 0) fetchDoadores()
    } else if (activeTab === 'historico' && historico.length === 0) {
      fetchHistorico()
    }
  }, [activeTab, votos.length, gastos, financiamento, historico.length, doadores.length, despesas.length, fetchVotos, fetchGastos, fetchFinanciamento, fetchHistorico, fetchDoadores, fetchDespesas])

  if (isLoading && !analise) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {concorrente.fotoUrl ? (
              <img
                src={concorrente.fotoUrl}
                alt={concorrente.nomeUrna}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{concorrente.nomeUrna}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{concorrente.partidoSigla}</Badge>
              {concorrente.numeroCandidato && (
                <span className="text-sm text-muted-foreground">
                  #{concorrente.numeroCandidato}
                </span>
              )}
              {concorrente.resultado?.toLowerCase().includes('eleit') && (
                <Badge>Eleito</Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Resumo */}
      {analise && (
        <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/50">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {formatVotos(analise.resumo.totalVotos)}
            </p>
            <p className="text-xs text-muted-foreground">Votos (2022)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {analise.resumo.numMunicipiosComVotos}
            </p>
            <p className="text-xs text-muted-foreground">Municipios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {formatCurrency(analise.resumo.totalGastos)}
            </p>
            <p className="text-xs text-muted-foreground">Gastos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {analise.resumo.numDoadores || '-'}
            </p>
            <p className="text-xs text-muted-foreground">Doadores</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="ficha" className="gap-1">
            <User className="h-4 w-4" />
            Ficha
          </TabsTrigger>
          <TabsTrigger value="mapa" className="gap-1">
            <MapPin className="h-4 w-4" />
            Municipios
          </TabsTrigger>
          <TabsTrigger value="gastos" className="gap-1">
            <DollarSign className="h-4 w-4" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="financiamento" className="gap-1">
            <Users className="h-4 w-4" />
            Financiamento
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-1">
            <History className="h-4 w-4" />
            Historico
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto p-4">
          {/* Ficha */}
          <TabsContent value="ficha" className="mt-0">
            {analise?.ficha && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nome completo</p>
                    <p className="font-medium">{analise.ficha.nome || analise.ficha.nomeUrna}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cargo</p>
                    <p className="font-medium capitalize">{analise.ficha.cargo}</p>
                  </div>
                  {analise.ficha.profissao && (
                    <div>
                      <p className="text-muted-foreground">Profissao</p>
                      <p className="font-medium capitalize">{analise.ficha.profissao.toLowerCase()}</p>
                    </div>
                  )}
                  {analise.ficha.escolaridade && (
                    <div>
                      <p className="text-muted-foreground">Escolaridade</p>
                      <p className="font-medium capitalize">{analise.ficha.escolaridade.toLowerCase()}</p>
                    </div>
                  )}
                  {analise.ficha.totalBens !== null && analise.ficha.totalBens !== undefined && (
                    <div>
                      <p className="text-muted-foreground">Bens declarados</p>
                      <p className="font-medium">{formatCurrency(analise.ficha.totalBens)}</p>
                    </div>
                  )}
                  {analise.ficha.situacaoCandidatura && (
                    <div>
                      <p className="text-muted-foreground">Situacao</p>
                      <p className="font-medium capitalize">{analise.ficha.situacaoCandidatura.toLowerCase()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Municipios com mais votos */}
          <TabsContent value="mapa" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Municipios por Votos</CardTitle>
              </CardHeader>
              <CardContent>
                {votos.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {votos.map((v, i) => (
                      <div
                        key={v.codigoIbge}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-6">{i + 1}.</span>
                          <span className="font-medium">{v.nomeMunicipio}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatVotos(v.votos)}</span>
                          {v.percentualVotos && (
                            <span className="text-muted-foreground ml-2">
                              ({v.percentualVotos.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gastos */}
          <TabsContent value="gastos" className="mt-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gastos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {!gastos ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Sem dados de gastos disponiveis</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center py-2 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{formatCurrency(gastos.total)}</p>
                      <p className="text-sm text-muted-foreground">Total de gastos</p>
                    </div>
                    {gastos.porCategoria.map((c) => (
                      <div
                        key={c.categoria}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <span className="font-medium capitalize">{c.categoria}</span>
                          <span className="text-muted-foreground ml-2">
                            ({c.numDespesas} despesas)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(c.valor)}</span>
                          <span className="text-muted-foreground ml-2">
                            ({c.percentual.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Despesas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lista de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                {despesas.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {despesas.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm capitalize">{d.categoria}</p>
                          {d.dataDespesa && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(d.dataDespesa).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                          {d.descricao && (
                            <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                              {d.descricao}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(d.valor)}</span>
                          {d.fornecedor && (
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {d.fornecedor}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financiamento */}
          <TabsContent value="financiamento" className="mt-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Financiamento por Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                {!financiamento ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Sem dados de financiamento disponiveis</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center py-2 bg-muted rounded-lg">
                        <p className="text-2xl font-bold">{formatCurrency(financiamento.total)}</p>
                        <p className="text-sm text-muted-foreground">Total recebido</p>
                      </div>
                      <div className="text-center py-2 bg-muted rounded-lg">
                        <p className="text-2xl font-bold">{financiamento.numDoadores}</p>
                        <p className="text-sm text-muted-foreground">Doadores</p>
                      </div>
                    </div>
                    {financiamento.porFonte.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <span className="font-medium capitalize">{f.fonteOrigem}</span>
                          <span className="text-muted-foreground ml-2 capitalize">
                            ({f.tipoReceita})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(f.valor)}</span>
                          <span className="text-muted-foreground ml-2">
                            ({f.percentual.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Doadores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lista de Doadores</CardTitle>
              </CardHeader>
              <CardContent>
                {doadores.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {doadores.map((d) => (
                      <div
                        key={`${d.id}-${d.valor}`}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{d.tipo === 'PF' ? '👤' : '🏢'}</span>
                          <div>
                            <p className="font-medium text-sm">{d.nome}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {d.fonteOrigem}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(d.valor)}</span>
                          {d.dataDoacao && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(d.dataDoacao).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historico */}
          <TabsContent value="historico" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historico Eleitoral</CardTitle>
              </CardHeader>
              <CardContent>
                {historico.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Sem historico disponivel</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historico.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{h.anoEleicao}</span>
                            <Badge variant="outline">{h.partidoSigla}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{h.cargo}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatVotos(h.totalVotos)} votos</p>
                          {h.resultado && (
                            <Badge
                              variant={h.resultado.toLowerCase().includes('eleit') ? 'default' : 'secondary'}
                            >
                              {h.resultado}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default ConcorrenteDetailPanel
