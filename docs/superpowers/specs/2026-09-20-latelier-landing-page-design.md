# Design Doc: Landing Page "L'Atelier da Festa"

## 1. Visão Geral e Propósito

Substituição da antiga landing page por uma experiência editorial de luxo, acolhedora e altamente profissional para o **Corta-Gravata**. A página é construída do zero, guiada estritamente pelas diretrizes de:
- **`taste-skill`**: Editorial, autêntica ao casamento (marfim `#faf8f5`, linho, ouro 18K champanhe), contenção visual e ausência de clichês de IA/SaaS.
- **`impeccable`**: Bordas *hairline*, reflexos especulares superiores (`box-shadow: inset 0 1px 0`), sombras físicas multicamadas, alinhamento óptico e números estritamente tabulares (`tabular-nums`).
- **`emil-kowalski`**: Física de molas naturais (`springSnappy`, `springButton`, `springCard`), micro-press tátil instantâneo (`whileTap={{ scale: 0.96 }}`), staggers sutis e interruptibilidade.

---

## 2. Arquitetura da Página e Seções

A página abandona a divisão rígida em "5 atos" sequenciais e adota uma composição editorial fluida:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HEADER EDITORIAL                                         │
│    Marca "Corta-Gravata", badge "Rifa do Casal", CTA Dourado│
├─────────────────────────────────────────────────────────────┤
│ 2. HERO PRINCIPAL & ARENA DAS ALIANÇAS                      │
│    Manchete monumental, CTAs com micro-press tátil,         │
│    vitrine com as alianças 3D em ouro 18K sobre pedestal    │
├─────────────────────────────────────────────────────────────┤
│ 3. O BILHETE DA SORTE (Papelaria Fina Interativa)           │
│    Bilhete com textura de papel, picotes, carimbo elástico  │
│    e celebração com confetes de ouro                        │
├─────────────────────────────────────────────────────────────┤
│ 4. A DUPLA DINÂMICA: MESA & TELÃO                           │
│    • Esquerda: Modo Padrinhos (celular de bolso tátil)      │
│    • Direita: O Telão da Festa (projeção ao vivo na pista)  │
├─────────────────────────────────────────────────────────────┤
│ 5. CALCULADORA DA LUA DE MEL                                │
│    Recibo pontilhado de alta gramatura com sliders suaves,  │
│    reação cinética e números tabulares rigorosos            │
├─────────────────────────────────────────────────────────────┤
│ 6. CONFIANÇA, TRANQUILIDADE & GRAND FINALE                  │
│    Sem mensalidade, saque PIX imediato e CTA de criação     │
├─────────────────────────────────────────────────────────────┤
│ 7. FITA MARQUEE ACETINADA & RODAPÉ EDITORIAL                │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Especificação de Componentes e Microinterações

### 3.1. Header Editorial
- **Fundo**: `#faf8f5/90` com `backdrop-blur-md` e borda inferior *hairline* `border-stone-900/[0.06]`.
- **Marca**: Tipografia `font-heading text-2xl font-bold tracking-tight text-[#1c1917]`.
- **Botões**:
  - "Entrar": `variant="ghost"`, cantos arredondados suaves (`rounded-full`), hover sutil.
  - "Criar Nossa Rifa": `wedding-button` com reflexo superior `inset 0 1px 0 rgba(255,255,255,0.4)` e mola no clique (`whileTap={{ scale: 0.96 }}`).

### 3.2. Hero Principal & Pedestal 3D
- **Manchete**:
  - Fonte display editorial em escala monumental: *"O Corta-Gravata que arrecada mais e alegra a festa."*
  - Ausência de texto `#000000`; uso exclusivo de `#1c1917` (Stone 900) para máxima elegância.
- **CTAs Primários**:
  - `Criar Rifa dos Noivos Grátis`: Dourado 18K champanhe, seta com compensação óptica de 0.5px (`translate-x-0.5`).
  - `Ver Exemplo ao Vivo`: Superfície branca com borda fina `border-stone-900/[0.08]` e sombra difusa.
- **Pedestal 3D**:
  - Componente `HeroScene` acomodado em arena dedicada, com iluminação de chão quente e sombras suaves, sem textos sobrepostos no canvas.

### 3.3. O Bilhete da Sorte (Papelaria Fina)
- Utilização do `InteractiveRaffleTicket`.
- Superfície de papel de alta gramatura (`#fdfbf7`), picotes laterais decorativos, tipografia com serifas e numeração autenticada.
- Ao clicar: carimbo com física elástica (`easeOutElastic` via anime.js ou springs do motion/react), vibração háptica em celulares e confetes dourados.

### 3.4. A Dupla Dinâmica: Modo Padrinhos vs Telão
- **Modo Padrinhos**:
  - Exibição de uma réplica de interface de celular de bolso que demonstra como os padrinhos circulam pela festa e registram contribuições em 2 toques, seja em dinheiro ou PIX.
- **O Telão da Festa**:
  - Painel com fundo em tom de veludo escuro nobre (`#161311`), demonstrando a conexão ao projetor e o ranking ao vivo dos convidados.

### 3.5. Calculadora da Lua de Mel
- Card em formato de recibo (`receipt-card`) com bordas pontilhadas (`border-dashed`) e sombra multicamadas de 3 paradas.
- Sliders de convidados, valor da cota e cotas médias com feedback tátil e atualização instantânea com `tabular-nums`.
- Reação cinética no valor líquido via `NumberTicker` e pulso com brilho suave.

### 3.6. Fita Marquee e Rodapé
- Fita contínua em formato de cetim dourado com bordas finas e micro-tracking elegante (`tracking-[0.12em]`).
- Rodapé sóbrio e limpo com copyright e assinatura de marca.

---

## 4. Presets de Física de Molas (`emil-kowalski`)

```typescript
export const springSnappy = {
  type: "spring",
  stiffness: 400,
  damping: 35,
  mass: 0.8,
};

export const springButton = {
  type: "spring",
  stiffness: 380,
  damping: 26,
};

export const springCard = {
  type: "spring",
  stiffness: 360,
  damping: 28,
};
```

---

## 5. Plano de Verificação

1. **Testes Automatizados**:
   - Manter a compatibilidade com a suíte de testes de `apps/web/src/app/page.test.tsx` (preservando os seletores `.canvas-container`, `.gsap-trigger`, `.receipt-card`, etc.).
   - Executar `vitest run src/app/page.test.tsx` garantindo 100% de aprovação.
2. **Checagem Estática de Tipos**:
   - Executar `tsc --noEmit` em `apps/web` com 0 erros.
3. **Verificação Visual e Responsiva**:
   - Layout fluido em telas móveis e desktop, com contraste auditado (WCAG AA).
