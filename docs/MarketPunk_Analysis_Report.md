# 🎮 Relatório de Análise e Melhoria de Game Design: MarketPunk 2.0

Este relatório apresenta uma análise do estado atual do desenvolvimento do **MarketPunk 2.0**, um roadmap das funcionalidades implementadas e uma proposta detalhada para substituir a mecânica de "População" por um sistema de **Sinks Econômicos Industriais**, inspirado em *Prosperous Universe* e *EVE Online*.

---

## 1. Roadmap de Desenvolvimento (Implementado vs. Planejado)

Com base na análise do código-fonte (`src/useGameLoop.ts`, `src/constants.ts`) e dos documentos de design, aqui está o status atual do projeto:

| Funcionalidade | Status | Detalhes da Implementação |
| :--- | :--- | :--- |
| **Tiers de Recursos (T1-T5)** | ✅ Implementado | Estrutura completa de ~50 recursos definida e funcional. |
| **Unidades de Produção** | ✅ Implementado | Sistema de input/output funcional com tempos de ciclo. |
| **Sistema de População** | ✅ Implementado | Consumo de `food_ration`, `comfort_item`, `medical_supply`. |
| **Mercado (Market)** | ⚠️ Parcial | Frontend usa polling; lógica de order matching existe mas não está integrada ao loop principal. |
| **Logística (Caminhões)** | ✅ Implementado | Atribuição direta de caminhões a unidades de produção. |
| **Logística (Rotas)** | ❌ Planejado | Arquitetura de rotas (`LogisticsSystem.ts`) existe, mas não é usada no loop de jogo. |
| **Manutenção (Maintenance)** | ✅ Implementado | Sistema básico de desgaste e reparo com itens específicos. |
| **Sistema de Calor (Heat)** | ✅ Implementado | Geração de calor por máquinas e dissipação passiva/ativa. |
| **Automação** | ✅ Implementado | Regras para compra/venda/produção baseadas em estoque/preço. |
| **Pesquisa (Tech Tree)** | ✅ Implementado | Desbloqueio de novas unidades via `Research Data`. |

---

## 2. Proposta: Removendo a "População" e Criando Novos "Sinks"

O desafio de remover a população é manter o **Sink** (dreno de recursos) que ela proporciona. Em *Prosperous Universe*, a população é a fonte de mão de obra. Em *EVE Online*, o sink principal é a destruição de naves e taxas.

Para o **MarketPunk**, proponho substituir a "População Interna" por **"Contratos de Colônia e Manutenção de Hardware"**.

### A. O Sink Externo: Suprimento de Colônia (Colony Supply)
Em vez de gerenciar habitantes na sua base, você é um **Provedor Logístico** para uma colônia planetária externa.
- **O Contrato**: A Colônia tem uma demanda constante e crescente por `Food Rations`, `Comfort Items` e `Medical Supplies`.
- **A Mecânica**: Você "exporta" esses itens para a colônia em intervalos regulares.
- **O Retorno**: Em vez de "impostos", você recebe **Créditos de Subsídio** e **Reputação de Facção**.
- **Consequência**: Falhar no suprimento reduz sua reputação, o que aumenta as taxas de mercado ou bloqueia tecnologias de Tier alto.

### B. O Sink Interno: Manutenção de Hardware (Hardware Maintenance)
Substitua a necessidade de "trabalhadores" por "integridade de máquinas".
- **Condição da Máquina**: Cada unidade de produção tem uma barra de integridade que cai por ciclo de uso.
- **Consumíveis de Reparo**: Para manter a eficiência em 100%, a máquina consome automaticamente:
    - **T2/T3**: `Lubricant` e `Spare Parts`.
    - **T4/T5**: `Coolant` e `Electronics`.
- **Impacto**: Isso cria um dreno constante de recursos processados, forçando o jogador a manter cadeias de suprimento de manutenção ativas.

### C. O Sink de Movimentação: Combustível Logístico (Logistics Fuel)
Caminhões não devem ser "gratuitos" para rodar.
- **Consumo por KM**: Cada viagem de caminhão ou rota logística consome **Energy Cells** ou **Fuel Oil**.
- **Estratégia**: Isso torna a localização das fábricas e a eficiência das rotas crucial (como o combustível em *EVE* ou *Prosperous Universe*).

### D. O Sink de Pesquisa: Manutenção Tecnológica (Tech Upkeep)
Tecnologias de Tier 4 e 5 não são apenas "desbloqueadas".
- **Upkeep de Dados**: Para manter bônus de eficiência ou máquinas avançadas ligadas, o laboratório deve consumir **Research Data** continuamente.
- **Relevância**: Isso mantém o `Laboratory` útil durante todo o jogo, não apenas no início.

---

## 3. Sugestões de Melhoria no Game Design

1.  **Especialização de Base**: Em vez de produzir tudo, introduza "Bônus de Bioma". Algumas localizações produzem mais `Iron Ore`, outras mais `Crude Oil`. Isso força o uso do Mercado (como em *EVE*).
2.  **Eventos de Mercado**: Introduza "Crises de Demanda" onde a Colônia pede 5x mais de um recurso específico por tempo limitado, pagando prêmios altíssimos.
3.  **Subprodutos Úteis**: Melhore a interdependência. O `Slag` (escória) do ferro já é usado no cimento, mas o `Heat` (calor) poderia ser convertido em energia via `Heat Exchanger`, criando um loop de eficiência.
4.  **Interface de Logística**: Migre do sistema de "atribuir caminhão" para o sistema de "Rotas" planejado no documento. Isso reduz o microgerenciamento e permite escalar a produção para centenas de máquinas.

---

## 4. Próximos Passos Recomendados

1.  **Refatorar `useGameLoop.ts`**: Remover as variáveis de `population` e `happiness` e substituí-las por `colonyStanding` e `maintenanceDemand`.
2.  **Implementar Consumo de Combustível**: Adicionar um custo de `Energy Cells` por tick de logística.
3.  **Integrar o `MarketSystem.ts`**: Fazer com que as ordens de compra/venda sejam processadas contra outros "NPCs" ou jogadores reais, em vez de apenas polling de preço.

O que você acha dessa direção? Se concordar, posso ajudar a codificar a transição da mecânica de população para o sistema de contratos de colônia.
