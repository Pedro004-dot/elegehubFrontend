import type { BrazilState } from '@/features/map/types'

export const BRAZIL_STATES: BrazilState[] = [
  { uf: 'AC', ibgeCode: 12, name: 'Acre', capital: 'Rio Branco', region: 'Norte', municipalityCount: 22, centerCoordinates: [-70.5, -9.0], zoom: 6 },
  { uf: 'AL', ibgeCode: 27, name: 'Alagoas', capital: 'Maceió', region: 'Nordeste', municipalityCount: 102, centerCoordinates: [-36.6, -9.5], zoom: 7 },
  { uf: 'AM', ibgeCode: 13, name: 'Amazonas', capital: 'Manaus', region: 'Norte', municipalityCount: 62, centerCoordinates: [-64.0, -4.0], zoom: 5 },
  { uf: 'AP', ibgeCode: 16, name: 'Amapá', capital: 'Macapá', region: 'Norte', municipalityCount: 16, centerCoordinates: [-51.0, 1.5], zoom: 6 },
  { uf: 'BA', ibgeCode: 29, name: 'Bahia', capital: 'Salvador', region: 'Nordeste', municipalityCount: 417, centerCoordinates: [-41.5, -12.5], zoom: 6 },
  { uf: 'CE', ibgeCode: 23, name: 'Ceará', capital: 'Fortaleza', region: 'Nordeste', municipalityCount: 184, centerCoordinates: [-39.5, -5.5], zoom: 7 },
  { uf: 'DF', ibgeCode: 53, name: 'Distrito Federal', capital: 'Brasília', region: 'Centro-Oeste', municipalityCount: 1, centerCoordinates: [-47.9, -15.8], zoom: 10 },
  { uf: 'ES', ibgeCode: 32, name: 'Espírito Santo', capital: 'Vitória', region: 'Sudeste', municipalityCount: 78, centerCoordinates: [-40.5, -19.8], zoom: 7 },
  { uf: 'GO', ibgeCode: 52, name: 'Goiás', capital: 'Goiânia', region: 'Centro-Oeste', municipalityCount: 246, centerCoordinates: [-49.5, -16.0], zoom: 6 },
  { uf: 'MA', ibgeCode: 21, name: 'Maranhão', capital: 'São Luís', region: 'Nordeste', municipalityCount: 217, centerCoordinates: [-45.0, -5.5], zoom: 6 },
  { uf: 'MG', ibgeCode: 31, name: 'Minas Gerais', capital: 'Belo Horizonte', region: 'Sudeste', municipalityCount: 853, centerCoordinates: [-44.5, -18.5], zoom: 6 },
  { uf: 'MS', ibgeCode: 50, name: 'Mato Grosso do Sul', capital: 'Campo Grande', region: 'Centro-Oeste', municipalityCount: 79, centerCoordinates: [-55.0, -21.0], zoom: 6 },
  { uf: 'MT', ibgeCode: 51, name: 'Mato Grosso', capital: 'Cuiabá', region: 'Centro-Oeste', municipalityCount: 141, centerCoordinates: [-55.0, -13.0], zoom: 5 },
  { uf: 'PA', ibgeCode: 15, name: 'Pará', capital: 'Belém', region: 'Norte', municipalityCount: 144, centerCoordinates: [-52.0, -4.0], zoom: 5 },
  { uf: 'PB', ibgeCode: 25, name: 'Paraíba', capital: 'João Pessoa', region: 'Nordeste', municipalityCount: 223, centerCoordinates: [-36.5, -7.0], zoom: 7 },
  { uf: 'PE', ibgeCode: 26, name: 'Pernambuco', capital: 'Recife', region: 'Nordeste', municipalityCount: 185, centerCoordinates: [-37.5, -8.5], zoom: 7 },
  { uf: 'PI', ibgeCode: 22, name: 'Piauí', capital: 'Teresina', region: 'Nordeste', municipalityCount: 224, centerCoordinates: [-43.0, -7.5], zoom: 6 },
  { uf: 'PR', ibgeCode: 41, name: 'Paraná', capital: 'Curitiba', region: 'Sul', municipalityCount: 399, centerCoordinates: [-51.5, -24.5], zoom: 7 },
  { uf: 'RJ', ibgeCode: 33, name: 'Rio de Janeiro', capital: 'Rio de Janeiro', region: 'Sudeste', municipalityCount: 92, centerCoordinates: [-43.0, -22.5], zoom: 8 },
  { uf: 'RN', ibgeCode: 24, name: 'Rio Grande do Norte', capital: 'Natal', region: 'Nordeste', municipalityCount: 167, centerCoordinates: [-36.5, -5.8], zoom: 7 },
  { uf: 'RO', ibgeCode: 11, name: 'Rondônia', capital: 'Porto Velho', region: 'Norte', municipalityCount: 52, centerCoordinates: [-63.0, -10.5], zoom: 6 },
  { uf: 'RR', ibgeCode: 14, name: 'Roraima', capital: 'Boa Vista', region: 'Norte', municipalityCount: 15, centerCoordinates: [-61.0, 2.5], zoom: 6 },
  { uf: 'RS', ibgeCode: 43, name: 'Rio Grande do Sul', capital: 'Porto Alegre', region: 'Sul', municipalityCount: 497, centerCoordinates: [-53.0, -29.5], zoom: 6 },
  { uf: 'SC', ibgeCode: 42, name: 'Santa Catarina', capital: 'Florianópolis', region: 'Sul', municipalityCount: 295, centerCoordinates: [-50.0, -27.5], zoom: 7 },
  { uf: 'SE', ibgeCode: 28, name: 'Sergipe', capital: 'Aracaju', region: 'Nordeste', municipalityCount: 75, centerCoordinates: [-37.5, -10.5], zoom: 8 },
  { uf: 'SP', ibgeCode: 35, name: 'São Paulo', capital: 'São Paulo', region: 'Sudeste', municipalityCount: 645, centerCoordinates: [-48.5, -22.5], zoom: 7 },
  { uf: 'TO', ibgeCode: 17, name: 'Tocantins', capital: 'Palmas', region: 'Norte', municipalityCount: 139, centerCoordinates: [-48.0, -10.0], zoom: 6 }
]

export const MG_REGIONS = [
  'Central',
  'Norte de Minas',
  'Sul de Minas',
  'Triângulo Mineiro',
  'Zona da Mata',
  'Vale do Aço',
  'Vale do Jequitinhonha',
  'Vale do Mucuri',
  'Noroeste de Minas',
  'Campo das Vertentes',
  'Oeste de Minas'
]

export const POPULATION_SIZES = [
  { id: 'capital', label: 'Capital', minPop: 2000000 },
  { id: 'above500k', label: 'Acima de 500k', minPop: 500000, maxPop: 2000000 },
  { id: '200to500k', label: '200k - 500k', minPop: 200000, maxPop: 500000 },
  { id: '100to200k', label: '100k - 200k', minPop: 100000, maxPop: 200000 },
  { id: '50to100k', label: '50k - 100k', minPop: 50000, maxPop: 100000 },
  { id: 'below50k', label: 'Até 50k', maxPop: 50000 }
]
