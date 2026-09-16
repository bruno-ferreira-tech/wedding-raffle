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
    <div className="min-h-dvh w-full bg-background text-foreground">
      {/* Warm Ivory Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-8 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-85">
              Corta-Gravata
            </Link>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex rounded-full border-primary/40 bg-primary/10 text-primary font-medium px-3 py-0.5">
              Rifa do Casal
            </Badge>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Button asChild variant="ghost" size="sm" className="rounded-full font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-black/5">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="wedding-button rounded-full text-sm">
              <Link href="/cadastro">
                Criar Rifa dos Noivos <ArrowRightIcon className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-24">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-primary shadow-xs">
            <SparklesIcon className="size-3.5 text-primary" />
            A tradição do casamento, sem constrangimento e com muita diversão
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.15]">
            O Corta-Gravata que{' '}
            <span className="text-primary italic">
              arrecada mais
            </span>{' '}
            e alegra a festa.
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Substitua a gravata picotada por uma experiência leve e elegante: os convidados participam pelo celular via PIX, acompanham os números no telão e concorrem a um prêmio especial da noite.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="wedding-button h-13 px-8 rounded-full text-base font-semibold w-full sm:w-auto shadow-md">
              <Link href="/cadastro">
                Criar Rifa da Nossa Festa
                <ArrowRightIcon className="size-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-13 px-8 rounded-full border-border bg-card text-foreground text-base hover:bg-muted font-medium w-full sm:w-auto shadow-xs">
              <Link href="/e/bruno-moreira" target="_blank">
                Ver Exemplo ao Vivo <ExternalLinkIcon className="size-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Sem mensalidade fixa
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Saque PIX direto na conta
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Pronto em 3 minutos
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Revenue Calculator */}
      <section className="relative border-y border-border bg-secondary/40 py-20 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="rounded-full border-border bg-card text-xs uppercase tracking-wider text-muted-foreground">
              Simulador da Festa
            </Badge>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Quanto vocês podem arrecadar para a Lua de Mel?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Sem precisar de dinheiro trocado, convidados participam com facilidade pelo PIX direto na mesa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Sliders Card */}
            <div className="lg:col-span-6 space-y-6 wedding-card p-6 sm:p-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Convidados esperados</span>
                  <span className="wedding-numeral font-bold text-primary">{guests} pessoas</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Valor por bilhete</span>
                  <span className="wedding-numeral font-bold text-primary">R$ {ticketPrice},00</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Média de números por convidado</span>
                  <span className="wedding-numeral font-bold text-primary">{ticketsPerGuest} bilhetes</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={ticketsPerGuest}
                  onChange={(e) => setTicketsPerGuest(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg appearance-none"
                />
              </div>

              <div className="rounded-xl bg-primary/5 p-4 border border-primary/20 text-xs text-muted-foreground space-y-1">
                <p>💡 <strong>Experiência real:</strong> A maioria dos convidados adquire 2 a 4 números para ajudar o casal e ter mais chances no sorteio.</p>
              </div>
            </div>

            {/* Calculated Result Card */}
            <div className="lg:col-span-6">
              <Card className="wedding-card border-primary/40 shadow-lg">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Estimativa Líquida para o Casal
                  </CardDescription>
                  <CardTitle className="wedding-numeral text-4xl sm:text-5xl font-bold text-primary">
                    {formatBRL(estimatedNet)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total arrecadado ({totalTickets} bilhetes)</span>
                      <span className="wedding-numeral font-medium text-foreground">{formatBRL(estimatedGross)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxa de serviço e PIX (4.9%)</span>
                      <span className="wedding-numeral font-medium text-muted-foreground">- {formatBRL(estimatedFee)}</span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between font-semibold text-foreground text-base">
                      <span>Disponível para saque</span>
                      <span className="wedding-numeral font-bold text-primary text-xl">{formatBRL(estimatedNet)}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/70 p-3.5 text-xs text-muted-foreground border border-border leading-relaxed">
                    ✨ <strong>Comparativo:</strong> Na tradicional gravata cortada com cédulas, o casal costuma arrecadar menos da metade porque quase ninguém anda com dinheiro em espécie.
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="wedding-button w-full h-12 rounded-full text-base font-semibold shadow-md">
                    <Link href="/cadastro">
                      Criar Nossa Rifa Grátis
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
            <Badge variant="outline" className="rounded-full border-border bg-card text-xs uppercase tracking-wider text-muted-foreground">
              Funcionalidades
            </Badge>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Tudo pensado com carinho para o seu casamento
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Simples para quem compra, divertido para os convidados e transparente para os noivos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="wedding-card-interactive p-2">
              <CardHeader>
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <WalletIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl text-foreground">PIX Direto & Seguro</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  O convidado aponta a câmera, faz o PIX no banco e o número é confirmado imediatamente. Sem precisar conferir comprovantes.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="wedding-card-interactive p-2">
              <CardHeader>
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <TvIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl text-foreground">Telão Festivo ao Vivo</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Conecte o projetor do salão: a contagem de números sobe em tempo real e o sorteio gera um momento emocionante na pista.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="wedding-card-interactive p-2">
              <CardHeader>
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <ShieldCheckIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl text-foreground">Modo Padrinhos</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Seus padrinhos podem ajudar circulando com o celular e marcando quem pagou em dinheiro ou no Pix direto na mesa.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="wedding-card-interactive p-2">
              <CardHeader>
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <PaletteIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl text-foreground">Combina com a Decoração</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Escolha entre paletas elegantes (Champagne, Rosé Floral, Sálvia e Noite de Gala) para manter a harmonia visual da sua festa.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="wedding-card-interactive p-2">
              <CardHeader>
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <PartyPopperIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl text-foreground">Sorteio Transparente</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Realize o sorteio com apenas um clique. A animação revela o vencedor de forma clara, justa e com muita vibração.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="wedding-card-interactive p-2">
              <CardHeader>
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <CoinsIcon className="size-5" />
                </div>
                <CardTitle className="font-heading text-xl text-foreground">Sem Mensalidades</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Crie sua rifa gratuitamente. Só há a pequena taxa de 4.9% sobre o que for arrecadado na festa.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative border-t border-border bg-secondary/30 py-24 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-14">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Como funciona em 3 passos simples
            </h2>
            <p className="text-sm text-muted-foreground">
              Tudo pronto em poucos minutos, sem burocracia.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="wedding-card p-6 sm:p-8 space-y-4 text-center sm:text-left">
              <div className="size-10 rounded-full bg-primary text-white font-heading text-base font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                1
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">Crie a Rifa dos Noivos</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Personalize o nome do casal, o valor dos bilhetes e os mimos ou prêmios que serão sorteados.
              </p>
            </div>

            <div className="wedding-card p-6 sm:p-8 space-y-4 text-center sm:text-left">
              <div className="size-10 rounded-full bg-primary text-white font-heading text-base font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                2
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">Compartilhe na Festa</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Coloque plaquinhas com o QR Code nas mesas, no telão do salão e conte com os padrinhos na pista.
              </p>
            </div>

            <div className="wedding-card p-6 sm:p-8 space-y-4 text-center sm:text-left">
              <div className="size-10 rounded-full bg-primary text-white font-heading text-base font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                3
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">Receba via PIX</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ao finalizar a festa, transfira o valor acumulado direto para a conta bancária do casal em instantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-24 px-4 sm:px-8 border-t border-border text-center bg-card">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Prontos para celebrar com alegria e leveza?
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Crie sua conta agora mesmo e teste o link da sua rifa sem compromisso.
          </p>
          <Button asChild size="lg" className="wedding-button h-13 px-8 rounded-full text-base font-semibold shadow-md">
            <Link href="/cadastro">
              Criar Rifa dos Noivos Grátis
              <ArrowRightIcon className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-8 text-center text-xs text-muted-foreground bg-background">
        <p>© {new Date().getFullYear()} Corta-Gravata • Celebrando o amor com elegância e diversão.</p>
      </footer>
    </div>

  );
}
