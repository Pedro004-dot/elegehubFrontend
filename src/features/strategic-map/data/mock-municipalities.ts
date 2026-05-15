import type { Municipality, MunicipalityClassification } from '../types'

const classifications: MunicipalityClassification[] = ['consolidar', 'conquistar', 'disputar', 'evitar']

const regions = [
  'Central',
  'Norte de Minas',
  'Sul de Minas',
  'Triângulo Mineiro',
  'Zona da Mata',
  'Vale do Aço',
  'Vale do Jequitinhonha'
]

const factorTemplates = {
  consolidar: [
    { title: 'Base histórica forte', description: 'Sua campanha tem presença consolidada neste município', impact: 'high' as const },
    { title: 'Perfil sociodemográfico alinhado', description: 'A população tem características favoráveis ao seu perfil', impact: 'high' as const },
    { title: 'Lideranças locais aliadas', description: 'Você conta com apoio de figuras políticas locais', impact: 'medium' as const }
  ],
  conquistar: [
    { title: 'Alto potencial inexplorado', description: 'Município com perfil favorável mas sem presença atual', impact: 'high' as const },
    { title: 'Concorrência fraca', description: 'Adversários não têm base forte aqui', impact: 'medium' as const },
    { title: 'Crescimento demográfico', description: 'População em expansão com novos eleitores', impact: 'medium' as const }
  ],
  disputar: [
    { title: 'Território dividido', description: 'Múltiplos candidatos disputam este eleitorado', impact: 'medium' as const },
    { title: 'Potencial moderado', description: 'ROI depende de investimento estratégico', impact: 'medium' as const },
    { title: 'Volatilidade eleitoral', description: 'Eleitores mudam de preferência entre eleições', impact: 'low' as const }
  ],
  evitar: [
    { title: 'Base adversária consolidada', description: 'Concorrente tem domínio histórico neste município', impact: 'high' as const },
    { title: 'Perfil demográfico desfavorável', description: 'Características populacionais não favorecem seu perfil', impact: 'medium' as const },
    { title: 'Custo-benefício negativo', description: 'Investimento necessário não justifica retorno esperado', impact: 'high' as const }
  ]
}

// Principais municípios de MG com dados realistas
export const MOCK_MUNICIPALITIES: Municipality[] = [
  {
    id: '1',
    ibgeCode: '3106200',
    name: 'Belo Horizonte',
    state: 'MG',
    region: 'Central',
    population: 2530701,
    classification: 'consolidar',
    score: 87,
    potentialVotes: 18450,
    factors: factorTemplates.consolidar,
    historicalData: [
      { year: 2014, votes: 14200, candidate: 'Similar A' },
      { year: 2018, votes: 16800, candidate: 'Similar B' },
      { year: 2022, votes: 19100, candidate: 'Similar C' }
    ]
  },
  {
    id: '2',
    ibgeCode: '3170206',
    name: 'Uberlândia',
    state: 'MG',
    region: 'Triângulo Mineiro',
    population: 706597,
    classification: 'conquistar',
    score: 72,
    potentialVotes: 8900,
    factors: factorTemplates.conquistar,
    historicalData: [
      { year: 2014, votes: 5200, candidate: 'Similar A' },
      { year: 2018, votes: 6100, candidate: 'Similar B' },
      { year: 2022, votes: 7800, candidate: 'Similar C' }
    ]
  },
  {
    id: '3',
    ibgeCode: '3118601',
    name: 'Contagem',
    state: 'MG',
    region: 'Central',
    population: 668949,
    classification: 'consolidar',
    score: 79,
    potentialVotes: 7200,
    factors: factorTemplates.consolidar,
    historicalData: [
      { year: 2014, votes: 5800, candidate: 'Similar A' },
      { year: 2018, votes: 6500, candidate: 'Similar B' },
      { year: 2022, votes: 7100, candidate: 'Similar C' }
    ]
  },
  {
    id: '4',
    ibgeCode: '3136702',
    name: 'Juiz de Fora',
    state: 'MG',
    region: 'Zona da Mata',
    population: 577532,
    classification: 'disputar',
    score: 54,
    potentialVotes: 4500,
    factors: factorTemplates.disputar,
    historicalData: [
      { year: 2014, votes: 3200, candidate: 'Similar A' },
      { year: 2018, votes: 3800, candidate: 'Similar B' },
      { year: 2022, votes: 4200, candidate: 'Similar C' }
    ]
  },
  {
    id: '5',
    ibgeCode: '3106705',
    name: 'Betim',
    state: 'MG',
    region: 'Central',
    population: 444784,
    classification: 'conquistar',
    score: 68,
    potentialVotes: 5100,
    factors: factorTemplates.conquistar,
    historicalData: [
      { year: 2014, votes: 3100, candidate: 'Similar A' },
      { year: 2018, votes: 3900, candidate: 'Similar B' },
      { year: 2022, votes: 4600, candidate: 'Similar C' }
    ]
  },
  {
    id: '6',
    ibgeCode: '3143302',
    name: 'Montes Claros',
    state: 'MG',
    region: 'Norte de Minas',
    population: 417478,
    classification: 'evitar',
    score: 28,
    potentialVotes: 1200,
    factors: factorTemplates.evitar,
    historicalData: [
      { year: 2014, votes: 800, candidate: 'Similar A' },
      { year: 2018, votes: 950, candidate: 'Similar B' },
      { year: 2022, votes: 1100, candidate: 'Similar C' }
    ]
  },
  {
    id: '7',
    ibgeCode: '3154606',
    name: 'Ribeirão das Neves',
    state: 'MG',
    region: 'Central',
    population: 341724,
    classification: 'consolidar',
    score: 81,
    potentialVotes: 4800,
    factors: factorTemplates.consolidar,
    historicalData: [
      { year: 2014, votes: 3500, candidate: 'Similar A' },
      { year: 2018, votes: 4100, candidate: 'Similar B' },
      { year: 2022, votes: 4600, candidate: 'Similar C' }
    ]
  },
  {
    id: '8',
    ibgeCode: '3170701',
    name: 'Uberaba',
    state: 'MG',
    region: 'Triângulo Mineiro',
    population: 340277,
    classification: 'disputar',
    score: 49,
    potentialVotes: 2800,
    factors: factorTemplates.disputar,
    historicalData: [
      { year: 2014, votes: 1900, candidate: 'Similar A' },
      { year: 2018, votes: 2200, candidate: 'Similar B' },
      { year: 2022, votes: 2600, candidate: 'Similar C' }
    ]
  },
  {
    id: '9',
    ibgeCode: '3131307',
    name: 'Governador Valadares',
    state: 'MG',
    region: 'Vale do Aço',
    population: 281046,
    classification: 'evitar',
    score: 22,
    potentialVotes: 800,
    factors: factorTemplates.evitar,
    historicalData: [
      { year: 2014, votes: 600, candidate: 'Similar A' },
      { year: 2018, votes: 700, candidate: 'Similar B' },
      { year: 2022, votes: 750, candidate: 'Similar C' }
    ]
  },
  {
    id: '10',
    ibgeCode: '3135209',
    name: 'Ipatinga',
    state: 'MG',
    region: 'Vale do Aço',
    population: 265409,
    classification: 'conquistar',
    score: 65,
    potentialVotes: 3200,
    factors: factorTemplates.conquistar,
    historicalData: [
      { year: 2014, votes: 2100, candidate: 'Similar A' },
      { year: 2018, votes: 2600, candidate: 'Similar B' },
      { year: 2022, votes: 3000, candidate: 'Similar C' }
    ]
  }
]

// Gerar mais municípios mockados para completar os 853 de MG
function generateMockMunicipality(index: number): Municipality {
  const classification = classifications[Math.floor(Math.random() * classifications.length)] as MunicipalityClassification
  const region = regions[Math.floor(Math.random() * regions.length)] as string
  const population = Math.floor(Math.random() * 100000) + 5000
  const score = classification === 'consolidar' ? 70 + Math.floor(Math.random() * 30) :
                classification === 'conquistar' ? 50 + Math.floor(Math.random() * 30) :
                classification === 'disputar' ? 35 + Math.floor(Math.random() * 30) :
                10 + Math.floor(Math.random() * 30)

  return {
    id: `gen-${index}`,
    ibgeCode: `31${String(index).padStart(5, '0')}`,
    name: `Município ${index}`,
    state: 'MG',
    region,
    population,
    classification,
    score,
    potentialVotes: Math.floor(population * (score / 100) * 0.01),
    factors: factorTemplates[classification],
    historicalData: [
      { year: 2014, votes: Math.floor(Math.random() * 1000) + 100, candidate: 'Similar A' },
      { year: 2018, votes: Math.floor(Math.random() * 1200) + 150, candidate: 'Similar B' },
      { year: 2022, votes: Math.floor(Math.random() * 1400) + 200, candidate: 'Similar C' }
    ]
  }
}

// Adicionar mais municípios para chegar próximo de 853
const additionalMunicipalities = Array.from({ length: 843 }, (_, i) => generateMockMunicipality(i + 11))

export const ALL_MOCK_MUNICIPALITIES: Municipality[] = [...MOCK_MUNICIPALITIES, ...additionalMunicipalities]

// Função para calcular KPIs
export function calculateKpis(municipalities: Municipality[]) {
  const kpis = {
    consolidar: { count: 0, potentialVotes: 0 },
    conquistar: { count: 0, potentialVotes: 0 },
    disputar: { count: 0, potentialVotes: 0 },
    evitar: { count: 0, potentialVotes: 0 }
  }

  municipalities.forEach(m => {
    kpis[m.classification].count++
    kpis[m.classification].potentialVotes += m.potentialVotes
  })

  return kpis
}
