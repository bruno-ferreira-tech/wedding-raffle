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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  ApiError,
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

      const eventsList = await fetchDashboardEvents();
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
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-xl font-bold tracking-tight text-primary">
              Corta-Gravata
            </Link>
            <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex">
              Painel dos Noivos
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden md:inline text-muted-foreground">
              Olá, {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground">
              <LogOutIcon className="size-4 mr-1.5" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {/* Overview Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {event?.coupleNames ? `Casamento ${event.coupleNames}` : 'Seu Casamento'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe a arrecadação em tempo real e realize saques automatizados para sua conta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/configurar">
                <SettingsIcon className="size-4 mr-1.5" />
                Configurar Rifa
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/sorteio">
                <PartyPopperIcon className="size-4 mr-1.5 text-primary" />
                Sorteio ao Vivo
              </Link>
            </Button>
          </div>
        </div>

        {/* Financial Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Saldo Disponível para Saque */}
          <Card className="border-primary/40 bg-gradient-to-br from-card to-primary/10 shadow-[0_0_40px_-16px_var(--glow)] lg:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-mono">
                Saldo Disponível para Saque
              </CardDescription>
              <CardTitle className="font-mono text-4xl font-bold text-primary tabular-nums">
                {balance ? formatBRL(balance.availableBalanceCents) : 'R$ 0,00'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Livre de taxas. Transferência instantânea via PIX para sua conta.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full font-heading tracking-wide uppercase shadow-md"
                disabled={!balance || balance.availableBalanceCents <= 0}
                onClick={() => setPayoutOpen(true)}
              >
                <WalletIcon className="size-4 mr-2" />
                Sacar Saldo via PIX
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Arrecadação Bruta & Líquida */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-mono">
                Arrecadação Bruta
              </CardDescription>
              <CardTitle className="font-mono text-3xl font-bold tabular-nums">
                {balance ? formatBRL(balance.grossRevenueCents) : 'R$ 0,00'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Taxa da Plataforma ({balance?.platformFeePercent ?? 4.9}%)</span>
                <span className="font-mono text-destructive">
                  - {balance ? formatBRL(balance.platformFeeCents) : 'R$ 0,00'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Total Líquido Arrecadado</span>
                <span className="font-mono text-foreground">
                  {balance ? formatBRL(balance.netRevenueCents) : 'R$ 0,00'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Histórico de Saques */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-mono">
                Total Já Transferido
              </CardDescription>
              <CardTitle className="font-mono text-3xl font-bold tabular-nums text-muted-foreground">
                {balance ? formatBRL(balance.totalWithdrawnCents) : 'R$ 0,00'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-xs text-muted-foreground">
                {payouts.length === 0
                  ? 'Nenhum saque realizado até o momento.'
                  : `${payouts.length} saque(s) realizado(s) com sucesso.`}
              </p>
              {balance?.lastPayoutAt ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Último saque em {new Date(balance.lastPayoutAt).toLocaleDateString('pt-BR')}.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Links */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold">Links de Acesso Rápido</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Guest Cartela Link */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-xs">
                    📱 Para os Convidados
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => copyToClipboard(guestUrl, 'Link dos Convidados')}
                  >
                    {copiedLink === 'Link dos Convidados' ? (
                      <CheckIcon className="size-4 text-primary" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
                <CardTitle className="font-heading text-lg mt-2">Página da Rifa</CardTitle>
                <CardDescription className="text-xs line-clamp-1">{guestUrl}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={guestUrl} target="_blank" rel="noopener noreferrer">
                    Abrir Rifa <ExternalLinkIcon className="size-3.5 ml-1.5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>

            {/* Telão Interativo */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-xs">
                    🖥️ Para o Projetor / TV
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => copyToClipboard(telaoUrl, 'Link do Telão')}
                  >
                    {copiedLink === 'Link do Telão' ? (
                      <CheckIcon className="size-4 text-primary" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
                <CardTitle className="font-heading text-lg mt-2">Telão ao Vivo</CardTitle>
                <CardDescription className="text-xs line-clamp-1">{telaoUrl}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={telaoUrl} target="_blank" rel="noopener noreferrer">
                    Abrir Telão <TvIcon className="size-3.5 ml-1.5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>

            {/* Console dos Padrinhos */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-xs">
                    👔 Para os Padrinhos
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => copyToClipboard(padrinhoUrl, 'Link dos Padrinhos')}
                  >
                    {copiedLink === 'Link dos Padrinhos' ? (
                      <CheckIcon className="size-4 text-primary" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
                <CardTitle className="font-heading text-lg mt-2">Venda Assistida</CardTitle>
                <CardDescription className="text-xs line-clamp-1">{padrinhoUrl}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={padrinhoUrl} target="_blank" rel="noopener noreferrer">
                    Abrir Console <ShieldCheckIcon className="size-3.5 ml-1.5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Payouts History Table */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold">Histórico de Saques</h2>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0">
              {payouts.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Você ainda não solicitou nenhum saque. Assim que receber vendas, o saldo ficará disponível imediatamente.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="p-4">Data</th>
                        <th className="p-4">Valor</th>
                        <th className="p-4">Chave PIX</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">ID da Transferência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 font-mono text-xs">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/10">
                          <td className="p-4 font-sans text-sm">
                            {new Date(p.createdAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-4 font-bold text-primary text-sm">
                            {formatBRL(p.amountCents)}
                          </td>
                          <td className="p-4">
                            <span className="uppercase text-muted-foreground mr-1">({p.pixKeyType})</span>
                            {p.pixKey}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="border-primary/40 text-primary">
                              {p.status === 'completed' ? 'Transferido' : p.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-[fade-up_0.2s_ease_both]">
            <div className="relative w-full max-w-md rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl space-y-4">
              <div>
                <h3 className="font-heading text-xl font-bold">Solicitar Saque PIX</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  O valor de{' '}
                  <span className="font-bold text-primary">
                    {formatBRL(balance.availableBalanceCents)}
                  </span>{' '}
                  será transferido automaticamente para sua conta.
                </p>
              </div>

              <form onSubmit={onRequestPayout} className="space-y-4">
                <FieldGroup>
                  <div className="grid grid-cols-3 gap-3">
                    <Field className="col-span-1">
                      <FieldLabel>Tipo de Chave</FieldLabel>
                      <select
                        aria-label="Tipo de Chave PIX"
                        value={pixKeyType}
                        onChange={(e) => setPixKeyType(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                      >
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="email">E-mail</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Chave Aleatória</option>
                      </select>
                    </Field>

                    <Field className="col-span-2">
                      <FieldLabel htmlFor="pixKey">Chave PIX</FieldLabel>
                      <Input
                        id="pixKey"
                        required
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="Insira sua chave PIX"
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="payoutAmount">
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
                    />
                  </Field>
                </FieldGroup>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" type="button" onClick={() => setPayoutOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={payoutPending}
                    className="font-heading uppercase"
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
