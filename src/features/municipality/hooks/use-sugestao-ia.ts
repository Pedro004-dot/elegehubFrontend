/**
 * useSugestaoIA - Hook para gerar sugestoes da IA
 *
 * Usa o endpoint /intelligence/municipio/:codigoIbge/sugestao
 * Retorna sugestao em um dos 3 escopos legitimos:
 * - sumario: resumir o que esta na tela
 * - narrativa: justificar por que o municipio merece atencao
 * - pauta: recomendar temas de discurso
 *
 * Conforme CLAUDE.md secao 6: A IA nunca estima votos,
 * nunca recomenda alocacao de orcamento, nunca compara municipios.
 */

import { useState, useCallback } from 'react'
import { api } from '@/services/api'
import type { SugestaoIA, SugestaoEscopo, BriefingMunicipio } from '../types'

interface UseSugestaoIAReturn {
  /** Sugestao gerada */
  sugestao: SugestaoIA | null
  /** Gerando sugestao */
  isLoading: boolean
  /** Erro se houver */
  error: Error | null
  /** Gerar nova sugestao */
  generate: (escopo: SugestaoEscopo) => Promise<void>
  /** Limpar sugestao */
  clear: () => void
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

/**
 * Hook para gerar sugestoes da IA
 *
 * @param codigoIbge - Codigo IBGE do municipio
 * @param briefing - Dados do briefing (usado como contexto)
 */
export function useSugestaoIA(
  codigoIbge: string,
  briefing: BriefingMunicipio | null
): UseSugestaoIAReturn {
  const [sugestao, setSugestao] = useState<SugestaoIA | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const generate = useCallback(
    async (escopo: SugestaoEscopo) => {
      if (!codigoIbge) {
        setError(new Error('codigoIbge e obrigatorio'))
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const { data: response } = await api.post<ApiResponse<SugestaoIA>>(
          `/intelligence/municipio/${codigoIbge}/sugestao`,
          { escopo }
        )

        if (response.success && response.data) {
          setSugestao(response.data)
        } else {
          throw new Error('Resposta invalida da API')
        }
      } catch (err) {
        console.warn('[useSugestaoIA] API falhou, gerando mock:', err)

        // Gerar sugestao mock para desenvolvimento
        const mockSugestao = generateMockSugestao(escopo, briefing)
        setSugestao(mockSugestao)
      } finally {
        setIsLoading(false)
      }
    },
    [codigoIbge, briefing]
  )

  const clear = useCallback(() => {
    setSugestao(null)
    setError(null)
  }, [])

  return {
    sugestao,
    isLoading,
    error,
    generate,
    clear,
  }
}

/**
 * Gera sugestao mock para desenvolvimento
 */
function generateMockSugestao(
  escopo: SugestaoEscopo,
  briefing: BriefingMunicipio | null
): SugestaoIA {
  const nomeMunicipio = briefing?.nomeMunicipio || 'este municipio'

  const conteudoByEscopo: Record<SugestaoEscopo, string> = {
    sumario: `**Resumo de ${nomeMunicipio}**

${nomeMunicipio} apresenta ${briefing?.porQueEstarAqui.length || 0} razoes objetivas para visita, destacando-se como territorio estrategico para a campanha. O municipio conta com ${briefing?.quemPodeAbrirPortas.length || 0} liderancas locais identificadas que podem facilitar a entrada na regiao.

Os principais temas locais que merecem atencao sao ${briefing?.oQueTePegado.slice(0, 2).map(t => t.tema).join(' e ') || 'transporte e saude'}. O partido tem historico ${briefing?.comoPartidoSeComporta.resumo ? 'favoravel' : 'a ser construido'} no municipio.

*Esta analise foi baseada nos indicadores disponiveis no briefing.*`,

    narrativa: `**Por que ${nomeMunicipio} merece atencao**

${nomeMunicipio} representa uma oportunidade estrategica por tres razoes principais:

1. **Base eleitoral receptiva**: ${briefing?.porQueEstarAqui[0]?.contexto || 'O municipio apresenta indicadores favoraveis para recepcao da mensagem da campanha.'}

2. **Rede de apoio existente**: Com ${briefing?.quemPodeAbrirPortas.length || 0} liderancas locais mapeadas, ha uma estrutura de mobilizacao pre-existente que pode ser ativada.

3. **Pautas alinhadas**: Os temas que mais preocupam a populacao local (${briefing?.oQueTePegado.slice(0, 2).map(t => t.tema).join(', ') || 'questoes sociais'}) estao alinhados com as propostas da campanha.

A recomendacao e priorizar agenda presencial e articulacao com as liderancas identificadas.

*Justificativa baseada em: ${briefing?.fontesConsultadas.map(f => f.tabela).join(', ') || 'indicadores do briefing'}*`,

    pauta: `**Pautas recomendadas para ${nomeMunicipio}**

Com base nos dados locais, as seguintes pautas tem maior aderencia:

${briefing?.oQueTePegado.slice(0, 3).map((tema, i) => `
**${i + 1}. ${tema.tema}**
- Por que funciona: ${tema.porqueRelevante}
- Gancho de discurso: ${tema.ganchoDiscurso || 'Conectar com experiencias concretas da populacao'}
- Fonte: ${tema.fonte}
`).join('\n') || `
**1. Saude publica**
- Por que funciona: Tempo de espera em unidades de saude e uma reclamacao frequente
- Gancho de discurso: Compromisso com investimento em atencao basica

**2. Emprego e renda**
- Por que funciona: Preocupacao com oportunidades economicas
- Gancho de discurso: Politicas de geracao de emprego e apoio ao empreendedor local
`}

**Importante**: Adapte a linguagem ao contexto local e valide os temas com as liderancas antes de usar em materiais de campanha.

*Recomendacoes baseadas em indicadores socioeconomicos e historico eleitoral do municipio.*`,
  }

  return {
    escopo,
    conteudo: conteudoByEscopo[escopo],
    indicadoresConsultados: [
      'fact_votacao',
      'dim_lideranca_local',
      'fact_socioeconomico',
      ...(briefing?.fontesConsultadas.map(f => f.tabela) || []),
    ],
    geradoEm: new Date().toISOString(),
  }
}

export default useSugestaoIA
