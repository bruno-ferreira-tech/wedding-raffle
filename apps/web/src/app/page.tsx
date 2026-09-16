'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CoinsIcon,
  ExternalLinkIcon,
  PaletteIcon,
  PartyPopperIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TvIcon,
  WalletIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatBRL } from '@/lib/money';

export default function LandingPage() {
  // Calculator state
  const [guests, setGuests] = useState(150);
  const [ticketPrice, setTicketPrice] = useState(25);
  const [ticketsPerGuest, setTicketsPerGuest] = useState(2);

  const totalTickets = guests * ticketsPerGuest;
  const estimatedGross = totalTickets * ticketPrice * 100;
  const feePercent = 0.049;
  const estimatedFee = Math.round(estimatedGross * feePercent);
  const estimatedNet = estimatedGross - estimatedFee;

  return (
    <div className="min-h-dvh w-full bg-background text-foreground selection:bg-primary/30">
      {/* Floating Glass Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-primary transition-opacity hover:opacity-90">
              Corta-Gravata
            </Link>
            <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex rounded-full border-primary/30 bg-primary/5 text-primary">
              Digital & Automatizado
            </Badge>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Button asChild variant="ghost" size="sm" className="apple-pressable rounded-full font-medium text-sm text-muted-foreground hover:text-foreground">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="apple-pressable rounded-full font-heading tracking-wide uppercase shadow-lg shadow-primary/20">
              <Link href="/cadastro">
                Criar Rifa Grátis <ArrowRightIcon className="size-3.5 ml-1" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-mono text-primary backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] animate-[fade-up_0.5s_ease_both]">
            <SparklesIcon className="size-3.5 text-primary" />
            A plataforma nº 1 de corta-gravata digital do Brasil
          </div>

          <h1 className="font-heading text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.1] animate-[fade-up_0.5s_ease_0.1s_both]">
            O Corta-Gravata que{' '}
            <span className="bg-gradient-to-r from-primary via-[#f4e8c1] to-primary bg-clip-text text-transparent">
              arrecada o triplo
            </span>{' '}
            e dá zero trabalho.
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground font-normal leading-relaxed animate-[fade-up_0.5s_ease_0.2s_both]">
            Substitua a gravata picotada por uma rifa moderna tipo bingo com PIX automático, telão ao vivo no projetor e saques instantâneos direto para a conta dos noivos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-[fade-up_0.5s_ease_0.3s_both]">
            <Button asChild size="lg" className="apple-pressable h-12 px-8 rounded-full font-heading text-base uppercase tracking-wider shadow-xl shadow-primary/25 w-full sm:w-auto">
              <Link href="/cadastro">
                Criar Minha Rifa Agora
                <ArrowRightIcon className="size-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="apple-pressable h-12 px-8 rounded-full border-white/20 bg-white/5 font-heading text-base backdrop-blur-md hover:bg-white/10 w-full sm:w-auto">
              <Link href="/e/bruno-moreira" target="_blank">
                Ver Exemplo ao Vivo <ExternalLinkIcon className="size-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Sem mensalidade
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Saque PIX instantâneo
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> 100% automatizado
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Revenue Calculator */}
      <section className="relative border-y border-white/10 bg-black/20 py-20 px-4 sm:px-8 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Simulador Interativo
            </Badge>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Calcule quanto vocês podem arrecadar
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Veja a diferença entre pedir dinheiro trocado e usar uma experiência digital gamificada no telão.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Sliders Card */}
            <div className="lg:col-span-6 space-y-6 apple-glass p-8 rounded-3xl">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Número de Convidados</span>
                  <span className="apple-numeral font-bold text-primary">{guests} convidados</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Valor por Número</span>
                  <span className="apple-numeral font-bold text-primary">R$ {ticketPrice},00</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Média de Números por Convidado</span>
                  <span className="apple-numeral font-bold text-primary">{ticketsPerGuest} números</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={ticketsPerGuest}
                  onChange={(e) => setTicketsPerGuest(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              <div className="rounded-2xl bg-white/5 p-4 border border-white/10 text-xs text-muted-foreground space-y-1">
                <p>💡 <strong>Dica de ouro:</strong> Em média, convidados compram de 2 a 4 números para aumentar as chances de levar o prêmio especial da festa!</p>
              </div>
            </div>

            {/* Calculated Result Card */}
            <div className="lg:col-span-6">
              <Card className="apple-glass rounded-3xl border-primary/40 shadow-[0_20px_60px_-15px_rgba(198,167,94,0.3)]">
                <CardHeader className="pb-3">
                  <CardDescription className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Estimativa Líquida para os Noivos
                  </CardDescription>
                  <CardTitle className="apple-numeral font-mono text-5xl font-extrabold text-primary">
                    {formatBRL(estimatedNet)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Arrecadação Bruta ({totalTickets} bilhetes)</span>
                      <span className="apple-numeral font-medium text-foreground">{formatBRL(estimatedGross)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxa da Plataforma (4.9%)</span>
                      <span className="apple-numeral font-medium text-destructive">- {formatBRL(estimatedFee)}</span>
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between font-semibold text-foreground text-base">
                      <span>Disponível para Saque PIX</span>
                      <span className="apple-numeral font-bold text-primary text-lg">{formatBRL(estimatedNet)}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-primary/10 p-3.5 text-xs text-primary border border-primary/20 leading-relaxed">
                    ✨ <strong>Comparativo:</strong> No método antigo com notas de papel picotadas, noivos arrecadam em média apenas R$ 1.200 a R$ 1.800 pela escassez de cédulas dos convidados.
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="apple-pressable w-full h-12 rounded-full font-heading tracking-wider uppercase shadow-lg shadow-primary/25">
                    <Link href="/cadastro">
                      Garantir Essa Arrecadação
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-14">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Recursos Exclusivos
            </Badge>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo pronto para a sua festa bombar
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Desenvolvido com o refinamento estético do Apple HIG e arquitetura de pagamentos ultra rápida.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="apple-glass-interactive rounded-3xl border-white/10 p-2">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <WalletIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">PIX Automático & Saque</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Sem planilhas ou conferências manuais. O convidado escaneia o QR Code, paga pelo app do banco e o saldo cai na hora para o casal.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="apple-glass-interactive rounded-3xl border-white/10 p-2">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <TvIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">Telão ao Vivo na Festa</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Projete a contagem dos números vendidos e o sorteio com animações empolgantes, prendendo a atenção de todos os convidados.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="apple-glass-interactive rounded-3xl border-white/10 p-2">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <ShieldCheckIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">Padrinhos Vendendo</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Console exclusivo com PIN de segurança. Os padrinhos circulam com o celular e marcam os números para quem pagar em dinheiro.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="apple-glass-interactive rounded-3xl border-white/10 p-2">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <PaletteIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">4 Temas de Alto Padrão</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Champagne & Navy, Rose Gold, Emerald Brass e Monochrome Slate. Escolha o tema que combina exatamente com a identidade da sua festa.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="apple-glass-interactive rounded-3xl border-white/10 p-2">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <PartyPopperIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">Sorteio Criptográfico</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Encerre as vendas com um clique e sorteie os prêmios na hora. 100% auditável, justo e emocionante para quem participou.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="apple-glass-interactive rounded-3xl border-white/10 p-2">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <CoinsIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">Transparência Total</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Sem mensalidade, sem taxa de setup ou custos ocultos. Retemos apenas 4.9% das vendas efetuadas com sucesso.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative border-t border-white/10 bg-black/20 py-24 px-4 sm:px-8 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl space-y-14">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Como funciona em 3 passos simples
            </h2>
            <p className="text-sm text-muted-foreground">
              Tudo pronto em menos de 5 minutos antes do casamento.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="apple-glass rounded-3xl p-6 space-y-3 text-center sm:text-left">
              <div className="size-10 rounded-full bg-primary/20 text-primary font-heading text-lg font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                1
              </div>
              <h3 className="font-heading text-xl font-bold">Crie a Rifa do Casal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Informe o nome dos noivos, valor do número e os prêmios que serão sorteados na festa.
              </p>
            </div>

            <div className="apple-glass rounded-3xl p-6 space-y-3 text-center sm:text-left">
              <div className="size-10 rounded-full bg-primary/20 text-primary font-heading text-lg font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                2
              </div>
              <h3 className="font-heading text-xl font-bold">Compartilhe na Festa</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Coloque o QR Code nas mesas, transmita no telão da pista e deixe os padrinhos venderem pelo celular.
              </p>
            </div>

            <div className="apple-glass rounded-3xl p-6 space-y-3 text-center sm:text-left">
              <div className="size-10 rounded-full bg-primary/20 text-primary font-heading text-lg font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                3
              </div>
              <h3 className="font-heading text-xl font-bold">Saque o PIX na Hora</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Com o sorteio finalizado, aperte o botão de saque no painel e receba o valor direto na sua conta bancária.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-24 px-4 sm:px-8 border-t border-white/10 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Prontos para arrecadar mais na sua festa?
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Crie sua conta agora e comece a testar seu link imediatamente. Leva menos de 2 minutos.
          </p>
          <Button asChild size="lg" className="apple-pressable h-12 px-8 rounded-full font-heading text-base uppercase tracking-wider shadow-xl shadow-primary/25">
            <Link href="/cadastro">
              Criar Minha Rifa Grátis
              <ArrowRightIcon className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Corta-Gravata SaaS. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
