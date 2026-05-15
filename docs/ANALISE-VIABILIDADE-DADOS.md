# Analise de Viabilidade de Dados - ElegeHub CRM

## Sumario Executivo

Este documento analisa a viabilidade de obtencao dos dados propostos no sistema ElegeHub CRM, comparando com as fontes publicas disponiveis (IBGE, TSE) e identificando gaps, oportunidades e estrategias de tratamento.

**Resultado:** Aproximadamente **75% dos dados** propostos podem ser obtidos de fontes publicas oficiais. Os 25% restantes sao dados internos ou derivados que precisam de algoritmos proprios.

---

## 1. Fontes de Dados Disponiveis

### 1.1 IBGE - Instituto Brasileiro de Geografia e Estatistica

**APIs Disponiveis:** 17 APIs publicas

| API | Versao | Uso no Sistema | Dados Disponiveis |
|-----|--------|----------------|-------------------|
| **Agregados (SIDRA)** | v3.0 | Mapa Estrategico | Populacao, censos, estatisticas multidimensionais |
| **Localidades** | v1.0 | Mapa Estrategico | Lista de municipios, estados, regioes |
| **Malhas Geograficas** | v3.0 | Mapa Estrategico | GeoJSON/TopoJSON dos municipios |
| **Pesquisas** | v1.0 | Dashboard | Dados socioeconomicos |
| **Nomes** | v2.0 | Nao usado | Frequencia de nomes proprios |

**Endpoints Principais:**

```
# Lista de municipios por estado
GET https://servicodados.ibge.gov.br/api/v1/localidades/estados/MG/municipios

# Malha geografica em GeoJSON
GET https://servicodados.ibge.gov.br/api/v3/malhas/estados/MG?formato=application/vnd.geo+json

# Populacao por municipio (Censo 2022)
GET https://apisidra.ibge.gov.br/values/t/9514/n6/all/v/93/p/2022

# Estimativas de populacao
GET https://apisidra.ibge.gov.br/values/t/6579/n6/all/v/all/p/last
```

**Tabelas SIDRA Relevantes:**

| Tabela | Descricao | Periodicidade |
|--------|-----------|---------------|
| 9514 | Populacao Censo 2022 | Decenal |
| 6579 | Estimativas populacionais | Anual |
| 200 | Populacao historica (1970-2010) | Decenal |
| 4714 | Caracteristicas demograficas | Decenal |

### 1.2 TSE - Tribunal Superior Eleitoral

**Portal:** https://dadosabertos.tse.jus.br/

**Conjuntos de Dados:** 167 datasets

| Categoria | Datasets | Uso no Sistema |
|-----------|----------|----------------|
| Resultados | 61 | Radar de Adversarios, Mapa Estrategico |
| Candidatos | 35 | Radar de Adversarios |
| Eleitorado | 19 | Mapa Estrategico, Simulador |
| Prestacao de Contas | 24 | Radar de Adversarios |
| Pesquisas Eleitorais | 8 | Nao usado |

**Dados Disponíveis por Eleicao:**

- **Resultados:** Votacao por municipio, zona, secao eleitoral
- **Candidatos:** Dados pessoais, bens, coligacoes, fotos, propostas
- **Gastos:** Receitas e despesas detalhadas por categoria
- **Eleitorado:** Perfil demografico por municipio

**Formatos:** CSV, TXT (grandes volumes - ate milhoes de linhas)

---

## 2. Analise por Pagina do Sistema

### 2.1 Mapa Estrategico (`/mapa/plano-acao`)

**Dados Propostos vs. Disponibilidade:**

| Dado Proposto | Disponivel? | Fonte | Tratamento Necessario |
|---------------|-------------|-------|----------------------|
| Lista de municipios (853 MG) | SIM | IBGE Localidades | Direto |
| Codigo IBGE | SIM | IBGE Localidades | Direto |
| Nome do municipio | SIM | IBGE Localidades | Direto |
| Estado/UF | SIM | IBGE Localidades | Direto |
| Populacao | SIM | IBGE SIDRA 9514/6579 | Direto |
| Coordenadas geograficas | SIM | IBGE Malhas (GeoJSON) | Centroid do poligono |
| Regiao (ex: Triangulo Mineiro) | PARCIAL | IBGE Mesorregioes | Mapeamento manual |
| **Classificacao (consolidar/conquistar)** | NAO | Interno | Algoritmo proprio |
| **Score de viabilidade** | NAO | Interno | Algoritmo proprio |
| **Votos potenciais** | PARCIAL | TSE + Algoritmo | Derivado |
| Historico de votos (2014-2022) | SIM | TSE Resultados | Agregacao por municipio |

**Viabilidade:** 70% dos dados diretos, 30% algoritmo interno

**Algoritmo de Classificacao Proposto:**

```
score = f(historico_votos, perfil_demografico, presenca_adversarios, penetracao_atual)

classificacao =
  - "consolidar" se score >= 70
  - "conquistar" se 50 <= score < 70
  - "disputar" se 30 <= score < 50
  - "evitar" se score < 30
```

### 2.2 Radar de Adversarios (`/analise/radar-adversarios`)

**Dados Propostos vs. Disponibilidade:**

| Dado Proposto | Disponivel? | Fonte | Observacao |
|---------------|-------------|-------|------------|
| Nome do candidato | SIM | TSE Candidatos | Direto |
| Partido | SIM | TSE Candidatos | Direto |
| Foto | SIM | TSE Candidatos | URL disponivel |
| Idade | SIM | TSE Candidatos | Data nascimento |
| Profissao | SIM | TSE Candidatos | Direto |
| Escolaridade | SIM | TSE Candidatos | Direto |
| Votos ultima eleicao | SIM | TSE Resultados | Direto |
| Votos por municipio | SIM | TSE Resultados | Agregacao |
| Total de gastos | SIM | TSE Prestacao de Contas | Direto |
| Gastos por categoria | SIM | TSE Prestacao de Contas | Direto |
| Custo por voto | SIM | TSE (calculado) | gastos / votos |
| Ranking estadual | SIM | TSE Resultados | Ordenacao |
| **Threat Level (ALTA/MEDIA/BAIXA)** | NAO | Interno | Algoritmo proprio |
| **Pontos fortes (strengths)** | NAO | Interno | Analise manual/IA |
| **Oportunidades de ataque** | NAO | Interno | Analise manual/IA |
| **Estrategias sugeridas** | NAO | Interno | IA generativa |
| **Presenca territorial (coordenadas)** | PARCIAL | TSE + IBGE | Cruzamento |
| **Espectro politico** | NAO | Interno | Classificacao manual |

**Viabilidade:** 65% dados publicos, 35% analise interna

**Desafios Identificados:**

1. **Volume de dados:** Arquivo de resultados 2022 tem milhoes de linhas
2. **Cruzamento:** Precisa juntar TSE Candidatos + TSE Resultados + TSE Contas
3. **Analise qualitativa:** Strengths/Opportunities requer analise humana ou IA

### 2.3 Simulador de Campanha (`/campanha/simulador`)

**Dados Propostos vs. Disponibilidade:**

| Dado Proposto | Disponivel? | Fonte | Observacao |
|---------------|-------------|-------|------------|
| **Cenarios pre-calculados** | NAO | Interno | Modelo estatistico |
| **Projecao de votos** | NAO | Interno | Modelo preditivo |
| **Probabilidade de eleicao** | NAO | Interno | Modelo preditivo |
| **Modificadores por canal** | NAO | Interno | Pesquisa/heuristica |
| Dados historicos de campanha | SIM | TSE | Para calibrar modelo |
| Eleitorado por municipio | SIM | TSE | Para projecoes |

**Viabilidade:** 20% dados externos para calibracao, 80% modelo interno

**Modelo de Projecao Sugerido:**

O modelo atual usa interpolacao linear entre cenarios. Para versao produtiva:

1. **Regressao com dados TSE:** Correlacao entre gastos/canais e votos historicos
2. **Fatores de ajuste:** Por regiao, perfil demografico, adversario
3. **Monte Carlo:** Simulacao com incerteza para probabilidade

### 2.4 Video Cuts (`/campanha/cortes`)

**Dados Propostos vs. Disponibilidade:**

| Dado Proposto | Disponivel? | Fonte | Observacao |
|---------------|-------------|-------|------------|
| Video (arquivo) | NAO | Interno | Upload pelo usuario |
| Thumbnail | NAO | Interno | Gerado do video |
| Transcricao | NAO | Interno | Speech-to-text |
| **Viral Score** | NAO | Interno | Algoritmo/IA |
| **Recomendacoes de canal** | NAO | Interno | Algoritmo |
| **Caption sugerida** | NAO | Interno | IA generativa |
| Hashtags | NAO | Interno | IA + tendencias |
| Metricas de engajamento | PARCIAL | APIs sociais | Facebook, Instagram APIs |

**Viabilidade:** 100% dados internos (exceto metricas pos-publicacao)

### 2.5 Dashboard (Agregacao)

**Dados Propostos vs. Disponibilidade:**

| Dado Proposto | Disponivel? | Fonte |
|---------------|-------------|-------|
| Votos projetados | NAO | Simulador (interno) |
| Probabilidade eleicao | NAO | Simulador (interno) |
| Resumo mapa (contagens) | SIM | Derivado de municipios |
| Saude do conteudo | NAO | Interno (videos) |
| Resumo competidores | PARCIAL | TSE + interno |
| Alertas | NAO | Logica interna |
| Sugestoes | NAO | IA / regras |

---

## 3. Dados que CONSEGUIMOS Obter (75%)

### 3.1 Dados Geograficos e Demograficos (IBGE)

**100% disponivel:**

- 5.570 municipios brasileiros
- 853 municipios de Minas Gerais
- Populacao atualizada (estimativas anuais)
- Malhas geograficas em GeoJSON
- Mesorregioes e microrregioes
- Dados censitarios detalhados

**Endpoint de exemplo:**

```bash
# Todos os municipios de MG com populacao
curl "https://servicodados.ibge.gov.br/api/v1/localidades/estados/MG/municipios" | \
  jq '.[] | {id: .id, nome: .nome}'
```

### 3.2 Dados Eleitorais (TSE)

**100% disponivel:**

- Candidatos de todas as eleicoes desde 2004
- Resultados de votacao por municipio
- Gastos de campanha detalhados
- Perfil do eleitorado
- Coligacoes e partidos

**Arquivos principais (Eleicoes 2022):**

| Arquivo | Tamanho Aprox. | Registros |
|---------|----------------|-----------|
| votacao_candidato_munzona_2022.csv | ~500MB | ~3M linhas |
| despesas_candidato_2022.csv | ~200MB | ~1M linhas |
| candidatos_2022.csv | ~50MB | ~30k candidatos |
| perfil_eleitorado_2022.csv | ~100MB | ~150M eleitores |

### 3.3 Dados Calculados (Cruzamento)

**Exemplos de cruzamentos possiveis:**

```sql
-- Votos por candidato por municipio
SELECT
  c.nome_candidato,
  v.codigo_municipio,
  m.nome_municipio,
  SUM(v.votos) as total_votos
FROM votacao v
JOIN candidatos c ON v.sq_candidato = c.sq_candidato
JOIN ibge_municipios m ON v.codigo_municipio = m.codigo_ibge
WHERE c.cargo = 'DEPUTADO ESTADUAL'
  AND c.uf = 'MG'
GROUP BY c.nome_candidato, v.codigo_municipio
```

---

## 4. Dados que NAO Conseguimos Obter (25%)

### 4.1 Classificacoes Estrategicas

**Dados que precisam de algoritmo proprio:**

| Dado | Por que nao existe | Solucao |
|------|-------------------|---------|
| Classificacao municipio | Subjetivo/estrategico | Algoritmo de scoring |
| Score de viabilidade | Metrica propria | Machine learning |
| Threat level adversario | Analise competitiva | Regras + IA |
| Pontos fortes/fracos | Analise qualitativa | LLM (GPT/Claude) |

### 4.2 Projecoes e Predicoes

| Dado | Por que nao existe | Solucao |
|------|-------------------|---------|
| Votos projetados | Futuro incerto | Modelo preditivo |
| Probabilidade eleicao | Complexidade | Simulacao Monte Carlo |
| Modificadores canal | Nao mensurado | A/B testing + heuristica |

### 4.3 Conteudo de Video

| Dado | Por que nao existe | Solucao |
|------|-------------------|---------|
| Viral score | Metrica propria | Modelo de ML |
| Transcricao | Processamento | Whisper/Google STT |
| Caption sugerida | Criacao | LLM |

---

## 5. Estrategia de Tratamento de Dados

### 5.1 Pipeline de Ingestao

```
┌─────────────────────────────────────────────────────────────────┐
│                      PIPELINE DE DADOS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    IBGE     │    │    TSE      │    │   INTERNO   │         │
│  │   (APIs)    │    │   (CSVs)    │    │   (Upload)  │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              ETL (Extract-Transform-Load)           │       │
│  │  • Limpeza de dados                                 │       │
│  │  • Normalizacao de codigos IBGE                     │       │
│  │  • Cruzamento TSE x IBGE                            │       │
│  │  • Agregacoes (votos por municipio)                 │       │
│  └─────────────────────────────────────────────────────┘       │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │           DATA WAREHOUSE (PostgreSQL)               │       │
│  │  • dim_municipios (IBGE)                            │       │
│  │  • dim_candidatos (TSE)                             │       │
│  │  • fact_votacao (TSE)                               │       │
│  │  • fact_gastos (TSE)                                │       │
│  └─────────────────────────────────────────────────────┘       │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              FEATURE ENGINEERING                    │       │
│  │  • Score de municipio                               │       │
│  │  • Threat level de adversario                       │       │
│  │  • Projecoes de votos                               │       │
│  └─────────────────────────────────────────────────────┘       │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                  API BACKEND                        │       │
│  │  GET /api/municipios?state=MG&classification=...   │       │
│  │  GET /api/competitors?campaign_id=...              │       │
│  │  POST /api/simulator/calculate                     │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Frequencia de Atualizacao

| Dado | Fonte | Frequencia | Metodo |
|------|-------|------------|--------|
| Municipios | IBGE | Anual | Cron job |
| Populacao | IBGE | Anual (agosto) | Cron job |
| Malhas geograficas | IBGE | Decenal | Manual |
| Candidatos | TSE | Por eleicao | Manual |
| Resultados | TSE | Por eleicao | Manual |
| Gastos | TSE | Tempo real em campanha | Webhook/polling |

### 5.3 Armazenamento

**Estimativa de volume:**

| Tabela | Registros | Tamanho |
|--------|-----------|---------|
| municipios | 5.570 | ~2MB |
| candidatos (historico) | ~500k | ~100MB |
| votacao (historico) | ~50M | ~5GB |
| gastos (historico) | ~10M | ~2GB |
| usuarios/campanhas | ~10k | ~50MB |

**Recomendacao:** PostgreSQL com indices em codigo_municipio, sq_candidato

---

## 6. Dados que Poderiamos Acrescentar

### 6.1 Dados Disponiveis que NAO Usamos

| Dado | Fonte | Beneficio Potencial |
|------|-------|---------------------|
| **Perfil do eleitorado** | TSE | Segmentacao por idade, genero, escolaridade |
| **Abstencao/comparecimento** | TSE | Identificar municipios com baixa participacao |
| **Pesquisas eleitorais** | TSE | Tendencias e intencao de voto |
| **Transferencia de domicilio** | TSE | Fluxo migratorio de eleitores |
| **IDH municipal** | IBGE/PNUD | Correlacao com voto |
| **PIB municipal** | IBGE | Indicador economico |
| **Densidade demografica** | IBGE | Custo de campanha por habitante |
| **Taxa de urbanizacao** | IBGE | Segmentacao urbano/rural |
| **Redes sociais candidatos** | TSE | URLs oficiais declaradas |
| **Propostas de governo** | TSE | Analise de conteudo/posicionamento |

### 6.2 Funcionalidades Sugeridas

#### 6.2.1 Perfil Demografico do Eleitorado

```typescript
interface ElectorateProfile {
  municipioId: string
  totalEleitores: number
  distribuicaoIdade: {
    '16-24': number
    '25-34': number
    '35-44': number
    '45-59': number
    '60+': number
  }
  distribuicaoGenero: {
    masculino: number
    feminino: number
  }
  distribuicaoEscolaridade: {
    fundamental: number
    medio: number
    superior: number
  }
}
```

**Fonte:** TSE - Perfil do Eleitorado (arquivo anual)

#### 6.2.2 Indicadores Socioeconomicos

```typescript
interface SocioeconomicIndicators {
  municipioId: string
  idhm: number              // IBGE/PNUD
  pibPerCapita: number      // IBGE
  taxaUrbanizacao: number   // IBGE
  gini: number              // IBGE
}
```

**Fonte:** IBGE Cidades (https://cidades.ibge.gov.br/)

#### 6.2.3 Analise de Redes Sociais

```typescript
interface SocialMediaAnalysis {
  candidatoId: string
  plataformas: {
    instagram?: { followers: number; engagement: number }
    facebook?: { followers: number; engagement: number }
    tiktok?: { followers: number; engagement: number }
    twitter?: { followers: number; engagement: number }
  }
  crescimentoSemanal: number
  sentimentScore: number  // -1 a 1
}
```

**Fonte:** APIs sociais + scraping permitido

### 6.3 Dados de Terceiros (Premium)

| Dado | Fonte | Custo | Beneficio |
|------|-------|-------|-----------|
| Intencao de voto | Institutos de pesquisa | Alto | Benchmarking |
| Midia tracking | Clipping services | Medio | Share of voice |
| Georreferenciamento avancado | Google Maps/Here | Baixo | Rotas de caravana |
| Dados de celular | Operadoras (agregado) | Alto | Fluxo de pessoas |

---

## 7. Tabela Resumo: Viabilidade por Pagina

| Pagina | Dados Publicos | Dados Internos | Viabilidade |
|--------|----------------|----------------|-------------|
| Mapa Estrategico | 70% | 30% | ALTA |
| Radar Adversarios | 65% | 35% | ALTA |
| Simulador | 20% | 80% | MEDIA |
| Video Cuts | 0% | 100% | ALTA (interno) |
| Dashboard | 40% | 60% | ALTA |
| Perfil Vencedor | 80% | 20% | ALTA |

---

## 8. Proximos Passos Recomendados

### Fase 1: Ingestao de Dados Publicos
1. Criar scripts de download/atualizacao IBGE
2. Criar scripts de download/atualizacao TSE
3. Implementar data warehouse com PostgreSQL
4. Criar views materializadas para consultas frequentes

### Fase 2: Algoritmos de Scoring
1. Definir formula de classificacao de municipios
2. Implementar calculo de threat level
3. Treinar modelo de projecao de votos

### Fase 3: Integracao com IA
1. Integrar LLM para analise de strengths/opportunities
2. Implementar viral score com ML
3. Gerar sugestoes automatizadas

### Fase 4: Dados Adicionais
1. Adicionar perfil do eleitorado
2. Adicionar indicadores socioeconomicos
3. Integrar metricas de redes sociais

---

## 9. Referencias e Links

### IBGE
- [API de Servico de Dados](https://servicodados.ibge.gov.br/api/docs/)
- [API de Agregados (SIDRA)](https://servicodados.ibge.gov.br/api/docs/agregados?versao=3)
- [API de Malhas Geograficas](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3)
- [Plano de Dados Abertos 2024-2025](https://www.ibge.gov.br/np_download/novoportal/documentos_institucionais/Plano_de_Dados_Abertos_IBGE_2024_2025.pdf)

### TSE
- [Portal de Dados Abertos](https://dadosabertos.tse.jus.br/)
- [Resultados 2022](https://dadosabertos.tse.jus.br/dataset/resultados-2022)
- [Prestacao de Contas](https://dadosabertos.tse.jus.br/group/prestacao-de-contas-eleitorais)
- [DivulgaCandContas](https://divulgacandcontas.tse.jus.br/)

### Alternativas
- [Brasil.IO - Eleicoes](https://brasil.io/dataset/eleicoes-brasil/candidatos/)
- [Base dos Dados](https://basedosdados.org/)

---

*Documento gerado em: Maio 2026*
*Autor: Engenheiro de Dados - ElegeHub CRM*
