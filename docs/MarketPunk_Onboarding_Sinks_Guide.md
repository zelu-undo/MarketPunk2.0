# 🚀 Guia de Onboarding e Sinks Progressivos: MarketPunk 2.0

Para evitar que o jogo seja "assustador" para novos jogadores, a complexidade deve ser introduzida em camadas. O objetivo é que o Tier 1 seja uma experiência de aprendizado, enquanto o Tier 5 seja um desafio de gestão logística e econômica.

---

## 1. A Curva de Complexidade por Tier

| Tier | Foco do Jogador | Sinks Ativos | Nível de Risco |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Iniciante)** | Extração e Venda Básica | **Nenhum** (Subsídio de Iniciante) | Zero |
| **Tier 2 (Aprendiz)** | Processamento Simples | Manutenção Básica (Lubrificante) | Baixo |
| **Tier 3 (Industrial)** | Cadeias de Produção | Combustível Logístico + Calor | Médio |
| **Tier 4 (Gestor)** | Automação e Logística | Contratos de Colônia (Opcional) | Alto |
| **Tier 5 (Magnata)** | Otimização e Exportação | Contratos de Colônia (Obrigatório) | Extremo |

---

## 2. Mecânicas de "Onboarding" (Suporte ao Iniciante)

### A. O Subsídio da Corporação (Tier 1)
Nos primeiros níveis, o jogador não está sozinho. Ele é um "Contratado" de uma grande corporação (estilo *EVE Online*).
- **Manutenção Grátis**: Máquinas de Tier 1 não quebram e não precisam de lubrificante.
- **Logística Infinita**: Os primeiros 2 caminhões não consomem combustível.
- **Objetivo**: O jogador foca apenas em entender como extrair `Wood`, `Stone` e `Iron` e vender no mercado para ganhar seus primeiros créditos.

### B. O "Tutorial de Contrato" (Tier 2)
Em vez de uma colônia exigente, o jogador recebe um **Contrato de Treinamento**.
- A Colônia pede apenas 10 `Food Rations` por dia.
- Se o jogador entregar, ganha um bônus de créditos.
- Se **não** entregar, **não acontece nada**. É apenas um bônus opcional para ensinar a mecânica de exportação.

---

## 3. Implementação dos Sinks Progressivos

### C. Manutenção por Desgaste (Tier 2+)
A partir do Tier 2, as máquinas começam a ter uma barra de "Condição".
- **Tier 2**: Desgaste lento (1% por hora). Requer apenas `Lubricant`.
- **Tier 5**: Desgaste rápido (5% por hora). Requer `Spare Parts` e `Coolant`.
- **Dica de Design**: O jogador só precisa se preocupar com isso quando já tem uma produção estável de créditos para comprar ou fabricar esses itens.

### D. Combustível Logístico (Tier 3+)
A logística só começa a custar caro quando o jogador expande.
- **Tier 1-2**: Caminhões elétricos com recarga solar gratuita (lento).
- **Tier 3+**: Caminhões de alta performance que exigem `Fuel Oil` ou `Energy Cells`.
- **Impacto**: O jogador escolhe entre a logística lenta e grátis ou a rápida e paga.

### E. O "Sink" de Colônia Real (Tier 4+)
Aqui o jogo se aproxima de *Prosperous Universe*.
- A Colônia agora é uma entidade que **precisa** de suprimentos para crescer.
- **Mecânica de Reputação**: Se você não suprir a colônia, sua taxa de imposto no mercado aumenta.
- **End-game**: O jogador mais rico é aquele que consegue manter a colônia mais feliz, ganhando acesso a tecnologias exclusivas de Tier 5.

---

## 4. Resumo da Estratégia

1.  **Não puna o erro no início**: Deixe o jogador falhar nos contratos sem perder a base.
2.  **Automatize o básico**: No início, a manutenção é automática ou inexistente.
3.  **Recompense a complexidade**: Quanto mais sinks o jogador gerencia (combustível + manutenção + colônia), maior é a sua margem de lucro.

Essa abordagem transforma o "assustador" em um "objetivo de crescimento". O jogador começa como um minerador simples e termina como o CEO de uma cadeia logística interplanetária.
