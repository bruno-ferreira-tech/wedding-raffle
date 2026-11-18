---
name: ui-forager-skill
description: Use when researching, collecting, or selecting real-world UI design inspiration, component patterns, interaction models, and tactile references before designing or building frontend interfaces.
---

# UI Forager Skill

## Overview

O **UI Forager** é uma disciplina sistemática de prospecção e curadoria de interfaces: em vez de gerar layouts a partir de abstrações genéricas (que frequentemente recaem nos vícios e clichês de IA), o agente atua como um **prospector e curador de soluções visuais e interativas consolidadas no mundo real**.

> **Princípio Fundamental do Forager:** Todo grande problema de interface já foi resolvido com maestria por algum produto de alta classe, por algum sistema de design maduro ou por um objeto do mundo físico (cartelas de papel, bilhetes de loteria, passaportes, cartões de embarque, placares de estádio, cardápios de bistrô). A missão do Forager é caçar a metáfora certa, dissecar sua anatomia e transpô-la com elegância para o código.

---

## Quando Utilizar Esta Skill

Invoque esta skill **sempre que**:
- For iniciar a criação de uma nova tela, fluxo ou componente de interface.
- Precisar de referências estéticas e estruturais para fugir de telas genéricas ou corporativas sem vida.
- For redesenhar componentes que parecem "artificiais", "desajeitados" ou sem apelo tátil.
- Precisar definir a hierarquia, anatomia, estados vazios e micro-interações de um elemento complexo.

---

## O Protocolo de Foraging em 5 Passos

```
[1. Mapeamento de Contexto] ➔ [2. Caça à Metáfora Real] ➔ [3. Dissecação Anatômica] ➔ [4. Transposição para Tokens] ➔ [5. Auditoria Tátil & A11y]
```

### Passo 1: Mapeamento de Contexto e Emoção
Antes de buscar qualquer referência visual, responda:
1. **Onde e como essa tela será usada fisicamente?**
   - Na mão de um convidado em pé num salão de festas? (Foco em toque de polegar, botões grandes, contraste sob iluminação variável).
   - Num telão de LED ou projetor a 10 metros de distância? (Foco em tipografia monumental, números tabulares, eliminação de micro-detalhes).
   - No smartphone de um padrinho que está recolhendo dinheiro enquanto conversa? (Foco em velocidade de 2 toques, feedback sonoro/tátil, zero atrito).
2. **Qual é o tom emocional?**
   - Celebração, festa e afeto?
   - Produtividade, agilidade e precisão técnica?
   - Confiança, serenidade e prestígio?

### Passo 2: Caça à Metáfora do Mundo Real
Procure o objeto físico ou o artefato cultural que melhor representa a ação:
- **Rifas / Sorteios / Bingo:** Cartelas impressas em papel offset 180g, caneta marcadora, picote destacável, numeração mecânica sequencial, carimbos de validação.
- **Pagamentos rápidos (PIX/Checkout):** Convite de papel com envelope, recibo timbrado, ticket de entrada com código de barras/QR Code, comprovante impresso.
- **Telão / Projeção:** Placar retrô de teatro, painel de aeroporto com rotação mecânica, reveal de envelope de premiação do Oscar, cartaz de festival.
- **Ações Rápidas de Campo (Padrinho):** Maquininha de cartão de bolso, talão de notas, crachá funcional, menu de atalho tipo iOS Control Center.

### Passo 3: Dissecação Anatômica do Componente
Ao selecionar uma referência visual, desmonte o componente em 5 camadas:
1. **Superfície & Elevação:**
   - O material é papel, linho, metal escovado, cerâmica ou veludo?
   - Sombras: projetadas com difusão natural (`rgba(40, 30, 20, 0.06)`), sem brilhos fluorescentes.
   - Bordas: hairline suave (`1px solid var(--border-subtle)`), nunca traços pesados de desenho infantil.
2. **Tipografia & Ritmo:**
   - Fonte Display com personalidade para títulos e momentos de celebração.
   - Fonte Neutra de alta legibilidade para leitura e formulários.
   - Dígitos Tabulares (`tabular-nums lining-nums`) para qualquer contagem ou valor monetário.
3. **Hierarquia e Ponto Focal:**
   - Qual é a ÚNICA coisa que o olho deve captar no primeiro meio segundo?
   - Espaçamento generoso ao redor do herói da tela.
4. **Estados Interativos:**
   - Repouso (`default`), Foco (`focus-visible`), Toque/Pressionado (`active:scale-[0.97]`), Selecionado (`selected`), Desabilitado (`disabled`).
5. **Micro-interações:**
   - Easing natural de mola: `cubic-bezier(0.16, 1, 0.3, 1)` ou `cubic-bezier(0.34, 1.56, 0.64, 1)` para elementos de celebração.

### Passo 4: Transposição para os Tokens do Projeto
Nunca importe estilos desconectados. Converta a referência forrageada para os tokens existentes no projeto:
- Use as variáveis CSS locais (`var(--background)`, `var(--primary)`, `var(--card)`, etc.).
- Aplique classes utilitárias já existentes (`.wedding-card`, `.wedding-button`, `.wedding-numeral`).
- Mantenha a consistência com o tema ativo selecionado pelo usuário.

### Passo 5: Auditoria Tátil e Acessibilidade
- **Áreas de toque mínimas:** 44 × 44px em qualquer elemento interativo no mobile.
- **Contraste de cores:** WCAG AA mínimo (4.5:1 para texto padrão, 3:1 para títulos grandes).
- **Sem poluição de IA:** Zero `blur-[120px]`, zero gradientes roxos sintéticos no fundo, zero jargões vazios (conforme `avoid-ai-design`).

---

## Catálogo de Arquétipos do Forager

### 1. Arquétipo: A Cartela Tátil (Raffle Board / Tally Matrix)
- **Inspiração Real:** Cartelas de rifa de quermesse, bilhetes de loteria federal com bordas picotadas, carimbos numerados.
- **Anatomia no Código:**
  - Grade responsiva com espaçamento uniforme (`gap-2` ou `gap-3`).
  - Célula com fundo levemente texturizado ou papel claro, número centralizado em fonte sem-serifa forte e tabular.
  - Estado selecionado: preenchimento dourado/champanhe quente com leve elevação e anel de foco.
  - Estado pago/vendido: tom atenuado com indicação visual clara de indisponibilidade.

### 2. Arquétipo: O Ticket / Voucher de Papelaria (Receipt Card)
- **Inspiração Real:** Convites de casamento com impressão em relevo/hot stamping, recibos de alfaiataria, ingressos numerados.
- **Anatomia no Código:**
  - Card centralizado com cantos arredondados contínuos (`rounded-2xl` a `rounded-3xl`).
  - Linha divisória pontilhada ou tracejada sutil (`border-dashed border-stone-300`).
  - Informações de resumo alinhadas com rótulo em caixa-alta espaçado (`text-xs uppercase tracking-wider text-muted-foreground`) e valor em destaque.
  - Ação principal de 1 toque (ex: botão "Copiar código PIX" com feedback de sucesso imediato).

### 3. Arquétipo: O Telão de Celebração (Stage / Arena Board)
- **Inspiração Real:** Placares eletrônicos de salão nobre, projeções de gala, telões de premiações de cinema.
- **Anatomia no Código:**
  - Fundo escuro aveludado (`#0d0c0b` a `#171513`), eliminando reflexos indesejados no projetor.
  - Títulos em tipografia serifada de gala (*Playfair Display*) para imprimir sofisticação ao evento.
  - Valores monetários monumentais no centro da visão com numerais tabulares legíveis do fundo do salão.
  - Feed de compras animado de baixo para cima com efeito de entrada suave sem ofuscar a visão.
  - Modal de sorteio com revelação em etapas (contagem regressiva ➔ número sorteado ➔ nome do ganhador).

### 4. Arquétipo: O Console de Campo / Bolso (Pocket Operator)
- **Inspiração Real:** Máquinas de ponto de venda portáteis, cartões de anotação de cerimonialistas, gavetas de atalho no smartphone.
- **Anatomia no Código:**
  - Layout estritamente verticalizado para uso com uma mão só.
  - Teclado numérico ou botões de atalho de valor (ex: R$ 10, R$ 25, R$ 50, R$ 100) ocupando a metade inferior da tela (área nobre do polegar).
  - Feedback visual e háptico imediato ao registrar pagamentos.
  - Resumo claro de quanto foi arrecadado em dinheiro físico vs. PIX.

---

## Fontes de Foraging Recomendadas

Quando precisar buscar inspiração para novos componentes:
1. **Sistemas de Design de Referência:**
   - *Apple Human Interface Guidelines* (Materiais, física de molas, ergonomia mobile).
   - *Radix UI / shadcn/ui* (Comportamento acessível de primitivos, overlays e gavetas).
   - *Material Design 3* (Tratamento de superfícies tonais e estados interativos).
2. **Produtos Digitais Notáveis:**
   - *Stripe Checkout & Billing:* O padrão ouro mundial em clareza de formulários, cartões de pagamento e confiança visual.
   - *Airbnb:* O padrão ouro em tipografia de hospitalidade, cartões acolhedores e micro-cópia humana.
   - *Linear & Raycast:* Referência em atalhos rápidos, densidade equilibrada de informação e estética polida sem excessos.
3. **Mundo Físico e Gráfico Tradicional:**
   - Livros de tipografia editorial, cartazes de teatro clássico, ingressos antigos, etiquetas de garrafas de vinho e cadernos Moleskine.

---

## Checklist de Execução do UI Forager

Antes de finalizar qualquer implementação de interface inspirada por esta skill:
- [ ] A metáfora visual do componente reflete o contexto real do usuário (não um dashboard espacial genérico)?
- [ ] Os elementos têm áreas de toque confortáveis (mínimo 44px) para uso em smartphones?
- [ ] Números e valores monetários utilizam `tabular-nums` para evitar saltos visuais na tela?
- [ ] Os estados vazios (*empty states*) são acolhedores e explicativos, não telas frias e vazias?
- [ ] A transição e os cliques têm física de mola tátil (`active:scale-[0.97]`)?
- [ ] Passou na auditoria da skill `avoid-ai-design` (sem neons, sem blur blobs, sem jargão robótico)?
