# 🎮 MarketPunk 2.0: Documento de Design Mestre (GDD)

Este documento consolida a visão estratégica para o **MarketPunk 2.0**, unindo a profundidade econômica de simuladores industriais como *Prosperous Universe* e *EVE Online* com uma curva de aprendizado acessível e progressiva.

---

## 1. Visão Geral do Jogo
O MarketPunk 2.0 é um simulador de gestão industrial e logística focado em um mercado dinâmico e interdependente. O jogador evolui de um minerador básico para um magnata logístico, gerenciando cadeias de suprimentos complexas, manutenção de hardware e contratos de exportação planetária.

---

## 2. Roadmap de Desenvolvimento (Status Atual)

| Funcionalidade | Status | Descrição |
| :--- | :--- | :--- |
| **Economia T1-T5** | ✅ Implementado | ~50 recursos e receitas definidos e funcionais. |
| **Unidades de Produção** | ✅ Implementado | Sistema de input/output com tempos de ciclo e buffers. |
| **Manutenção e Calor** | ✅ Implementado | Desgaste de máquinas e necessidade de dissipação térmica. |
| **Logística de Caminhões** | ✅ Implementado | Atribuição direta de veículos a unidades de produção. |
| **Sistema de População** | 🔄 Substituindo | Sendo migrado para o sistema de **Contratos de Colônia**. |
| **Logística de Rotas** | ❌ Planejado | Migração de caminhões individuais para rotas abstratas. |
| **Mercado Avançado** | ❌ Planejado | Integração de Order Matching (Bid/Ask) no loop principal. |

---

## 3. A Nova Economia: Sinks Progressivos por Tier

Para remover a mecânica de "População" sem perder o dreno econômico (Sink), o jogo introduz o **Suprimento de Colônia** e a **Manutenção Industrial** em camadas de complexidade.

### Tier 1: O Onboarding (Iniciante)
*   **Foco**: Extração básica e venda direta.
*   **Sinks**: **Nenhum**.
*   **Mecânica de Apoio**: "Subsídio Corporativo". Máquinas não quebram, caminhões não gastam combustível.
*   **Objetivo**: Acumular os primeiros créditos e entender o fluxo de caixa.

### Tier 2: Processamento e Manutenção (Aprendiz)
*   **Foco**: Transformação de matéria-prima (ex: Wood → Lumber).
*   **Sinks**: **Manutenção Básica**.
*   **Mecânica**: Introdução do `Lubricant`. Máquinas de T2 perdem 1% de integridade por hora se não houver lubrificante.
*   **Contrato Opcional**: A Colônia pede pequenas quantidades de `Food Rations` em troca de bônus de reputação.

### Tier 3: Logística e Energia (Industrial)
*   **Foco**: Cadeias de Tier 3 (Steel, Plastic, Glass).
*   **Sinks**: **Combustível Logístico + Calor**.
*   **Mecânica**: Caminhões de alta performance exigem `Fuel Oil` ou `Energy Cells`. Máquinas geram `Heat` que precisa de `Water` ou `Coolant`.
*   **Impacto**: O jogador precisa equilibrar a velocidade de transporte com o custo de combustível.

### Tier 4: Automação e Exportação (Gestor)
*   **Foco**: Componentes avançados (ICs, PCBs, Motores).
*   **Sinks**: **Contratos de Colônia Críticos**.
*   **Mecânica**: A Colônia exige suprimentos regulares de `Medical Supplies` e `Comfort Items`. Falhar reduz a reputação e aumenta as taxas de mercado.
*   **Automação**: Uso de `Control Units` para gerenciar a complexidade sem microgerenciamento.

### Tier 5: O End-Game (Magnata)
*   **Foco**: Equipamentos Industriais Pesados e Reatores Nucleares.
*   **Sinks**: **Manutenção de Alta Tecnologia + Upkeep de Pesquisa**.
*   **Mecânica**: Máquinas de T5 exigem `Spare Parts` constantes. O Laboratório consome `Research Data` para manter bônus de eficiência ativos.
*   **Desafio**: Gerenciar uma economia global onde cada recurso produzido tem um destino (Sink) claro.

---

## 4. Pilares de Design (Inspirados em EVE/Prosperous Universe)

1.  **Interdependência**: Nenhum jogador (ou base) deve ser 100% autossuficiente no late game. O mercado é o coração do jogo.
2.  **Risco vs. Recompensa**: Produções mais complexas (T5) têm margens de lucro maiores, mas exigem cadeias de manutenção e logística muito mais caras.
3.  **Especialização**: Bônus de bioma ou tecnologias exclusivas incentivam o comércio entre diferentes focos de produção.
4.  **Logística como Gameplay**: Mover recursos do ponto A ao ponto B deve ser uma decisão estratégica (custo de combustível vs. tempo), não apenas um detalhe visual.

---

## 5. Próximos Passos de Implementação

1.  **Remover População**: Deletar as variáveis de `population` e `happiness` do `GameState`.
2.  **Criar Sistema de Reputação**: Implementar `colonyReputation` que afeta taxas de mercado.
3.  **Adicionar Custo de Combustível**: Modificar o loop de logística para consumir `Energy` ou `Fuel` por viagem.
4.  **Refatorar Manutenção**: Vincular o consumo de `Lubricant` e `Spare Parts` diretamente à integridade das máquinas no `useGameLoop.ts`.

---
**MarketPunk 2.0 - Construindo o Futuro Industrial.**
