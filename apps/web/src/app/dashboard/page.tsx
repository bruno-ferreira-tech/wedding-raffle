'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  LogOutIcon,
  PartyPopperIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TvIcon,
  WalletIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { NumberTicker } from '@/components/ui/number-ticker';
import {
  ApiError,
  createDashboardEvent,
  fetchDashboardEvents,
  fetchEventBalance,
  fetchMe,
  listEventPayouts,
  logoutCouple,
  requestEventPayout,
  type BalanceSummary,
  type EventSummary,
  type Payout,
  type User,
} from '@/lib/api';
import { formatBRL } from '@/lib/money';
// Motion.dev — used for stagger animations on financial stats cards
import { motion } from 'motion/react';
import { cardReveal, staggerContainer } from '@/lib/animations';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cashout Modal State
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutPending, startPayoutTransition] = useTransition();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const meRes = await fetchMe();
      setUser(meRes.user);

      let eventsList = await fetchDashboardEvents();
      if (eventsList.length === 0) {
        try {
          await createDashboardEvent({
            coupleNames: meRes.user.name,
            title: `Casamento ${meRes.user.name}`,
            ticketPriceCents: 2000,
            totalNumbers: 1000,
            themeId: 'champagne-navy',
            padrinhoPin: '1234',
          });
          eventsList = await fetchDashboardEvents();
        } catch (createErr) {
          console.error('Failed to auto-create event:', createErr);
        }
      }

      if (eventsList.length > 0) {
        const currentEvent = eventsList[0];
        setEvent(currentEvent);

        const [bal, history] = await Promise.all([
          fetchEventBalance(currentEvent.id),
          listEventPayouts(currentEvent.id),
        ]);
        setBalance(bal);
        setPayouts(history);
        if (bal.pixKey) {
          setPixKey(bal.pixKey);
          if (bal.pixKeyType) setPixKeyType(bal.pixKeyType);
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
        return;
      }
      setError('Não foi possível carregar as informações do dashboard.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function onLogout() {
    try {
      await logoutCouple();
      toast.success('Você saiu do painel.');
      router.push('/');
    } catch {
      router.push('/');
    }
  }

  function copyToClipboard(text: string, label: string) {
    if (!text) {
      toast.error('O link ainda está sendo carregado.');
      return;
    }
    void navigator.clipboard.writeText(text);
    setCopiedLink(label);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopiedLink(null), 2500);
  }

  function onRequestPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !balance) return;

    if (!pixKey.trim()) {
      toast.error('Informe sua chave PIX.');
      return;
    }

    startPayoutTransition(async () => {
      try {
        const amountCents = payoutAmount ? Math.round(parseFloat(payoutAmount.replace(',', '.')) * 100) : undefined;

        await requestEventPayout(event.id, {
          amountCents,
          pixKey: pixKey.trim(),
          pixKeyType,
        });

        toast.success('Saque PIX enviado com sucesso! O dinheiro já está a caminho.');
        setPayoutOpen(false);
        setPayoutAmount('');
        await loadData();
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Falha ao solicitar saque.';
        toast.error(msg);
      }
    });
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const guestUrl = event ? `${origin}/e/${event.slug}` : '';
  const telaoUrl = event ? `${origin}/e/${event.slug}/telao` : '';
  const padrinhoUrl = event ? `${origin}/e/${event.slug}/padrinho` : '';

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-xl font-bold tracking-tight text-foreground hover:opacity-85">
              Corta-Gravata
            </Link>
            <span className="hidden sm:inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Painel dos Noivos
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden md:inline text-muted-foreground">
              Olá, <strong className="text-foreground">{user?.name}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="rounded-full border-border bg-card text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOutIcon className="size-3.5 mr-1.5" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
        {error ? (
          <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {/* Overview Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Visão Geral
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              {event?.coupleNames ? `Casamento ${event.coupleNames}` : 'Seu Casamento'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-[54ch] leading-relaxed">
              Acompanhe a arrecadação da rifa em tempo real e transfira o saldo via PIX para sua conta bancária.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="rounded-full border-border bg-card text-xs font-medium h-9">
              <Link href="/dashboard/configurar">
                <SettingsIcon className="size-3.5 mr-1.5 text-muted-foreground" />
                Configurar Rifa
              </Link>
            </Button>
            <Button asChild size="sm" className="wedding-button rounded-full text-xs font-semibold h-9 shadow-xs">
              <Link href="/dashboard/sorteio">
                <PartyPopperIcon className="size-3.5 mr-1.5" />
                Sorteio ao Vivo
              </Link>
            </Button>
          </div>
        </div>

        {/* Financial Cards Grid */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Card 1: Saldo Disponível para Saque */}
          <motion.div variants={cardReveal} className="lg:col-span-1">
            <Card className="wedding-card border-primary/40 shadow-md p-6 h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Saldo Disponível
                </CardDescription>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Livre para Saque
                </span>
              </div>
              <CardTitle className="wedding-numeral text-4xl sm:text-5xl font-bold text-primary mt-2">
                {balance ? (
                  <NumberTicker
                    value={balance.availableBalanceCents}
                    formatFn={(n) => formatBRL(Math.round(n))}
                  />
                ) : (
                  'R$ 0,00'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 py-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Livre de taxas adicionais. Transferência instantânea via PIX para a sua chave cadastrada.
              </p>
            </CardContent>
            <CardFooter className="p-0 pt-4">
              <Button
                className="wedding-button wedding-shimmer w-full h-12 rounded-2xl text-sm font-semibold shadow-md disabled:opacity-50"
                disabled={!balance || balance.availableBalanceCents <= 0}
                onClick={() => setPayoutOpen(true)}
              >
                <WalletIcon className="size-4 mr-2" />
                Sacar Saldo via PIX
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Card 2: Arrecadação Bruta & Líquida */}
        <motion.div variants={cardReveal}>
          <Card className="wedding-card shadow-sm p-6 h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Arrecadação Bruta
              </CardDescription>
              <CardTitle className="wedding-numeral text-3xl font-bold mt-1 text-foreground">
                {balance ? (
                  <NumberTicker
                    value={balance.grossRevenueCents}
                    formatFn={(n) => formatBRL(Math.round(n))}
                  />
                ) : (
                  'R$ 0,00'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3 pt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Taxa da Plataforma ({balance?.platformFeePercent ?? 4.9}%)</span>
                <span className="text-muted-foreground font-medium">
                  - {balance ? formatBRL(balance.platformFeeCents) : 'R$ 0,00'}
                </span>
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-muted-foreground">Total Líquido Arrecadado</span>
                <span className="wedding-numeral text-foreground text-base">
                  {balance ? (
                    <NumberTicker
                      value={balance.netRevenueCents}
                      formatFn={(n) => formatBRL(Math.round(n))}
                    />
                  ) : (
                    'R$ 0,00'
                  )}
                </span>
              </div>
            </CardContent>
            <div className="pt-3 text-xs text-muted-foreground">
              Calculado automaticamente a cada pagamento confirmado.
            </div>
          </Card>
        </motion.div>

        {/* Card 3: Histórico de Saques */}
        <motion.div variants={cardReveal}>
          <Card className="wedding-card shadow-sm p-6 h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Total Já Transferido
              </CardDescription>
              <CardTitle className="wedding-numeral text-3xl font-bold mt-1 text-muted-foreground">
                {balance ? formatBRL(balance.totalWithdrawnCents) : 'R$ 0,00'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                {payouts.length === 0
                  ? 'Nenhum saque realizado até o momento.'
                  : `${payouts.length} saque(s) realizado(s) com sucesso.`}
              </p>
              {balance?.lastPayoutAt ? (
                <p className="text-xs text-muted-foreground">
                  Último saque em {new Date(balance.lastPayoutAt).toLocaleDateString('pt-BR')}.
                </p>
              ) : null}
            </CardContent>
            <div className="pt-3 text-xs text-muted-foreground">
              Chave cadastrada: {balance?.pixKey || 'Nenhuma'}
            </div>
          </Card>
        </motion.div>
      </motion.div>

        {/* Quick Access Links */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Links de Acesso Rápido</h2>
              <p className="text-xs text-muted-foreground">Compartilhe o link da rifa com os convidados, o telão no salão e o acesso dos padrinhos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Guest Cartela Link */}
            <Card className="wedding-card-interactive p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    📱 Para os Convidados
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-muted"
                    disabled={!guestUrl}
                    onClick={() => copyToClipboard(guestUrl, 'Link dos Convidados')}
                  >
                    {copiedLink === 'Link dos Convidados' ? (
                      <CheckIcon className="size-3.5 text-primary" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-heading text-lg font-bold mt-3 text-foreground">Página da Rifa</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {guestUrl || 'Gerando link da rifa...'}
                </p>
              </div>
              <div className="pt-4">
                {guestUrl ? (
                  <Button asChild variant="outline" size="sm" className="w-full rounded-xl border-border bg-card hover:bg-muted h-10 font-semibold text-xs">
                    <a href={guestUrl} target="_blank" rel="noopener noreferrer">
                      Abrir Rifa <ExternalLinkIcon className="size-3.5 ml-1.5" />
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full rounded-xl h-10" disabled>
                    <Spinner className="size-3.5 mr-1.5" /> Carregando...
                  </Button>
                )}
              </div>
            </Card>

            {/* Telão Interativo */}
            <Card className="wedding-card-interactive p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    🖥️ Para o Telão / Projetor
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-muted"
                    disabled={!telaoUrl}
                    onClick={() => copyToClipboard(telaoUrl, 'Link do Telão')}
                  >
                    {copiedLink === 'Link do Telão' ? (
                      <CheckIcon className="size-3.5 text-primary" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-heading text-lg font-bold mt-3 text-foreground">Telão ao Vivo</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {telaoUrl || 'Gerando link do telão...'}
                </p>
              </div>
              <div className="pt-4">
                {telaoUrl ? (
                  <Button asChild variant="outline" size="sm" className="w-full rounded-xl border-border bg-card hover:bg-muted h-10 font-semibold text-xs">
                    <a href={telaoUrl} target="_blank" rel="noopener noreferrer">
                      Abrir Telão <TvIcon className="size-3.5 ml-1.5" />
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full rounded-xl h-10" disabled>
                    <Spinner className="size-3.5 mr-1.5" /> Carregando...
                  </Button>
                )}
              </div>
            </Card>

            {/* Console dos Padrinhos */}
            <Card className="wedding-card-interactive p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    👔 Para os Padrinhos
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-muted"
                    disabled={!padrinhoUrl}
                    onClick={() => copyToClipboard(padrinhoUrl, 'Link dos Padrinhos')}
                  >
                    {copiedLink === 'Link dos Padrinhos' ? (
                      <CheckIcon className="size-3.5 text-primary" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-heading text-lg font-bold mt-3 text-foreground">Modo Padrinhos</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {padrinhoUrl || 'Gerando link dos padrinhos...'}
                </p>
              </div>
              <div className="pt-4">
                {padrinhoUrl ? (
                  <Button asChild variant="outline" size="sm" className="w-full rounded-xl border-border bg-card hover:bg-muted h-10 font-semibold text-xs">
                    <a href={padrinhoUrl} target="_blank" rel="noopener noreferrer">
                      Abrir Acesso <ShieldCheckIcon className="size-3.5 ml-1.5" />
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full rounded-xl h-10" disabled>
                    <Spinner className="size-3.5 mr-1.5" /> Carregando...
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Payouts History Table */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-foreground">Histórico de Saques</h2>
          <Card className="wedding-card shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {payouts.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  Você ainda não solicitou nenhum saque. Assim que receber vendas, o saldo ficará disponível imediatamente.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        <th className="p-4 pl-6">Data</th>
                        <th className="p-4">Valor</th>
                        <th className="p-4">Chave PIX</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6">Identificador</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                          <td className="p-4 pl-6 text-sm text-foreground">
                            {new Date(p.createdAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-4 font-bold text-primary text-sm wedding-numeral">
                            {formatBRL(p.amountCents)}
                          </td>
                          <td className="p-4 text-foreground">
                            <span className="uppercase text-muted-foreground mr-1">({p.pixKeyType})</span>
                            {p.pixKey}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              {p.status === 'completed' ? 'Transferido' : p.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-muted-foreground">
                            {p.transferId || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* PIX Cashout Modal */}
        {payoutOpen && balance ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <WalletIcon className="size-4" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground">Solicitar Saque PIX</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  O valor de{' '}
                  <span className="font-bold text-primary wedding-numeral">
                    {formatBRL(balance.availableBalanceCents)}
                  </span>{' '}
                  será transferido automaticamente para sua conta bancária.
                </p>
              </div>

              <form onSubmit={onRequestPayout} className="space-y-4">
                <FieldGroup>
                  <div className="grid grid-cols-3 gap-3">
                    <Field className="col-span-1">
                      <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo</FieldLabel>
                      <select
                        aria-label="Tipo de Chave PIX"
                        value={pixKeyType}
                        onChange={(e) => setPixKeyType(e.target.value)}
                        className="h-11 w-full rounded-xl border border-border bg-background px-3 py-1 text-sm shadow-2xs focus-visible:ring-2 focus-visible:ring-primary outline-none"
                      >
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="email">E-mail</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Aleatória</option>
                      </select>
                    </Field>

                    <Field className="col-span-2">
                      <FieldLabel htmlFor="pixKey" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chave PIX</FieldLabel>
                      <Input
                        id="pixKey"
                        required
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="Insira sua chave PIX"
                        className="h-11 rounded-xl bg-background border-border focus:ring-2 focus:ring-primary shadow-2xs"
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="payoutAmount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Valor a Sacar (R$) — Em branco para o total
                    </FieldLabel>
                    <Input
                      id="payoutAmount"
                      type="number"
                      step="0.01"
                      max={balance.availableBalanceCents / 100}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder={(balance.availableBalanceCents / 100).toFixed(2)}
                      className="h-11 rounded-xl bg-background border-border focus:ring-2 focus:ring-primary wedding-numeral shadow-2xs"
                    />
                  </Field>
                </FieldGroup>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setPayoutOpen(false)}
                    className="rounded-full text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={payoutPending}
                    className="wedding-button h-11 px-6 rounded-2xl text-xs font-semibold shadow-md"
                  >
                    {payoutPending ? <Spinner data-icon="inline-start" /> : null}
                    {payoutPending ? 'Transferindo…' : 'Confirmar Saque Agora'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
