/**
 * Tipos TypeScript para analise de concorrentes.
 */

/**
 * Dados basicos de um concorrente (busca/lista).
 */
export interface ConcorrenteBasico {
  id: number
  nomeUrna: string
  nome?: string | null
  partidoId: number
  partidoSigla: string
  cargo: string
  anoEleicao: number
  numeroCandidato?: number | null
  fotoUrl?: string | null
  totalVotos?: number | null
  resultado?: string | null
}

/**
 * Ficha completa do concorrente.
 */
export interface FichaConcorrente {
  id: number
  nomeUrna: string
  nome?: string | null
  partidoId: number
  partidoSigla: string
  cargo: string
  anoEleicao: number
  numeroCandidato?: number | null
  fotoUrl?: string | null
  dataNascimento?: string | null
  genero?: string | null
  corRaca?: string | null
  profissao?: string | null
  escolaridade?: string | null
  totalBens?: number | null
  situacaoCandidatura?: string | null
  resultado?: string | null
}

/**
 * Votacao por municipio.
 */
export interface VotacaoMunicipio {
  municipioId: number
  codigoIbge: string
  nomeMunicipio: string
  votos: number
  percentualVotos?: number | null
  votosValidosMunicipio?: number | null
  anoEleicao: number
}

/**
 * Gastos por categoria.
 */
export interface GastosCategoria {
  categoria: string
  valor: number
  percentual: number
  numDespesas: number
}

export interface GastosAgregados {
  candidatoId: number
  total: number
  porCategoria: GastosCategoria[]
  anoEleicao: number
}

/**
 * Financiamento por fonte.
 */
export interface FinanciamentoFonte {
  fonteOrigem: string
  tipoReceita: string
  valor: number
  percentual: number
}

export interface FinanciamentoAgregado {
  candidatoId: number
  total: number
  porFonte: FinanciamentoFonte[]
  numDoadores: number
  anoEleicao: number
}

/**
 * Historico de eleicoes.
 */
export interface HistoricoEleicao {
  anoEleicao: number
  cargo: string
  partidoSigla: string
  numeroCandidato?: number | null
  totalVotos: number
  resultado?: string | null
}

/**
 * Analise completa de um concorrente.
 */
export interface AnaliseConcorrente {
  ficha: FichaConcorrente
  resumo: {
    totalVotos: number
    numMunicipiosComVotos: number
    totalGastos?: number | null
    totalDoacoes?: number | null
    numDoadores?: number | null
  }
  dataCalculo: string
}

/**
 * Municipio na analise de sobreposicao.
 */
export interface MunicipioSobreposicao {
  codigoIbge: string
  nomeMunicipio: string
  meusVotos: number
  meuPercentual?: number | null
  votosConcorrente: number
  percentualConcorrente?: number | null
  diferencaVotos: number
  diferencaPercentual?: number | null
}

/**
 * Sobreposicao territorial.
 */
export interface SobreposicaoTerritorial {
  concorrenteId: number
  concorrenteNome: string
  meuPartidoId: number
  meuPartidoSigla: string
  anoEleicao: number
  municipiosDisputa: MunicipioSobreposicao[]
  ameacas: MunicipioSobreposicao[]
  oportunidades: MunicipioSobreposicao[]
  estatisticas: {
    totalMunicipiosAnalisados: number
    totalDisputa: number
    totalAmeacas: number
    totalOportunidades: number
  }
  dataCalculo: string
}

/**
 * Resposta da busca de concorrentes.
 */
export interface BuscaConcorrentesResponse {
  concorrentes: ConcorrenteBasico[]
  total: number
  filtros: {
    termo?: string
    cargo: string
    ano: number
    partidoId?: number
  }
}

/**
 * Resposta de votos por municipio.
 */
export interface VotosMunicipioResponse {
  candidatoId: number
  anoEleicao: number
  municipios: VotacaoMunicipio[]
  total: number
}

/**
 * Resposta de historico.
 */
export interface HistoricoResponse {
  candidatoId: number
  eleicoes: HistoricoEleicao[]
  total: number
}

/**
 * Doador individual.
 */
export interface Doador {
  id: number
  nome: string
  tipo: 'PF' | 'PJ'
  valor: number
  tipoReceita: string
  fonteOrigem: string
  dataDoacao: string | null
}

/**
 * Resposta de doadores.
 */
export interface DoadoresResponse {
  candidatoId: number
  anoEleicao: number
  totalRecebido: number
  numDoadores: number
  doadores: Doador[]
}

/**
 * Despesa individual.
 */
export interface Despesa {
  id: number
  categoria: string
  valor: number
  dataDespesa: string | null
  fornecedor: string | null
  descricao: string | null
}

/**
 * Resposta de despesas detalhadas.
 */
export interface DespesasResponse {
  candidatoId: number
  anoEleicao: number
  totalGastos: number
  numDespesas: number
  despesas: Despesa[]
}
