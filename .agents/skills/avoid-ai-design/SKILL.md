---
name: avoid-ai-design
description: Use when designing, building, or reviewing user interfaces to eliminate generic AI aesthetic tropes (neon blur blobs, excessive glassmorphism, crypto-dashboard vibes, robotic microcopy) and create authentic, human-crafted, context-rich design.
---

# Avoid AI Design (Evite o Design com "Cara de IA")

## Overview

Modelos de IA têm vícios estéticos previsíveis quando solicitados a criar interfaces modernas: quase sempre produzem um **"SaaS / Crypto Slop"** genérico — modo escuro frio, esferas de luz neon desfocadas no fundo, vidro translúcido em excesso em todos os elementos, cantos arredondados idênticos e texto com jargões robóticos.

**Princípio fundamental:** Uma interface de software de verdade deve pertencer ao seu **domínio humano real** (um casamento deve parecer um casamento de verdade; um restaurante deve parecer gastronomia; uma ferramenta criativa deve parecer um ateliê), e não um painel espacial futurista genérico.

---

## Os Sete Pecados do Design com "Cara de IA"

| Pecado da IA | O que a IA faz | Como um designer humano resolve |
| :--- | :--- | :--- |
| **1. Esferas de Glow Neon** | `<div className="absolute -top-40 ... blur-[140px] bg-primary/20" />` espalhadas pelo fundo | **Fundo sólido, limpo e com textura natural**. Use iluminação sutil apenas onde há foco real ou use cores acolhedoras com contrastes orgânicos. |
| **2. Hiper-Glassmorphism** | `backdrop-blur-2xl bg-white/10 border-white/15` em absolutamente todos os cards | **Superfícies definidas**. Use cartões com cor de fundo sólida suave, bordas delicadas com contraste real (`border-[#e6dfd5]`) e sombras naturais multicamadas. |
| **3. Modo Escuro Sintético** | Fundo `#0a0d14` ou azul-petróleo escuro em contextos que pedem luz, calor e acolhimento (como casamentos) | **Paleta adequada ao evento**. Casamentos pedem marfim, linho, off-white quente (`#faf8f5`), espresso suave (`#262320`) e dourados nobres sem brilho radioativo. |
| **4. Pílulas e Badges em Tudo** | Toda linha tem uma pill badge com um emoji ou um ponto piscando (`animate-pulse`) | **Hierarquia tipográfica limpa**. Deixe a tipografia e o espaçamento conduzirem a leitura. Badges servem apenas para status crítico, não decoração. |
| **5. Jargões Robóticos** | *"Console Master"*, *"Terminal de Operação"*, *"Acesso Assistido"*, *"ID da Transação"* | **Linguagem humana, festiva e empática**. Em casamento: *"Gravata dos Noivos"*, *"Dar uma força na lua de mel"*, *"Quem comprou"*, *"Pix dos Noivos"*. |
| **6. Cards Idênticos em Grid 3x3** | Cards genéricos com ícone Lucide centralizado em squircle colorido | **Layout editorial dinâmico**. Alterne pesos visuais, destaque o elemento principal (a cartela, o total, o presente), use tamanhos assimétricos propositais. |
| **7. Falta de Tipografia Autêntica** | Uso de fontes grotescas puramente corporativas (Inter / Roboto / System) sem nenhum contraste de personalidade | **Harmonização tipográfica editorial**: combine uma fonte display/serif com personalidade (elegante, quente ou expressiva) para títulos com uma sem-serifa neutra e legível para leitura. |

---

## Regras de Ouro para Design Autêntico

### 1. Contexto em Primeiro Lugar (Context-First)
Antes de escrever uma única linha de CSS, responda:
- **Onde esse produto vive?** (Um casamento em um salão de festas com música, taças de champanhe e vestidos elegantes? Uma oficina mecânica? Um consultório médico?)
- **Quem está usando?** No casamento, quem usa é o padrinho com um copo na mão, a tia que só quer mandar um Pix de R$ 50, e os convidados na pista olhando o telão. A interface precisa ser **acessível, calorosa e intuitiva**, não um painel de controle de TI.

### 2. Paletas com Calor e Textura (Warmth over Fluorescents)
- Evite cinzas frios puros (`#f3f4f6` / `#111827`) e pretos chapados (`#000000`).
- Use **famílias tonais quentes**:
  - **Fundo Base:** `#faf8f5` (marfim aquecido), `#f5f0ea` (linho suave), `#fbf9f6` (papel de alta gramatura).
  - **Superfícies dos Cards:** `#ffffff` puro apoiado sobre fundo creme com bordas `#e8e1d7`.
  - **Texto Principal:** `#1c1917` (Stone 900) ou `#262320` (carvão/espresso suave) — infinitamente mais agradável aos olhos que preto puro.
  - **Acentos:** Ouro velho / champanhe quente (`#b89047`, `#9a7837`), verde oliva suave (`#556b2f`), terracota nobre.

### 3. Sombras Físicas Naturais (Sem Glow)
Em vez de `shadow-[0_0_40px_-16px_var(--glow)]`, utilize sombras difusas naturais inspiradas em papel e superfícies físicas:
```css
/* Sombra natural de cartão físico */
box-shadow: 0 1px 3px rgba(44, 38, 30, 0.05), 
            0 8px 24px -4px rgba(44, 38, 30, 0.08);
```

### 4. Microcopy Humano & Afetivo
Nunca use termos técnicos ou corporativos quando o usuário está em um momento de lazer ou celebração:
- ❌ *"Console do Padrinho"* ➔ ✔️ *"Modo Padrinho"* ou *"Registrar Venda na Festa"*
- ❌ *"Terminal de Vendas Assistidas"* ➔ ✔️ *"Receber dinheiro ou Pix em mãos"*
- ❌ *"Status: Vendas Travadas"* ➔ ✔️ *"Vendas encerradas para o sorteio"*
- ❌ *"Solicitar Saque PIX"* ➔ ✔️ *"Transferir dinheiro para os noivos"*
- ❌ *"Console Master"* ➔ ✔️ *"Administração"*

### 5. Tipografia com Alma
- Títulos devem carregar o tom da ocasião: uma fonte serifada elegante transmite romance, tradição, cuidado e sofisticação de convite impresso.
- Valores monetários devem ser grandes, claros e com formato tabular (`tabular-nums font-medium`).
- Espaçamento amplo e respiro (generous whitespace): o design respira quando não tentamos entupir cada pixel com efeitos visuais.

---

## Checklist: "Este layout parece feito por IA?"

Antes de aprovar ou entregar qualquer tela, faça o teste:
- [ ] Tem manchas azuis/roxas/douradas de desfoque (radial blur) no fundo sem propósito? *(Se sim, remova)*.
- [ ] Todos os cards têm efeito de vidro fosco (`backdrop-blur`) sem necessidade? *(Se sim, troque por superfícies sólidas limpas)*.
- [ ] O texto parece um manual de sistema de TI em vez de uma conversa humana? *(Se sim, reescreva com empatia)*.
- [ ] O layout parece um template genérico de SaaS ou cripto moeda? *(Se sim, traga as cores e materiais do mundo real do projeto)*.
- [ ] Uma pessoa de 60 anos na festa de casamento entenderia o que fazer nessa tela em 3 segundos? *(Se não, simplifique)*.
