import type { Channel, Opponent, SavedScenario, SimulatorState } from '../types'

export const CHANNELS: Channel[] = [
  {
    id: 'midia-local',
    label: 'Midia local (radio + outdoor)',
    description: 'Radio comunitaria, outdoors e paineis em cidades-chave',
    defaultActive: true,
  },
  {
    id: 'porta-a-porta',
    label: 'Porta-a-porta',
    description: 'Equipe de campo para contato direto com eleitores',
    defaultActive: true,
  },
  {
    id: 'eventos',
    label: 'Eventos e comicios',
    description: 'Comicios, encontros com liderancas e eventos comunitarios',
    defaultActive: true,
  },
  {
    id: 'midia-digital',
    label: 'Midia digital',
    description: 'Anuncios em redes sociais, YouTube e Google',
    defaultActive: false,
  },
  {
    id: 'caravana',
    label: 'Caravana de campanha',
    description: 'Caravana itinerante percorrendo municipios do interior',
    defaultActive: false,
  },
]

export const OPPONENTS: Opponent[] = [
  {
    id: 'esquerda',
    name: 'Carla Moreira',
    party: 'Partido dos Trabalhadores',
    partyAcronym: 'PT',
  },
  {
    id: 'direita',
    name: 'Andre Costa',
    party: 'Partido Liberal',
    partyAcronym: 'PL',
  },
  {
    id: 'centro',
    name: 'Mauro Viana',
    party: 'Movimento Democratico Brasileiro',
    partyAcronym: 'MDB',
  },
]

export const DEFAULT_SIMULATOR_STATE: SimulatorState = {
  budget: 220000,
  focusCapital: 40,
  activeChannels: ['midia-local', 'porta-a-porta', 'eventos'],
  selectedOpponent: 'esquerda',
}

export const DEFAULT_SAVED_SCENARIOS: SavedScenario[] = [
  {
    id: 'base',
    name: 'Cenario Base',
    emoji: '📌',
    state: {
      budget: 100000,
      focusCapital: 50,
      activeChannels: ['midia-local', 'porta-a-porta'],
      selectedOpponent: 'esquerda',
    },
    projectedVotes: 100000,
  },
  {
    id: 'moderado',
    name: 'Cenario Moderado',
    emoji: '⚡',
    state: {
      budget: 220000,
      focusCapital: 40,
      activeChannels: ['midia-local', 'porta-a-porta', 'eventos'],
      selectedOpponent: 'esquerda',
    },
    projectedVotes: 142000,
  },
  {
    id: 'agressivo',
    name: 'Cenario Agressivo',
    emoji: '🚀',
    state: {
      budget: 450000,
      focusCapital: 30,
      activeChannels: ['midia-local', 'porta-a-porta', 'eventos', 'midia-digital', 'caravana'],
      selectedOpponent: 'esquerda',
    },
    projectedVotes: 178000,
  },
]
