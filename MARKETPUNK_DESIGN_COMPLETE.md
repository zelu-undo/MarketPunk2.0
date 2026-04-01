# 🎮 MarketPunk - Documento de Design Completo

## Arquitetura de Jogo v1.1

---

# PARTE I: ECONOMIA E PRODUÇÃO

## 1. VISÃO GERAL DO SISTEMA

Este documento define a economia completa do MarketPunk, um jogo de gestão industrial com mercado player-driven. O sistema é projetado para ser vivo, interdependente e sem acúmulo infinito de produtos.

**Premissas de Design:**
- ~50+ recursos organizados em 5 tiers
- Cadeias interconectadas com múltiplos caminhos
- Loop fechado com dissipação de calor (evita energia infinita)
- Driver econômico: População + Credits
- Todos os produtos finais têm sinks reais
- Balanceamento: complexidade e tempo aumentam com tier
- Sistema de manutenção integrado
- Sistema de logística baseado em rotas
- Mercado player-driven

---

## 2. RESUMO DA ESTRUTURA DE PRODUÇÃO

```
TIER 1 (Recursos Brutos)          │ 15 recursos
TIER 2 (Processamento Básico)   │ 10 receitas
TIER 3 (Materiais Industriais)    │ 14 receitas
TIER 4 (Componentes Intermediários)│ 12 receitas
TIER 5 (Produtos Finais + Manut.)  │ 13 receitas
────────────────────────────────────────────────
TOTAL                            │ ~54 recursos+receitas
```

---

## 3. TIER 1 - RECURSOS BRUTOS

Recursos extraídos diretamente da natureza. Coleta rápido, baixa complexidade, alto volume.

| # | Recurso | Coleta Base | Complexidade | Notas | Escassez |
|---|--------|-------------|-------------|-------|----------|
| 1.1 | Wood | Manual | 1 | Renewable (plantações) | Alta |
| 1.2 | Stone | Mineração | 1 | Abundante | Alta |
| 1.3 | Iron Ore | Mineração | 2 | Veias médias | Média |
| 1.4 | Coal | Mineração | 2 | Veias médias | Média |
| 1.5 | Sand | Extração | 1 | Abundante | Alta |
| 1.6 | Water | Extração | 1 | Abundante | Alta |
| 1.7 | Copper Ore | Mineração | 3 | Veias escassas | Baixa |
| 1.8 | Limestone | Mineração | 2 | Occasional | Média |
| 1.9 | Crude Oil | Extração | 3 | Poços limitados | Baixa |
| 1.10 | Sulfur | Mineração profunda | 3 | Veias profundas | Baixa |
| 1.11 | Clay | Extração superficial | 1 | Occasional | Média |
| 1.12 | Lead | Mineração | 3 | Veias médias | Média |
| 1.13 | Gold | Mineração | 4 | Muito raro | Muito Baixa |
| 1.14 | Uranium | Mineração | 4 | Raro | Muito Baixa |
| 1.15 | Thorium | Mineração | 5 | Muito raro | Extrema |

**Design Notes:**
- Wood regenera com plantações (mecânica de renewable)
- Minérios radioativos (Uranium, Thorium) requerem:
  - Equipamento especial (Lead Shielding)
  - Tempo de exposição limitado (radiação)
  - Zona segura distante da base

---

## 4. TIER 2 - PROCESSAMENTO BÁSICO

### 2.1 - Lumber (Madeira Processada)
```
INPUTS:  3x Wood
OUTPUT: 1x Lumber
TIME:   3s | COMPLEXITY: 2
```
> Subproduto: 1x Sawdust

### 2.2 - Stone Block (Bloco de Pedra)
```
INPUTS:  2x Stone
OUTPUT: 1x Stone Block
TIME:   4s | COMPLEXITY: 2
```

### 2.3 - Iron Ingot (Lingote de Ferro)
```
INPUTS:  2x Iron Ore + 1x Coal (fuel)
OUTPUT: 1x Iron Ingot
TIME:   8s | COMPLEXITY: 3
```
> Subproduto: 1x Slag

### 2.4 - Copper Ingot (Lingote de Cobre)
```
INPUTS:  2x Copper Ore + 1x Coal (fuel)
OUTPUT: 1x Copper Ingot
TIME:   8s | COMPLEXITY: 3
```
> Subproduto: 1x Slag

### 2.5 - Coal Brick (Carvão Processado)
```
INPUTS:  2x Coal
OUTPUT: 1x Coal Brick
TIME:   3s | COMPLEXITY: 2
```

### 2.6 - Glass Sheet (Folha de Vidro)
```
INPUTS:  3x Sand + 2x Coal Brick (fuel)
OUTPUT: 1x Glass Sheet
TIME:   12s | COMPLEXITY: 4
```
> Subproduto: Heat (50 units) - REQUER DISSIPAÇÃO!

### 2.7 - Purified Water (Água Purificada)
```
INPUTS:  5x Water + 1x Sand (filtro)
OUTPUT: 2x Purified Water
TIME:   5s | COMPLEXITY: 2
```

### 2.8 - Quicklime (Cal Rápida)
```
INPUTS:  3x Limestone
OUTPUT: 2x Quicklime
TIME:   10s | COMPLEXITY: 3
```

### 2.9 - Charcoal (Carvão Vegetal) - ALTERNATIVA
```
INPUTS:  3x Wood
OUTPUT: 1x Charcoal
TIME:   6s | COMPLEXITY: 2
```
> Alternativa: Wood → Charcoal vs Coal Mining

### 2.10 - Crude Oil Extract (Extrato de Petróleo Bruto)
```
INPUTS:  1x Crude Oil
OUTPUT: 1x Crude Oil Extract
TIME:   4s | COMPLEXITY: 3
```

---

## 5. TIER 3 - MATERIAIS INDUSTRIAIS

### 5.1 - Steel (Aço) - MÚLTIPLOS CAMINHOS

**Caminho A: Basic Steel**
```
INPUTS:  2x Iron Ingot + 1x Coal Brick (fuel)
OUTPUT: 1x Steel
TIME:   15s | COMPLEXITY: 4
```
> Subproduto: Heat (100 units) - REQUER DISSIPAÇÃO!

**Caminho B: High-Carbon Steel (+25% durabilidade)**
```
INPUTS:  2x Iron Ingot + 2x Coal Brick + 1x Copper Ingot
OUTPUT: 1x Steel (High-Carbon)
TIME:   20s | COMPLEXITY: 5
```

### 5.2 - Steel Sheet
```
INPUTS:  2x Steel
OUTPUT: 1x Steel Sheet
TIME:   8s | COMPLEXITY: 4
```

### 5.3 - Steel Pipe
```
INPUTS:  2x Steel
OUTPUT: 2x Steel Pipe
TIME:   10s | COMPLEXITY: 4
```

### 5.4 - Copper Wire
```
INPUTS:  1x Copper Ingot
OUTPUT: 3x Copper Wire
TIME:   6s | COMPLEXITY: 3
```

### 5.5 - Plastic - MÚLTIPLOS CAMINHOS

**Caminho A: Refinaria**
```
INPUTS:  3x Crude Oil Extract
OUTPUT: 2x Plastic
TIME:   18s | COMPLEXITY: 5
```
> Subprodutos: 1x Fuel Oil + 1x Gas

**Caminho B: Biomass (renewable)**
```
INPUTS:  5x Wood + 2x Coal Brick
OUTPUT: 1x Plastic
TIME:   25s | COMPLEXITY: 5
```

### 5.6 - Rubber
```
INPUTS:  3x Plastic
OUTPUT: 2x Rubber
TIME:   8s | COMPLEXITY: 4
```

### 5.7 - Cement
```
INPUTS:  2x Quicklime + 2x Sand + 1x Slag
OUTPUT: 3x Cement
TIME:   14s | COMPLEXITY: 4
```
> USA SUBDUTO (Slag) - INTERDEPENDÊNCIA!

### 5.8 - Brick
```
INPUTS:  3x Clay (ou 3x Sand) + 1x Quicklime
OUTPUT: 4x Brick
TIME:   10s | COMPLEXITY: 4
```

### 5.9 - Aluminum Ingot
```
INPUTS:  3x Limestone + 2x Coal Brick + 1x Copper Wire
OUTPUT: 1x Aluminum Ingot
TIME:   22s | COMPLEXITY: 5
```
> Gera Heat (200 units) - MUITO ALTO!

### 5.10 - Chemical Resin
```
INPUTS:  2x Coal + 1x Water
OUTPUT: 1x Chemical Resin
TIME:   12s | COMPLEXITY: 4
```

### 5.11 - Fuel Oil
```
INPUTS:  2x Crude Oil Extract
OUTPUT: 1x Fuel Oil
TIME:   10s | COMPLEXITY: 4
```

### 5.12 - Sulfuric Acid
```
INPUTS:  2x Sulfur + 1x Quicklime
OUTPUT: 2x Sulfuric Acid
TIME:   16s | COMPLEXITY: 5
```

### 5.13 - Lead Ingot
```
INPUTS:  2x Lead + 1x Coal Brick (fuel)
OUTPUT: 1x Lead Ingot
TIME:   10s | COMPLEXITY: 4
```

### 5.14 - Graphite
```
INPUTS:  2x Coal + 1x Coal Brick + 1x Lead Ingot
OUTPUT: 1x Graphite
TIME:   15s | COMPLEXITY: 5
```

---

## 6. TIER 4 - COMPONENTES INTERMEDIÁRIOS

### 6.1 - Gears
```
INPUTS:  1x Steel → OUTPUT: 3x Gear | TIME: 6s | COMPLEXITY: 4
```

### 6.2 - Bearings
```
INPUTS:  2x Steel + 1x Copper Wire → OUTPUT: 2x Bearing | TIME: 10s | COMPLEXITY: 5
```

### 6.3 - Electric Motor
```
INPUTS:  2x Steel Sheet + 3x Copper Wire + 1x Magnetic Steel
OUTPUT: 1x Electric Motor | TIME: 18s | COMPLEXITY: 6
```
> CRÍTICO: máquinas requerem

### 6.4 - Magnetic Steel
```
INPUTS:  2x Steel + 1x Iron Ingot → OUTPUT: 1x Magnetic Steel | TIME: 14s | COMPLEXITY: 5
```

### 6.5 - Integrated Circuit - MÚLTIPLOS CAMINHOS

**Basic IC**
```
INPUTS:  2x Copper Wire + 1x Plastic + 1x Chemical Resin
OUTPUT: 1x Integrated Circuit | TIME: 20s | COMPLEXITY: 6
```

**Advanced IC (+30% eficiência)**
```
INPUTS:  1x Integrated Circuit + 1x Gold Filament + 1x Aluminum Ingot
OUTPUT: 1x Advanced IC | TIME: 30s | COMPLEXITY: 7
```

### 6.6 - PCB
```
INPUTS:  2x Plastic + 3x Copper Wire + 1x Chemical Resin
OUTPUT: 1x PCB | TIME: 15s | COMPLEXITY: 5
```

### 6.7 - Pipe Assembly
```
INPUTS:  4x Steel Pipe + 2x Rubber + 1x Steel Sheet
OUTPUT: 1x Pipe Assembly | TIME: 12s | COMPLEXITY: 5
```

### 6.8 - Gearbox
```
INPUTS:  4x Gear + 2x Bearing + 1x Steel Sheet
OUTPUT: 1x Gearbox | TIME: 16s | COMPLEXITY: 6
```

### 6.9 - Control Unit
```
INPUTS:  2x Integrated Circuit + 1x PCB + 2x Copper Wire
OUTPUT: 1x Control Unit | TIME: 22s | COMPLEXITY: 6
```
> CRÍTICO: automação

### 6.10 - Battery
```
INPUTS:  2x Lead Ingot + 1x Sulfuric Acid + 1x Plastic
OUTPUT: 1x Battery | TIME: 14s | COMPLEXITY: 5
```

### 6.11 - Solar Cell
```
INPUTS:  2x Glass Sheet + 1x Copper Wire + 1x Aluminum Ingot
OUTPUT: 1x Solar Cell | TIME: 25s | COMPLEXITY: 7
```

### 6.12 - Heat Exchanger
```
INPUTS:  2x Steel Pipe + 1x Steel Sheet + 1x Copper Wire
OUTPUT: 1x Heat Exchanger | TIME: 18s | COMPLEXITY: 6
```
> Recupera Heat (50% eficiência)

---

## 7. TIER 4B - MANUTENÇÃO E CONSUMÍVEIS

### 7.13 - Lubricant
```
INPUTS:  1x Rubber + 1x Plastic → OUTPUT: 2x Lubricant | TIME: 8s | COMPLEXITY: 4
```
> Consumido: 1x/fábrica/dia

### 7.14 - Coolant
```
INPUTS:  2x Purified Water + 1x Chemical Resin → OUTPUT: 2x Coolant | TIME: 12s | COMPLEXITY: 5
```
> Consumido: 1x/nuclear/dia

### 7.15 - Spare Parts
```
INPUTS:  2x Gear + 1x Bearing + 1x Steel Sheet → OUTPUT: 3x Spare Parts | TIME: 15s | COMPLEXITY: 5
```
> Consumido conforme uso

### 7.16 - Gold Filament
```
INPUTS:  1x Gold + 1x Chemical Resin → OUTPUT: 2x Gold Filament | TIME: 20s | COMPLEXITY: 6
```

---

## 8. TIER 5 - PRODUTOS FINAIS

### 8.1 - Industrial Equipment

**Basic Factory Machine**
```
INPUTS:  3x Steel Sheet + 2x Gearbox + 1x Electric Motor
OUTPUT: 1x Basic Factory Machine | TIME: 45s | COMPLEXITY: 8
```
> MANUTENÇÃO: 1 Lubricant/dia

**Advanced Factory Machine**
```
INPUTS:  2x Basic Factory Machine + 1x Control Unit + 1x Advanced IC
OUTPUT: 1x Advanced Factory Machine | TIME: 60s | COMPLEXITY: 9
```
> Velocidade +50%, eficiência +25%

### 8.2 - Electronics

**Basic Electronics**
```
INPUTS:  2x Integrated Circuit + 1x PCB + 1x Plastic Case
OUTPUT: 1x Basic Electronics | TIME: 30s | COMPLEXITY: 7
```

**Advanced Electronics**
```
INPUTS:  2x Advanced IC + 1x Control Unit + 1x Battery
OUTPUT: 1x Advanced Electronics | TIME: 50s | COMPLEXITY: 9
```

### 8.3 - Consumer Goods

**Food Ration**
```
INPUTS:  2x Purified Water + 3x Wood → OUTPUT: 4x Food Ration | TIME: 15s | COMPLEXITY: 5
```

**Medical Supply**
```
INPUTS:  1x Chemical Resin + 1x Purified Water + 1x Plastic
OUTPUT: 2x Medical Supply | TIME: 25s | COMPLEXITY: 7
```

**Comfort Item**
```
INPUTS:  1x Lumber + 1x Plastic + 1x Copper Wire
OUTPUT: 1x Comfort Item | TIME: 20s | COMPLEXITY: 6
```
> SINK: População consome

### 8.4 - Construction Materials

**Building Block**
```
INPUTS:  2x Brick + 1x Cement + 1x Steel Sheet → OUTPUT: 3x Building Block | TIME: 20s | COMPLEXITY: 6
```

**Steel Frame**
```
INPUTS:  4x Steel Sheet + 2x Steel Pipe → OUTPUT: 1x Steel Frame | TIME: 30s | COMPLEXITY: 7
```

**Reinforced Glass**
```
INPUTS:  3x Glass Sheet + 1x Chemical Resin → OUTPUT: 2x Reinforced Glass | TIME: 25s | COMPLEXITY: 7
```

### 8.5 - Fuel Rod

**Basic Fuel Rod**
```
INPUTS:  3x Steel + 2x Uranium + 1x Lead Ingot → OUTPUT: 1x Basic Fuel Rod | TIME: 40s | COMPLEXITY: 8
```

**Advanced Fuel Rod**
```
INPUTS:  2x Basic Fuel Rod + 1x Thorium + 1x Graphite
OUTPUT: 1x Advanced Fuel Rod | TIME: 55s | COMPLEXITY: 9
```
> SINK: Durabilidade 100h

### 8.6 - Vehicles

**Basic Vehicle**
```
INPUTS:  4x Steel Frame + 2x Gearbox + 4x Rubber + 1x Electric Motor
OUTPUT: 1x Basic Vehicle | TIME: 50s | COMPLEXITY: 8
```

**Transport Truck**
```
INPUTS:  2x Basic Vehicle + 1x Battery + 1x Control Unit
OUTPUT: 1x Transport Truck | TIME: 70s | COMPLEXITY: 9
```
> MANUTENÇÃO: 1 Spare Parts/1000km

### 8.7 - Tool Sets

**Basic Tool Set**
```
INPUTS:  2x Steel + 1x Lumber + 1x Rubber → OUTPUT: 1x Basic Tool Set | TIME: 18s | COMPLEXITY: 5
```

**Advanced Tool Set**
```
INPUTS:  2x Basic Tool Set + 1x Electric Motor + 1x Battery
OUTPUT: 1x Advanced Tool Set | TIME: 35s | COMPLEXITY: 8
```

### 8.8 - Power Generators

**Coal Power Plant** (200 kWh)
```
INPUTS:  4x Steel + 2x Steel Pipe + 2x Gearbox → OUTPUT: 1x | TIME: 35s | COMPLEXITY: 6
```

**Diesel Generator** (1000 kWh)
```
INPUTS:  3x Steel + 2x Gearbox + 1x Fuel Oil → OUTPUT: 1x | TIME: 40s | COMPLEXITY: 8
```

**Solar Power Array** (500 kWh)
```
INPUTS:  6x Solar Cell + 2x Steel Frame + 1x Control Unit → OUTPUT: 1x | TIME: 60s | COMPLEXITY: 9
```

**Wind Turbine** (300 kWh)
```
INPUTS: 4x Steel + 3x Gearbox + 2x Magnetic Steel → OUTPUT: 1x | TIME: 45s | COMPLEXITY: 7
```

**Nuclear Reactor** (5000 kWh)
```
INPUTS: 4x Steel + 2x Heat Exchanger + 1x Basic Fuel Rod
OUTPUT: 1x Nuclear Reactor | TIME: 80s | COMPLEXITY: 10
```
> MANUTENÇÃO: 1 Spare Parts + 1 Coolant/500h

### 8.9 - Automation Controllers

**Basic Automation**
```
INPUTS: 2x Control Unit + 1x Basic Electronics + 1x Copper Wire
OUTPUT: 1x Basic Automation | TIME: 35s | COMPLEXITY: 8
```

**Advanced Automation**
```
INPUTS: 2x Basic Automation + 1x Advanced Electronics + 1x Control Unit
OUTPUT: 1x Advanced Automation | TIME: 50s | COMPLEXITY: 9
```

### 8.10 - Packaging

**Shipping Crate**
```
INPUTS: 2x Lumber + 1x Plastic + 1x Iron Ingot → OUTPUT: 3x | TIME: 12s | COMPLEXITY: 5
```

**Pallet**
```
INPUTS: 4x Lumber + 2x Steel Sheet → OUTPUT: 1x | TIME: 15s | COMPLEXITY: 5
```

---

## 9. SISTEMA DE ENERGIA

### GERAÇÃO
| Fonte | Output | Custo Build | Custo Operação |
|-------|--------|------------|------------------|
| Coal Power Plant | 200 kWh | 200 | 2 Coal/h |
| Diesel Generator | 1000 kWh | 500 | 5 Fuel/h |
| Solar Power Array | 500 kWh | 1000 | 0 |
| Wind Turbine | 300 kWh | 300 | 0 |
| Nuclear Reactor | 5000 kWh | 5000 | 1 Fuel Rod/100h |

### CONSUMO POR TIER
| Tier | Consumo Base |
|------|------------|
| T1 | 0 |
| T2 | 50 kWh |
| T3 | 200 kWh |
| T4 | 500 kWh |
| T5 | 1000 kWh |

---

## 10. SISTEMA DE HEAT (REBALANCEADO)

### Fontes de Heat
| Fonte | Heat Gera | Dissipação Requer | Custo |
|-------|-----------|------------------|-------|
| Glass Sheet | 50 units | 25 units | 2 Water |
| Steel | 100 units | 50 units | 5 Water |
| Aluminum | 200 units | 100 units | 10 Water |
| Nuclear | 500 units | 250 units | 25 Water + 1 Lead |

### Regras:
1. **Capacidade máxima**: 1000 units
2. **Dissipação passiva**: 10 units/s com água
3. **Sem dissipação por 60s**: Overheat → máquinas param

---

## 11. SUBPRODUTOS E INTERDEPENDÊNCIAS

| Processo | Subproduto | Uso |
|----------|-----------|-----|
| Lumber | Sawdust | Compost |
| Iron Ingot | Slag | Cement |
| Glass | Heat | Heat Exchanger |
| Steel | Heat | Heat Exchanger |
| Aluminum | Heat | Heat Exchanger |
| Refinaria | Gas | Chemical |

---

## 12. SINKS (CONSUMO REAL)

### Sinks Principais
| Produto | Sink | Taxa |
|---------|------|------|
| Food Ration | População | 1/10pop/dia |
| Comfort Item | População | 1/10pop/semana |
| Medical Supply | Hospitais | 1/pop/mês |
| Construction | Bases | 10-50/construção |
| Factory Machine | Expansão | 1/fábrica |
| Fuel Rod | Usinas | 1/100h |
| Vehicle | Logística | 1/1000km |

### Sinks de Manutenção
| Item | Decaimento | Requer |
|------|------------|--------|
| Factory Machine | 1%/dia | Lubricant |
| Electric Motor | 2%/dia | Lubricant |
| Vehicle | 0.5%/100km | Spare Parts |
| Nuclear Reactor | 0.1%/dia | Spare + Coolant |

---

## 13. BALANCEAMENTO

### Tempo por Tier
| Tier | Mín | Típ | Máx |
|------|-----|-----|-----|
| T1 | 2s | 5s | 10s |
| T2 | 3s | 8s | 15s |
| T3 | 8s | 15s | 25s |
| T4 | 12s | 22s | 35s |
| T5 | 25s | 50s | 90s |

### Margem Esperada
| Tier | Mín | Típ | Máx |
|------|-----|-----|-----|
| T1 | 5% | 15% | 25% |
| T2 | 10% | 25% | 40% |
| T3 | 20% | 40% | 60% |
| T4 | 30% | 55% | 80% |
| T5 | 50% | 75% | 120% |

---

# PARTE II: POPULAÇÃO E ECONOMIA

## 14. SISTEMA DE POPULAÇÃO

### Ciclo
```
POPULAÇÃO
├── Precisa: Food + Comfort + Medical
├── Trabalha: nas fábricas
└── Gera: Credits (impostos + venda)
    └── Usa: construir + manutenção + pesquisa
```

### Crescimento
| Construção | Crescimento | Requer |
|------------|-------------|--------|
| Houses | +10 pop/dia | Food |
| Apartments | +50 pop/dia | Food + Comfort |
| Luxury Housing | +100 pop/dia | Food + Comfort + Medical |

### Demanda por Habitante
| Recurso | Taxa | Prioridade |
|--------|------|-----------|
| Food Ration | 1/dia | CRÍTICA |
| Comfort Item | 1/semana | Média |
| Medical Supply | 1/mês | Baixa |

---

## 15. CREDITS (MOEDA)

### Fontes
| Fonte | Taxa |
|-------|------|
| Venda de bens | 95% preço |
| Impostos industriais | 10% |
| Missões | Variável |

### Usos
| Destino | Custo |
|--------|------|
| Terreno/Base | 1000+ |
| Construção | Variável |
| Manutenção | 10-100/dia |
| Salário Workers | 50/dia |
| Pesquisa | 500-5000 |

---

# PARTE III: LOGÍSTICA BASEADA EM ROTAS

## 16. ARQUITETURA DO SISTEMA DE LOGÍSTICA

### 16.1 Paradigma: Rotas > Caminhões Individuais

**PROBLEMA**: Gerenciar 100+ caminhões individualmente = microgerenciamento tedioso

**SOLUÇÃO**: Sistema baseado em ROTAS onde:
- Caminhões são recursos abstratos alocados às rotas
- O sistema escala automaticamente
- Jogador define: rotas, prioridades, quantidade de caminhões

### 16.2 Estrutura de Dados

```typescript
// Entidade principal: Rota
interface Route {
  id: string;
  name: string;
  
  // Identificação dos pontos
  origin: Location;
  destination: Location;
  
  // O que está sendo transportado
  resourceType: ResourceType;
  resourceAmount: number;
  
  // Controle
  priority: Priority;
  status: RouteStatus;
  
  // Caminhões alocados (ABSTRADOS)
  trucksAllocated: number;
  
  // Métricas
  capacityPerTick: number;
  currentLoad: number;
  
  // Complexidade (para tempo de transporte)
  complexity: number; // número de etapas
}

// Localização (origem/destino)
interface Location {
  id: string;
  type: 'warehouse' | 'producer' | 'consumer';
  position: Vector2D;
  inventory: Inventory;
}

// Status da rota
type RouteStatus = 'active' | 'paused' | 'blocked' | 'inefficient';

// Prioridade para alocação de caminhões
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

### 16.3 Sistema de Tempo Baseado em Complexidade

**FÓRMULA**:
```
tempo_total = tempo_base + (complexidade × fator_complexidade)

Onde:
- tempo_base = 3 segundos (mínimo)
- fator_complexidade = 1.0s por etapa
- complexidade = número de etapas na rota
```

**Exemplos**:
| Rota | Complexidade | Tempo Total |
|------|-------------|-------------|
| Wood → Lumber | 1 | 4s |
| Iron → Steel | 1 | 4s |
| Iron → Steel → Gears → Machine | 3 | 6s |
| Iron → Steel → Motor → Vehicle | 4 | 7s |

### 16.4 Ciclo de Entrega

```
A) ROTA SIMPLES (A → B → A):
   [ORIGEM] carregar → transportar → [DESTINO] descarregar → retornar → carregar...

B) ROTA COMPLEXA (múltiplos pontos):
   [A] carregar → [B] descarregar+carregar → [C] descarregar+carregar → [D] → retornar
```

**Cada tick**:
1. Verificar se origem tem recursos
2. Se tem: carregar (até capacidade)
3. Transportar (tempo baseado em complexidade)
4. Verificar se destino tem espaço
5. Se tem: descarregar
6. Retornar (ou ciclo completo)

### 16.5 Abstraindo Caminhões

```typescript
// Sistema global de caminhões
interface LogisticsSystem {
  // TOTAL de caminhões disponíveis (global)
  totalTrucks: number;
  availableTrucks: number;
  
  // Distribuição por rota
  distribution: Map<routeId, number>;
  
  // Capacidade por caminhão (FIXA - não aumenta com mais caminhões)
  TRUCK_CAPACITY: 100;
  TRUCK_BASE_SPEED: 1; // tick base
}

// Como funciona:
// - 1 caminhão = 100 unidades/tick
// - 2 camiones = 200 unidades/tick (MAS mesmo tempo!)
// - NÃO aumenta velocidade, apenas capacidade
```

### 16.6 Detecção de Gargalos

```typescript
interface RouteMetrics {
  id: string;
  
  // Throughput
  throughput: number;        // unidades/tick efetiva
  efficiency: number;         // 0-100%
  
  // Estados
  status: RouteStatus;
  bottleneck: BottleneckType | null;
  
  // Tempo
  idleTime: number;          // tempo ocioso (sem recurso)
  transportTime: number;    // tempo em transporters
  
  // Alertas
  alerts: RouteAlert[];
}

type BottleneckType = 
  | 'no_resource_at_origin'      // origem sem recurso
  | 'destination_full'         // destino cheio
  | 'no_trucks'                 // sem caminhões alocados
  | 'path_blocked';             // rota bloqueada

type RouteAlert = 
  | 'low_efficiency'
  | 'high_demand'
  | 'resource_shortage'
  | 'destination_saturated';
```

### 16.7 Sistema de Prioridade

```typescript
// Alocação de caminhões POR PRIORIDADE
// HIGHER priority = recebe caminhões PRIMEIRO

// ORDEM:
// 1. CRITICAL (sempre priorizado)
// 2. HIGH
// 3. MEDIUM
// 4. LOW

// Se há 10 caminhões disponíveis e 3 rotas:
// - Rota A (CRITICAL): 6 caminhões
// - Rota B (HIGH): 3 caminhões
// - Rota C (MEDIUM): 1 caminhão

// Redistribuição automática:
// SE:
//   - prioridade muda
//   - gargalo detectado
//   - nova rota criada
// ENTÃO:
//   - recalcular alocação baseado em prioridades
```

### 16.8 Regras Automatizadas

```typescript
// Rules Engine - JSON-based
interface LogisticsRule {
  id: string;
  name: string;
  enabled: boolean;
  
  // Condição (avaliada a cada tick)
  condition: RuleCondition;
  
  // Ação se condição verdade
  action: RuleAction;
  
  // Cooldown (evitar spam)
  cooldown: number;
  lastRun: number;
}

// Exemplos de condições
interface RuleCondition {
  type: 'resource_level' | 'efficiency' | 'status' | 'custom';
  
  // Para resource_level:
  resourceId: string;
  locationId: string;
  threshold: number;        // < ou >
  comparison: '<' | '>';
  
  // Para efficiency:
  routeId: string;
  efficiencyThreshold: number;
  
  // Para status:
  routeId: string;
  statusMatch: RouteStatus;
}

// Exemplos de ações
interface RuleAction {
  type: 'add_trucks' | 'remove_trucks' | 'set_priority' | 'pause' | 'activate';
  
  // Para add/remove trucks:
  routeId: string;
  amount: number;
  
  // Para set_priority:
  routeId: string;
  newPriority: Priority;
}

// EXEMPLO: JSON de regra
{
  "id": "rule_001",
  "name": "Aumentar Trucks se Estoque Baixo",
  "enabled": true,
  "condition": {
    "type": "resource_level",
    "resourceId": "iron_ingot",
    "locationId": "warehouse_north",
    "threshold": 100,
    "comparison": "<"
  },
  "action": {
    "type": "add_trucks",
    "routeId": "iron_to_steel",
    "amount": 2
  },
  "cooldown": 60  // 60 ticks (1 minuto) mínimo
}

// OUTRO EXEMPLO:
{
  "id": "rule_002",
  "name": "Pausar se效率<50%",
  "enabled": true,
  "condition": {
    "type": "efficiency",
    "routeId": "wood_to_lumber",
    "efficiencyThreshold": 50
  },
  "action": {
    "type": "pause",
    "routeId": "wood_to_lumber"
  },
  "cooldown": 120
}
```

### 16.9 Templates de Rotas

```typescript
interface RouteTemplate {
  id: string;
  name: string;
  description: string;
  
  // Configuração (sem IDs específicos)
  originType: 'warehouse' | 'producer';
  destinationType: 'warehouse' | 'producer' | 'consumer';
  
  resourceType: ResourceType;
  baseAmount: number;
  basePriority: Priority;
  
  baseTrucks: number;
  baseComplexity: number;
  
  // Regras associadas
  rules: string[]; // IDs de regras
}

// Exemplos de templates
const templates = {
  "steel_production_line": {
    "name": "Steel Production Chain",
    "description": "Cadeia completa de produção de aço",
    "routes": [
      { "origin": "iron_mine", "resource": "iron_ore", "amount": 100 },
      { "origin": "coal_mine", "resource": "coal", "amount": 50 },
      { "origin": "steel_mill", "resource": "steel", "dest": "warehouse" }
    ]
  },
  
  "electronics_supply": {
    "name": "Electronics Supply",
    "description": "Fornecimento para fábrica de electronics",
    "routes": [
      { "origin": "copper_mine", "resource": "copper_ore", "amount": 50 },
      { "origin": "plastic_plant", "resource": "plastic", "amount": 30 },
      { "dest": "electronics_fac" }
    ]
  }
};
```

---

# PARTE IV: MERCADO (ESTILO EVE)

## 17. SISTEMA DE MERCADO

### 17.1 Order Book

```typescript
// Ordem de compra ou venda
interface MarketOrder {
  id: string;
  
  // Tipo
  type: 'buy' | 'sell';
  
  // Item
  resourceType: ResourceType;
  amount: number;
  amountFilled: number;  // quanto já foi executado
  
  // Preço
  pricePerUnit: number;
  totalValue: number;
  
  // Status
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  
  // Metadata
  playerId: string;
  createdAt: number;
  expiresAt: number;    // tick de expiração
  
  // Local (opcional - entrega)
  locationId: string | null;
}

// Matching parcial:
// sell: {price: 100, amount: 1000}
// buy:  {price: 110, amount: 500}
// Executa: 500 @ 100 (parcial)
// Remaining sell: 500 @ 100
```

### 17.2 Matching Engine

```typescript
interface MarketEngine {
  //Melhor preço = matching priority
  //Buy: maior preço primeiro
  //Sell: menor precio primeiro
  
  matchOrders(resourceType: ResourceType): MarketOrder[] {
    // 1. Pegar TODAS ordens ativas para o recurso
    // 2. Separar buy/sell
    // 3. Ordenar:
    //    - Buy: price DESC
    //    - Sell: price ASC
    // 4. Matching:
    //    - SE buy.price >= sell.price
    //    - Executar ate um dos dois esgotar
    //    - Atualizar amountsFilled
    //    - Mudar status se filled
    
    // Partial fills permitidos!
  }
}
```

### 17.3 Informações Imperfeitas

```typescript
// O jogador NÃO vê dados perfeitos
interface MarketData {
  // O QUE PODE VER:
  lastTransactions: {
    resourceType: ResourceType,
    price: number,
    amount: number,
    timestamp: number
  }[];
  
  trend: 'rising' | 'falling' | 'stable';
  
  volume: number;           // total transacionado (sem detalle)
  
  lowestAsk: number;       // menor preço de venda
  highestBid: number;     // maior preço de compra
  
  // O QUE NÃO PODE VER:
  // - Preço médio exacto
  // - Ordens individuais de outros jogadores
  // - Histórico completo detalhado
  // - Profundidade do order book por preço
}
```

### 17.4 Interface de Mercado

```typescript
// TELA DE MERCADO:
// +----------------+------------+----------+
// | RECURSO     | PREÇO      | VOLUME   |
// +----------------+------------+----------+
// | Wood       | 1.2       | 10,000  |
// | Iron Ore  | 5.3       | 5,000   |
// | Steel     | 21.5      | 2,000   |
// +----------------+------------+----------+
//
//的趋势箭头: ↑↓→
// +-----------------------------------+
// +HISTÓRICO (últimas 10 transações):+
// +-----------------------------------+
// | Time   | Price | Amount         |
// +-------+-------+----------------+
// | 10:32 | 1.1  | 100            |
// | 10:31 | 1.2  | 50             |
// +-------+-------+----------------+
//
// +-----------------------------------+
// +MINHAS ORDENS ATIVAS:            +
// +-----------------------------------+
// | Type | Resource | Price | Amount |
// | Sell| Wood    | 1.2   | 500    |
// | Buy | Iron   | 5.0   | 1000   |
// +-----+----------+-------+--------+
```

### 17.5 Manipulação de Mercado

```typescript
// Permitted:
// 1. Comprar TODA a oferta (se houver dinheiro + espaço)
// 2. Vender TODO (se houver recurso)
// 3. Revender mais caro (buy low, sell high)

// NÃO permitido:
// - wash trading (ordens fake para manipular volume)
// - spoofing (criar ordens fake e cancelar)
// - collusion (acordos entre jogadores)
```

---

# PARTE V: INÍCIO DE JOGO

## 18. SEQUÊNCIA RECOMENDADA DE INÍCIO

### 18.1 Análise: Qual Rota Iniciar?

**DILEMA**: Com 60 Data Points, como otimizar?

| Opção | Gasto | Resultado |
|------|------|-----------|
| A) 50 Lab + 10 Stone | Laboratory + Stone Quarry | 2 fontes income |
| B) 60 Lab | Laboratory | 1 fonte income (travado!) |
| C) 60 Stone | Stone Quarry | 1 fonte income (travado!) |

**CONCLUSÃO**:OPÇÃO A é a melhor - duas fontes de income!

---

### 18.2 Rota Inicial #1: Wood → Lumber → Credits 🥇

```
[COLETAR WOOD] → [LUMBER (3s)] → [VENDER] → [CREDITS]
```

| Aspecto | Detalhe |
|---------|---------|
| Input | 3x Wood (grátis, dado no início) |
| Output | 1x Lumber |
| Tempo | 3s |
| Preço Venda | ~4 Credits |
| Margem | ~25% |

**Por que esta rota:**
- ✅ **Zero dependências** - só precisa de Wood
- ✅ **Feedback rápido** - 3s por ciclo
- ✅ **Gera Credits** - para comprar mais recursos
- ✅ **Tutorializa** - ensina crafting → mercado

---

### 18.3 Rota Inicial #2: Stone → Stone Block

```
[STONE QUARRY] → [STONE BLOCK (4s)] → [VENDER] → [CREDITS]
```

| Aspecto | Detalhe |
|---------|---------|
| Input | 2x Stone (via Stone Quarry) |
| Output | 1x Stone Block |
| Tempo | 4s |
| Preço Venda | ~1-2 Credits |
| Margem | ~10% |

**Quando desbloquear:** Stone Quarry (10 Data Points)

---

### 18.4 Fluxo de Início Recommado

```
SEMANA 1 (Tutorial):
├── Coletar Wood → Lumber → Vender
├── Ganhar 50+ Credits
└── Desbloquear: Stone Quarry (10 DP)

SEMANA 2:
├── Manter: Lumber income (fonte principal)
├── Adicionar: Stone → Block (fonte secundária)
└── Objetivo: 200+ Credits

SEMANA 3:
├── Pesquisar: Laboratory (50 DP)
└── Desbloquear: Tier 2 recipes
```

### 18.5 Por que NÃO gastar tudo no Laboratory?

1. **Tier 1 sustenta bem** - Lumber income é suficiente
2. **Laboratory = 50 DP = 83%** - deixa sem variedade
3. **2 fontes > 1** - diversificação é melhor
4. **Stone Quarry é Barato** - só 10 DP, liberta Stone

---

## 19. DATA POINTS (Recurso Inicial)

### 19.1 Requisito Obrigatório

**PROBLEMA**: Sem data points, jogador fica travado!

**SOLUÇÃO**: Jogador começa com **60 Data Points**:
- 50 para pesquisar: Laboratórios de pesquisa
- 10 para pesquisar: Stone Quarry

### 19.2 Sistema

```typescript
interface PlayerStart {
  // Recursos iniciais
  credits: number;         // 100
  dataPoints: number;     // 60 (OBRIGATÓRIO!
                          // 50 lab + 10 stone)
  trucks: number;        // 5
  
  // Buildings iniciais (gratuitos para começar)
  baseWarehouse: Warehouse;
  baseHouse: Building;
  
  // unlockedRecipes: Tier 1 apenas
}
```

### 18.3 Progressão

| Tier | Desbloqueio | Custo (Data Points) |
|------|------------|-------------------|
| T1 | Manual | 0 (inicial) |
| T2 | Básico | 10 |
| T3 | Intermediário | 25 |
| T4 | Avançado | 50 |
| T5 | Industrial | 100 |

---

# PARTE VI: SPECIALIZAÇÕES

## 19. Especializações de Jogador

### Industrial (Produção)
- +15% eficiência em receita
- -10% tempo de crafting
- Acesso a receitas premium
- -5% custo de manutenção

### Logístico (Transporte)
- +25% capacidade
- -20% custo de combustível
- +10% durabilidade de veículos

### Trader (Mercado)
- -5% fees
- Acesso a ordens bulk
- +10% preço de venda
- Informação de preços

### Energy (Energia)
- +20% geração
- +15% eficiência
- +25% eficiência de Heat

---

# RESUMO EXECUTIVO

## Métricas Finais

| Métrica | Valor |
|--------|-------|
| Total de Recursos | 54+ |
| Tier 1 recursos | 15 |
| Multi Paths | 10+ |
| Closed Loops | 3 (dissipação) |
| Sinks (principal) | 10 |
| Sinks (manutenção) | 7 |
| Heat exploitation | LIMITADO |
| Driver economia | POPULAÇÃO + CREDITS |
| Sistema logística | ROTAS |
| Mercado | ORDER BOOK |
| Data Points início | 60 |

---

# 📋 PRÓXIMOS PASSOS

1. Implementar Tier 1 (15 recursos)
2. Sistema de Heat com dissipação
3. Population + Credits
4. Sistema de logística (rotas)
5. Mercado (order book)
6. Data points inicial (60)
7. RecipeBook progressivo

---

**Documento Completo - MarketPunk v1.1**

*Design completo, balanceado e pronto para implementação*