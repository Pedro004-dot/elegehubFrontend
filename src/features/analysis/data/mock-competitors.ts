import type { Competitor } from '../types'

export const MOCK_COMPETITORS: Competitor[] = [
  {
    id: '1',
    name: 'Carla Moreira',
    party: 'Partido dos Trabalhadores',
    partyAcronym: 'PT',
    photoUrl: null,
    age: 52,
    currentPosition: 'Deputada Estadual',
    profession: 'Professora',
    education: 'Mestrado em Educacao - UFMG',
    regionalBase: 'Vale do Aco',
    politicalSpectrum: 'esquerda',
    threatLevel: 'ALTA',
    lastElection: {
      year: 2022,
      position: 'Deputada Estadual',
      votes: 128400,
      totalSpending: 1800000,
      costPerVote: 14.02,
      result: 'eleito',
      stateRanking: 7,
    },
    territorialPresence: [
      {
        regionName: 'Ipatinga',
        votes: 45200,
        percentage: 35.2,
        coordinates: [-19.4689, -42.5367],
      },
      {
        regionName: 'Coronel Fabriciano',
        votes: 22100,
        percentage: 17.2,
        coordinates: [-19.5186, -42.6286],
      },
      {
        regionName: 'Timoteo',
        votes: 18600,
        percentage: 14.5,
        coordinates: [-19.5833, -42.6439],
      },
      {
        regionName: 'Belo Horizonte',
        votes: 15800,
        percentage: 12.3,
        coordinates: [-19.9167, -43.9345],
      },
      {
        regionName: 'Contagem',
        votes: 8200,
        percentage: 6.4,
        coordinates: [-19.9386, -44.0539],
      },
    ],
    strengths: [
      {
        id: 's1',
        title: 'Base sindical consolidada',
        description:
          'Apoio forte dos sindicatos da industria metalurgica e construcao civil no Vale do Aco',
      },
      {
        id: 's2',
        title: 'Presenca em midia regional',
        description:
          'Exposicao frequente em 3 radios e 1 portal de noticias local',
      },
      {
        id: 's3',
        title: 'Rede de vereadores aliados',
        description: '12 vereadores aliados na regiao do Vale do Aco',
      },
    ],
    opportunities: [
      {
        id: 'o1',
        title: 'Bandeira ambiental fraca',
        description:
          'Pouca atuacao em pautas ambientais, tema crescente na regiao mineradora',
      },
      {
        id: 'o2',
        title: 'Baixa presenca digital',
        description:
          'Apenas 8k seguidores no Instagram, comunicacao digital defasada',
      },
      {
        id: 'o3',
        title: 'Ausencia no agronegocio',
        description:
          'Nao dialoga com setor rural, perdeu 11 das 14 cidades do Triangulo em 2022',
      },
    ],
    spendingHistory: [
      { category: 'pessoal', label: 'Pessoal', amount: 540000, percentage: 30 },
      { category: 'midia', label: 'Midia', amount: 380000, percentage: 21.1 },
      { category: 'eventos', label: 'Eventos', amount: 320000, percentage: 17.8 },
      {
        category: 'material',
        label: 'Material Grafico',
        amount: 290000,
        percentage: 16.1,
      },
      {
        category: 'transporte',
        label: 'Transporte',
        amount: 180000,
        percentage: 10,
      },
      { category: 'outros', label: 'Outros', amount: 90000, percentage: 5 },
    ],
    suggestedStrategies: [
      {
        id: 'st1',
        emoji: '1.',
        title: 'Concentre energia onde ela e ausente',
        description:
          'Triangulo Mineiro tem 870k eleitores e baixa presenca petista - terreno aberto para consolidacao.',
      },
      {
        id: 'st2',
        emoji: '2.',
        title: 'Reforce sua narrativa em agronegocio',
        description:
          'Carla perdeu 11 das 14 cidades grandes do Triangulo em 2022 - eleitor rural nao a aceitou.',
      },
      {
        id: 'st3',
        emoji: '3.',
        title: 'Evite confronto direto no Vale do Aco',
        description:
          'Custo de disputa alto, base dela e consolidada. Melhor focar em consolidar suas proprias areas.',
      },
    ],
  },
  {
    id: '2',
    name: 'Andre Costa',
    party: 'Partido Liberal',
    partyAcronym: 'PL',
    photoUrl: null,
    age: 49,
    currentPosition: 'Vereador - Belo Horizonte',
    profession: 'Empresario',
    education: 'Superior Completo - Administracao',
    regionalBase: 'Grande BH',
    politicalSpectrum: 'direita',
    threatLevel: 'MEDIA',
    lastElection: {
      year: 2024,
      position: 'Vereador',
      votes: 12400,
      totalSpending: 450000,
      costPerVote: 36.29,
      result: 'eleito',
      stateRanking: 15,
    },
    territorialPresence: [
      {
        regionName: 'Belo Horizonte',
        votes: 8200,
        percentage: 66.1,
        coordinates: [-19.9167, -43.9345],
      },
      {
        regionName: 'Contagem',
        votes: 1800,
        percentage: 14.5,
        coordinates: [-19.9386, -44.0539],
      },
      {
        regionName: 'Betim',
        votes: 1200,
        percentage: 9.7,
        coordinates: [-19.9678, -44.1983],
      },
      {
        regionName: 'Nova Lima',
        votes: 720,
        percentage: 5.8,
        coordinates: [-19.9856, -43.8467],
      },
    ],
    strengths: [
      {
        id: 's1',
        title: 'Base evangelica forte',
        description:
          'Vinculo consolidado com igrejas evangelicas da Grande BH',
      },
      {
        id: 's2',
        title: 'Presenca digital crescente',
        description: '85k seguidores no Instagram, engajamento alto em videos',
      },
      {
        id: 's3',
        title: 'Apoio do bolsonarismo',
        description:
          'Alinhamento com liderancas bolsonaristas estaduais',
      },
    ],
    opportunities: [
      {
        id: 'o1',
        title: 'Experiencia legislativa limitada',
        description:
          'Primeiro mandato como vereador, pouco historico de entregas',
      },
      {
        id: 'o2',
        title: 'Concentracao geografica',
        description:
          'Votos concentrados apenas na capital, sem penetracao no interior',
      },
      {
        id: 'o3',
        title: 'Custo por voto elevado',
        description:
          'Gastou R$36 por voto em 2024, eficiencia questionavel',
      },
    ],
    spendingHistory: [
      { category: 'midia', label: 'Midia', amount: 180000, percentage: 40 },
      { category: 'pessoal', label: 'Pessoal', amount: 112500, percentage: 25 },
      { category: 'eventos', label: 'Eventos', amount: 90000, percentage: 20 },
      {
        category: 'material',
        label: 'Material Grafico',
        amount: 45000,
        percentage: 10,
      },
      {
        category: 'transporte',
        label: 'Transporte',
        amount: 22500,
        percentage: 5,
      },
    ],
    suggestedStrategies: [
      {
        id: 'st1',
        emoji: '1.',
        title: 'Questione a experiencia legislativa',
        description:
          'Destaque seu historico de entregas versus o mandato inicial dele sem realizacoes concretas.',
      },
      {
        id: 'st2',
        emoji: '2.',
        title: 'Dispute o interior do estado',
        description:
          'Andre nao tem presenca fora da capital - oportunidade para consolidar o voto interiorano.',
      },
      {
        id: 'st3',
        emoji: '3.',
        title: 'Explore eficiencia de campanha',
        description:
          'Seu custo por voto pode ser 3x menor - use isso como argumento de gestao.',
      },
    ],
  },
  {
    id: '3',
    name: 'Mauro Viana',
    party: 'Movimento Democratico Brasileiro',
    partyAcronym: 'MDB',
    photoUrl: null,
    age: 58,
    currentPosition: null,
    profession: 'Advogado',
    education: 'Doutorado em Direito Publico - PUC Minas',
    regionalBase: 'Sul de Minas',
    politicalSpectrum: 'centro',
    threatLevel: 'MEDIA',
    lastElection: {
      year: 2018,
      position: 'Deputado Estadual',
      votes: 92300,
      totalSpending: 1200000,
      costPerVote: 13.0,
      result: 'eleito',
      stateRanking: 12,
    },
    territorialPresence: [
      {
        regionName: 'Varginha',
        votes: 28500,
        percentage: 30.9,
        coordinates: [-21.5514, -45.4303],
      },
      {
        regionName: 'Pouso Alegre',
        votes: 18200,
        percentage: 19.7,
        coordinates: [-22.2297, -45.9364],
      },
      {
        regionName: 'Pocos de Caldas',
        votes: 15600,
        percentage: 16.9,
        coordinates: [-21.7878, -46.5614],
      },
      {
        regionName: 'Lavras',
        votes: 12100,
        percentage: 13.1,
        coordinates: [-21.2458, -45.0],
      },
      {
        regionName: 'Tres Coracoes',
        votes: 8400,
        percentage: 9.1,
        coordinates: [-21.6942, -45.2553],
      },
    ],
    strengths: [
      {
        id: 's1',
        title: 'Tradicao politica familiar',
        description:
          'Familia com 3 geracoes na politica do Sul de Minas, nome reconhecido',
      },
      {
        id: 's2',
        title: 'Rede de prefeitos aliados',
        description:
          '8 prefeitos do Sul de Minas sao aliados historicos',
      },
      {
        id: 's3',
        title: 'Experiencia legislativa',
        description:
          '2 mandatos como deputado estadual, conhece a maquina publica',
      },
    ],
    opportunities: [
      {
        id: 'o1',
        title: 'Desgaste por afastamento',
        description:
          'Ficou fora da politica em 2022, eleitores podem ter esquecido',
      },
      {
        id: 'o2',
        title: 'Imagem de politica antiga',
        description:
          'Perfil tradicional pode nao atrair eleitor jovem',
      },
      {
        id: 'o3',
        title: 'Partido em crise',
        description:
          'MDB passa por momento de baixa popularidade nacional',
      },
    ],
    spendingHistory: [
      { category: 'pessoal', label: 'Pessoal', amount: 420000, percentage: 35 },
      { category: 'eventos', label: 'Eventos', amount: 300000, percentage: 25 },
      { category: 'midia', label: 'Midia', amount: 240000, percentage: 20 },
      {
        category: 'transporte',
        label: 'Transporte',
        amount: 144000,
        percentage: 12,
      },
      {
        category: 'material',
        label: 'Material Grafico',
        amount: 96000,
        percentage: 8,
      },
    ],
    suggestedStrategies: [
      {
        id: 'st1',
        emoji: '1.',
        title: 'Apresente-se como renovacao',
        description:
          'Contraste sua proposta moderna com a imagem tradicional do adversario.',
      },
      {
        id: 'st2',
        emoji: '2.',
        title: 'Foque no eleitor jovem',
        description:
          'Mauro tem dificuldade com sub-35. Comunicacao digital pode conquistar esse publico.',
      },
      {
        id: 'st3',
        emoji: '3.',
        title: 'Explore o periodo fora',
        description:
          'Questione o que ele fez nos ultimos 4 anos enquanto estava fora do mandato.',
      },
    ],
  },
  {
    id: '4',
    name: 'Patricia Almeida',
    party: 'Partido Socialismo e Liberdade',
    partyAcronym: 'PSOL',
    photoUrl: null,
    age: 38,
    currentPosition: 'Vereadora - Belo Horizonte',
    profession: 'Socióloga',
    education: 'Mestrado em Ciencias Sociais - UFMG',
    regionalBase: 'Belo Horizonte',
    politicalSpectrum: 'esquerda',
    threatLevel: 'BAIXA',
    lastElection: {
      year: 2024,
      position: 'Vereadora',
      votes: 18200,
      totalSpending: 280000,
      costPerVote: 15.38,
      result: 'eleito',
      stateRanking: 8,
    },
    territorialPresence: [
      {
        regionName: 'Belo Horizonte - Centro Sul',
        votes: 7800,
        percentage: 42.9,
        coordinates: [-19.9311, -43.9378],
      },
      {
        regionName: 'Belo Horizonte - Pampulha',
        votes: 4200,
        percentage: 23.1,
        coordinates: [-19.8517, -43.9733],
      },
      {
        regionName: 'Belo Horizonte - Savassi',
        votes: 3100,
        percentage: 17.0,
        coordinates: [-19.9375, -43.9361],
      },
      {
        regionName: 'Contagem',
        votes: 1800,
        percentage: 9.9,
        coordinates: [-19.9386, -44.0539],
      },
    ],
    strengths: [
      {
        id: 's1',
        title: 'Engajamento em redes sociais',
        description:
          '120k seguidores no Instagram, alto engajamento com publico jovem',
      },
      {
        id: 's2',
        title: 'Pauta ambiental forte',
        description:
          'Referencia em sustentabilidade e meio ambiente na ALMG',
      },
      {
        id: 's3',
        title: 'Base universitaria',
        description:
          'Forte apoio entre estudantes e professores universitarios',
      },
    ],
    opportunities: [
      {
        id: 'o1',
        title: 'Nicho muito especifico',
        description:
          'Eleitorado concentrado em perfil urbano, escolarizado, classe media',
      },
      {
        id: 'o2',
        title: 'Partido pequeno',
        description:
          'PSOL tem estrutura limitada, pouco tempo de TV e fundo partidario',
      },
      {
        id: 'o3',
        title: 'Rejeicao no interior',
        description:
          'Pautas progressistas tem baixa aceitacao fora da capital',
      },
    ],
    spendingHistory: [
      { category: 'midia', label: 'Midia', amount: 112000, percentage: 40 },
      { category: 'pessoal', label: 'Pessoal', amount: 70000, percentage: 25 },
      { category: 'eventos', label: 'Eventos', amount: 56000, percentage: 20 },
      {
        category: 'material',
        label: 'Material Grafico',
        amount: 28000,
        percentage: 10,
      },
      {
        category: 'transporte',
        label: 'Transporte',
        amount: 14000,
        percentage: 5,
      },
    ],
    suggestedStrategies: [
      {
        id: 'st1',
        emoji: '1.',
        title: 'Nao dispute o mesmo eleitorado',
        description:
          'O nicho dela e restrito. Foque em expandir para perfis que ela nao alcanca.',
      },
      {
        id: 'st2',
        emoji: '2.',
        title: 'Consolide presenca no interior',
        description:
          'Patricia tem zero presenca fora de BH - todo o interior esta disponivel.',
      },
      {
        id: 'st3',
        emoji: '3.',
        title: 'Evite polarizacao ideologica',
        description:
          'Nao entre em debates que a favorecam. Foque em propostas praticas.',
      },
    ],
  },
  {
    id: '5',
    name: 'Roberto Fernandes',
    party: 'Partido Social Democratico',
    partyAcronym: 'PSD',
    photoUrl: null,
    age: 45,
    currentPosition: 'Deputado Estadual',
    profession: 'Medico',
    education: 'Residencia em Cardiologia - Hospital das Clinicas',
    regionalBase: 'Triangulo Mineiro',
    politicalSpectrum: 'centro-direita',
    threatLevel: 'ALTA',
    lastElection: {
      year: 2022,
      position: 'Deputado Estadual',
      votes: 115600,
      totalSpending: 2100000,
      costPerVote: 18.17,
      result: 'eleito',
      stateRanking: 9,
    },
    territorialPresence: [
      {
        regionName: 'Uberlandia',
        votes: 42300,
        percentage: 36.6,
        coordinates: [-18.9186, -48.2772],
      },
      {
        regionName: 'Uberaba',
        votes: 28100,
        percentage: 24.3,
        coordinates: [-19.7472, -47.9392],
      },
      {
        regionName: 'Patos de Minas',
        votes: 15800,
        percentage: 13.7,
        coordinates: [-18.5789, -46.5181],
      },
      {
        regionName: 'Ituiutaba',
        votes: 12400,
        percentage: 10.7,
        coordinates: [-18.9689, -49.4642],
      },
      {
        regionName: 'Araguari',
        votes: 8200,
        percentage: 7.1,
        coordinates: [-18.6486, -48.1872],
      },
    ],
    strengths: [
      {
        id: 's1',
        title: 'Prestigio profissional',
        description:
          'Reconhecido cardiologista, credibilidade alta em saude publica',
      },
      {
        id: 's2',
        title: 'Dominio regional',
        description:
          'Base consolidada no Triangulo Mineiro, maior regiao economica do interior',
      },
      {
        id: 's3',
        title: 'Articulacao com agronegocio',
        description:
          'Bom relacionamento com produtores rurais e cooperativas',
      },
    ],
    opportunities: [
      {
        id: 'o1',
        title: 'Pouca presenca na capital',
        description:
          'Apenas 3% dos votos vieram de Belo Horizonte',
      },
      {
        id: 'o2',
        title: 'Dependencia de uma regiao',
        description:
          '75% dos votos concentrados no Triangulo - vulneravel se perder a base',
      },
      {
        id: 'o3',
        title: 'Comunicacao tradicional',
        description:
          'Pouco presente em redes sociais, depende de midia tradicional',
      },
    ],
    spendingHistory: [
      { category: 'midia', label: 'Midia', amount: 840000, percentage: 40 },
      { category: 'pessoal', label: 'Pessoal', amount: 525000, percentage: 25 },
      { category: 'eventos', label: 'Eventos', amount: 378000, percentage: 18 },
      {
        category: 'transporte',
        label: 'Transporte',
        amount: 231000,
        percentage: 11,
      },
      {
        category: 'material',
        label: 'Material Grafico',
        amount: 126000,
        percentage: 6,
      },
    ],
    suggestedStrategies: [
      {
        id: 'st1',
        emoji: '1.',
        title: 'Dispute a capital',
        description:
          'BH tem 2.5M de eleitores e Roberto tem presenca minima - oportunidade clara.',
      },
      {
        id: 'st2',
        emoji: '2.',
        title: 'Invista em presenca digital',
        description:
          'Enquanto ele depende de TV e radio, redes sociais podem alcançar eleitores mais jovens.',
      },
      {
        id: 'st3',
        emoji: '3.',
        title: 'Diversifique sua base geografica',
        description:
          'Se voce tambem depende de uma regiao, a disputa sera de soma zero. Expanda.',
      },
    ],
  },
]
