/**
 * MunicipalityCard - Card popup com informacoes resumidas do municipio
 *
 * Exibe:
 * - Nome do municipio e UF
 * - Populacao
 * - Categoria de classificacao (se disponivel)
 * - Top 3 candidatos mais votados em 2022
 * - Botao para ver briefing completo
 */

import { useState, useEffect } from 'react'
import { X, Users, ArrowRight, Trophy, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'
import { CATEGORIA_CONFIGS, type CategoriaClassificacao, type MunicipalityWithIndicators } from '../types'

interface TopCandidato {
  nome_urna: string
  partido: string
  votos: number
  percentual: number
}

interface MunicipalityCardProps {
  municipality: MunicipalityWithIndicators
  categoria?: CategoriaClassificacao | null
  onClose: () => void
  onNavigate: () => void
}

export function MunicipalityCard({
  municipality,
  categoria,
  onClose,
  onNavigate,
}: MunicipalityCardProps) {
  const [topCandidatos, setTopCandidatos] = useState<TopCandidato[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopCandidatos = async () => {
      setLoading(true)
      try {
        const { data } = await api.get<{ candidatos: TopCandidato[] }>(
          `/intelligence/municipio/${municipality.codigoIbge}/top-candidatos`
        )
        setTopCandidatos(data.candidatos || [])
      } catch (err) {
        console.error('[MunicipalityCard] Erro ao buscar top candidatos:', err)
        setTopCandidatos([])
      } finally {
        setLoading(false)
      }
    }

    fetchTopCandidatos()
  }, [municipality.codigoIbge])

  const formatPopulacao = (pop: number) => {
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M hab`
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}k hab`
    return `${pop.toLocaleString('pt-BR')} hab`
  }

  const categoriaConfig = categoria ? CATEGORIA_CONFIGS[categoria] : null

  return (
    <Card className="w-80 shadow-xl border-2 animate-in fade-in-0 zoom-in-95 duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <CardTitle className="text-lg font-semibold leading-tight">
              {municipality.nome}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {municipality.mesorregiao} · {municipality.uf}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Populacao e Categoria */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{formatPopulacao(municipality.populacao)}</span>
          </div>

          {categoriaConfig && (
            <Badge
              variant="outline"
              className="font-medium"
              style={{
                backgroundColor: categoriaConfig.bgColor,
                borderColor: categoriaConfig.borderColor,
                color: '#fff',
              }}
            >
              {categoriaConfig.label}
            </Badge>
          )}
        </div>

        {/* Top 3 Candidatos */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>Top 3 mais votados (2022)</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : topCandidatos.length > 0 ? (
            <div className="space-y-1.5">
              {topCandidatos.map((candidato, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm py-1 px-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground font-medium">
                      {index + 1}.
                    </span>
                    <span className="truncate">{candidato.nome_urna}</span>
                    <span className="text-muted-foreground text-xs">
                      ({candidato.partido})
                    </span>
                  </div>
                  <span className="font-medium shrink-0 ml-2">
                    {candidato.percentual}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic py-2">
              Dados nao disponiveis
            </p>
          )}
        </div>

        {/* Botao Ver Briefing */}
        <Button
          className="w-full"
          onClick={onNavigate}
        >
          Ver Briefing Completo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default MunicipalityCard
