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
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-primary">
              Corta-Gravata
            </Link>
            <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex border-primary/30 text-primary">
              Digital & Automatizado
            </Badge>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Button asChild variant="ghost" size="sm" className="font-medium text-sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="font-heading uppercase tracking-wider shadow-md">
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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono text-primary animate-[fade-up_0.5s_ease_both]">
            <SparklesIcon className="size-3.5" />
            A plataforma nº 1 de corta-gravata digital do Brasil
          </div>

          <h1 className="font-heading text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.1] animate-[fade-up_0.5s_ease_0.1s_both]">
            O Corta-Gravata que{' '}
            <span className="bg-gradient-to-r from-primary via-[#e5c982] to-primary bg-clip-text text-transparent">
              arrecada o triplo
            </span>{' '}
            e dá zero trabalho.
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground animate-[fade-up_0.5s_ease_0.2s_both]">
            Substitua a tradicional gravata picotada por uma rifa moderna tipo bingo com PIX automático, telão ao vivo no projetor e saques instantâneos direto para a conta dos noivos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-[fade-up_0.5s_ease_0.3s_both]">
            <Button asChild size="lg" className="h-12 px-8 font-heading text-base uppercase tracking-wider shadow-lg shadow-primary/20 w-full sm:w-auto">
              <Link href="/cadastro">
                Criar Minha Rifa Agora
                <ArrowRightIcon className="size-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 font-heading text-base w-full sm:w-auto">
              <Link href="/e/bruno-marina" target="_blank">
                Ver Exemplo ao Vivo <ExternalLinkIcon className="size-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Sem mensalidade
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Saque PIX na hora
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> 100% automatizado
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Revenue Calculator */}
      <section className="border-y border-border/50 bg-card/40 py-16 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider">
              Simulador Interativo
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Calcule quanto vocês podem arrecadar
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Veja a diferença entre pedir dinheiro trocado e usar uma experiência interativa gamificada.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Sliders */}
            <div className="lg:col-span-6 space-y-6 bg-card/60 p-6 rounded-2xl border border-border/60">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Número de Convidados</span>
                  <span className="font-mono font-bold text-primary">{guests} convidados</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Valor por Número</span>
                  <span className="font-mono font-bold text-primary">R$ {ticketPrice},00</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Média de Números por Convidado</span>
                  <span className="font-mono font-bold text-primary">{ticketsPerGuest} números</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={ticketsPerGuest}
                  onChange={(e) => setTicketsPerGuest(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="rounded-lg bg-background/60 p-4 border border-border/40 text-xs text-muted-foreground space-y-1">
                <p>💡 <strong>Dica de ouro:</strong> Em média, convidados compram de 2 a 4 números para aumentar as chances de ganhar o whisky ou o brinde especial!</p>
              </div>
            </div>

            {/* Calculated Result Card */}
            <div className="lg:col-span-6">
              <Card className="border-primary/40 bg-gradient-to-br from-card to-primary/10 shadow-[0_0_50px_-20px_var(--glow)]">
                <CardHeader>
                  <CardDescription className="font-mono text-xs uppercase tracking-wider">
                    Estimativa Líquida para os Noivos
                  </CardDescription>
                  <CardTitle className="font-mono text-5xl font-extrabold text-primary tabular-nums">
                    {formatBRL(estimatedNet)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Arrecadação Bruta ({totalTickets} bilhetes)</span>
                      <span className="font-mono">{formatBRL(estimatedGross)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxa da Plataforma (4.9%)</span>
                      <span className="font-mono text-destructive">- {formatBRL(estimatedFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Disponível para Saque PIX</span>
                      <span className="font-mono text-primary">{formatBRL(estimatedNet)}</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary border border-primary/20">
                    ✨ <strong>Comparativo:</strong> No método tradicional com dinheiro em espécie, casais arrecadam em média apenas R$ 1.200 a R$ 1.800 pela falta de trocado.
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full font-heading tracking-wider uppercase shadow-md">
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
      <section className="py-20 px-4 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider">
              Recursos Exclusivos
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Tudo pronto para a sua festa bombar
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Desenvolvido com padrão visual refinado e arquitetura de pagamentos ultra rápida.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border-border/60 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <WalletIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">PIX Automático & Saque</CardTitle>
                <CardDescription>
                  Sem planilhas ou conferências manuais. O convidado escaneia o QR Code, paga pelo app do banco e o saldo cai na hora para o casal.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/60 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <TvIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">Telão ao Vivo na Festa</CardTitle>
                <CardDescription>
                  Projete a contagem dos números vendidos e o sorteio com animações empolgantes, prendendo a atenção de todos os convidados.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/60 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <ShieldCheckIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">Padrinhos Vendendo</CardTitle>
                <CardDescription>
                  Console exclusivo com PIN de segurança. Os padrinhos circulam com o celular e marcam os números para quem pagar em dinheiro.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-border/60 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <PaletteIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">4 Temas de Alto Padrão</CardTitle>
                <CardDescription>
                  Champagne & Navy, Rose Gold, Emerald Brass e Monochrome Slate. Escolha o tema que combina exatamente com a identidade da sua festa.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-border/60 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <PartyPopperIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">Sorteio Criptográfico</CardTitle>
                <CardDescription>
                  Encerre as vendas com um clique e sorteie os prêmios na hora. 100% auditável, justo e emocionante para quem participou.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-border/60 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <CoinsIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl">Transparência Total</CardTitle>
                <CardDescription>
                  Sem mensalidade, sem taxa de setup ou custos ocultos. Retemos apenas 4.9% das vendas efetuadas com sucesso.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t border-border/50 bg-card/20 py-20 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Como funciona em 3 passos simples
            </h2>
            <p className="text-sm text-muted-foreground">
              Tudo pronto em menos de 5 minutos antes do casamento.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-3 text-center sm:text-left">
              <div className="size-10 rounded-full bg-primary/20 text-primary font-heading text-lg font-bold flex items-center justify-center mx-auto sm:mx-0">
                1
              </div>
              <h3 className="font-heading text-xl font-bold">Crie a Rifa do Casal</h3>
              <p className="text-sm text-muted-foreground">
                Informe o nome dos noivos, valor do número e os prêmios que serão sorteados na festa.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="size-10 rounded-full bg-primary/20 text-primary font-heading text-lg font-bold flex items-center justify-center mx-auto sm:mx-0">
                2
              </div>
              <h3 className="font-heading text-xl font-bold">Compartilhe na Festa</h3>
              <p className="text-sm text-muted-foreground">
                Coloque o QR Code nas mesas, transmita no telão da pista e deixe os padrinhos venderem pelo celular.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="size-10 rounded-full bg-primary/20 text-primary font-heading text-lg font-bold flex items-center justify-center mx-auto sm:mx-0">
                3
              </div>
              <h3 className="font-heading text-xl font-bold">Saque o PIX na Hora</h3>
              <p className="text-sm text-muted-foreground">
                Com o sorteio finalizado, aperte o botão de saque no painel e receba o valor direto na sua conta bancária.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-20 px-4 sm:px-8 border-t border-border/50 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="font-heading text-4xl font-extrabold sm:text-5xl">
            Prontos para arrecadar mais na sua festa?
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Crie sua conta agora e comece a testar seu link imediatamente. Leva menos de 2 minutos.
          </p>
          <Button asChild size="lg" className="h-12 px-8 font-heading text-base uppercase tracking-wider shadow-xl shadow-primary/20">
            <Link href="/cadastro">
              Criar Minha Rifa Grátis
              <ArrowRightIcon className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Corta-Gravata SaaS. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
