'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  GiftIcon,
  LogOutIcon,
  PartyPopperIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TvIcon,
  WalletIcon,
  XIcon,
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
  fetchDashboardEvent,
  fetchDashboardEvents,
  fetchEventBalance,
  fetchMe,
  listEventPayouts,
  logoutCouple,
  requestEventPayout,
  type BalanceSummary,
  type EventDetail,
  type Payout,
  type User,
} from '@/lib/api';
import { formatBRL } from '@/lib/money';
// Motion.dev — used for stagger animations on financial stats cards
import { motion, AnimatePresence } from 'motion/react';
import { cardReveal, staggerContainer, scalePop } from '@/lib/animations';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
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
        const detailed = await fetchDashboardEvent(eventsList[0].id);
        setEvent(detailed);

        const [bal, history] = await Promise.all([
          fetchEventBalance(detailed.id),
          listEventPayouts(detailed.id),
        ]);
        setBalance(bal);
        setPayouts(history);
        const resolvedKey = bal.pixKey || detailed.pixKey;
        const resolvedType = bal.pixKeyType || detailed.pixKeyType || 'cpf';
        if (resolvedKey) {
          setPixKey(resolvedKey);
          setPixKeyType(resolvedType);
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
    <div className="min-h-dvh w-full bg-[#faf8f5] text-stone-900">
      <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#faf8f5]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-xl font-bold tracking-tight text-stone-900 hover:opacity-85">
              Corta-Gravata
            </Link>
            <span className="hidden sm:inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-800">
              Painel dos Noivos
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden md:inline text-stone-600">
              Olá, <strong className="text-stone-900">{user?.name}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="rounded-full border-stone-300 bg-white text-xs text-stone-700 hover:text-stone-900 hover:bg-stone-50"
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
            <span className="text-xs font-semibold tracking-wider text-[#855b1b] uppercase">
              Visão Geral
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-stone-900">
              {event?.coupleNames ? `Casamento ${event.coupleNames}` : 'Seu Casamento'}
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-[54ch] leading-relaxed font-normal">
              Acompanhe a arrecadação da rifa em tempo real e transfira o saldo via PIX para sua conta bancária.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="rounded-full border-stone-300 bg-white text-xs font-semibold text-stone-800 h-9 hover:bg-stone-50">
              <Link href="/dashboard/configurar">
                <SettingsIcon className="size-3.5 mr-1.5 text-stone-600" />
                Configurar Rifa
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-full text-xs font-semibold h-9 px-5 bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(44,38,30,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer">
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
            <Card className="rounded-[24px] border border-stone-300 bg-white shadow-[0_2px_8px_rgba(44,38,30,0.04),0_18px_36px_-6px_rgba(44,38,30,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] p-6 h-full flex flex-col justify-between">
              <CardHeader className="p-0 pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase tracking-wider font-bold text-stone-600">
                    Saldo Disponível
                  </CardDescription>
                  <span className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-800">
                    Livre para Saque
                  </span>
                </div>
                <CardTitle className="wedding-numeral text-4xl sm:text-5xl font-bold text-stone-900 mt-2 tabular-nums">
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
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  Livre de taxas adicionais. Transferência instantânea via PIX para a sua chave cadastrada.
                </p>
              </CardContent>
              <CardFooter className="p-0 pt-4">
                <Button
                  className="w-full h-12 rounded-full text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_12px_28px_-6px_rgba(44,38,30,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer disabled:opacity-50"
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
            <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 h-full flex flex-col justify-between">
              <CardHeader className="p-0 pb-2">
                <CardDescription className="text-xs uppercase tracking-wider font-bold text-stone-600">
                  Arrecadação Bruta
                </CardDescription>
                <CardTitle className="wedding-numeral text-3xl font-bold mt-1 text-stone-900 tabular-nums">
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
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span className="font-medium">Taxa da Plataforma ({balance?.platformFeePercent ?? 4.9}%)</span>
                  <span className="text-stone-600 font-medium">
                    - {balance ? formatBRL(balance.platformFeeCents) : 'R$ 0,00'}
                  </span>
                </div>
                <Separator className="bg-stone-200" />
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-stone-700">Total Líquido Arrecadado</span>
                  <span className="wedding-numeral text-stone-900 text-base font-bold tabular-nums">
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
              <div className="pt-3 text-xs text-stone-500 font-medium">
                Calculado automaticamente a cada pagamento confirmado.
              </div>
            </Card>
          </motion.div>

          {/* Card 3: Histórico de Saques */}
          <motion.div variants={cardReveal}>
            <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 h-full flex flex-col justify-between">
              <CardHeader className="p-0 pb-2">
                <CardDescription className="text-xs uppercase tracking-wider font-bold text-stone-600">
                  Total Já Transferido
                </CardDescription>
                <CardTitle className="wedding-numeral text-3xl font-bold mt-1 text-stone-800 tabular-nums">
                  {balance ? formatBRL(balance.totalWithdrawnCents) : 'R$ 0,00'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-3 space-y-2">
                <p className="text-xs text-stone-600 font-medium">
                  {payouts.length === 0
                    ? 'Nenhum saque realizado até o momento.'
                    : `${payouts.length} ${payouts.length === 1 ? 'saque realizado' : 'saques realizados'} com sucesso.`}
                </p>
                {balance?.lastPayoutAt ? (
                  <p className="text-xs text-stone-500">
                    Último saque em {new Date(balance.lastPayoutAt).toLocaleDateString('pt-BR')}.
                  </p>
                ) : null}
              </CardContent>
              <div className="pt-3 text-xs text-stone-600 font-medium">
                Chave cadastrada: <strong className="text-stone-800">{balance?.pixKey || 'Nenhuma'}</strong>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Prêmios Cadastrados & Configuração da Rifa */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <GiftIcon className="size-5 text-[#855b1b]" />
                <h2 className="font-heading text-xl font-bold text-stone-900">
                  Prêmios Cadastrados para o Sorteio
                </h2>
              </div>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                Prêmios que serão sorteados na festa para os convidados participantes da rifa.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-50 h-9">
              <Link href="/dashboard/configurar">
                <SettingsIcon className="size-3.5 mr-1.5" />
                Gerenciar Prêmios e Regras
              </Link>
            </Button>
          </div>

          <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-5 sm:p-6">
            {event?.prizes && event.prizes.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {event.prizes.map((p, idx) => (
                    <div
                      key={p.prizeIndex ?? idx}
                      className="flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-stone-50/70 p-4 transition-all hover:border-stone-300 hover:bg-stone-50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-stone-50 text-xs font-bold font-mono shadow-2xs">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#855b1b]">
                          {idx === 0 ? 'Prêmio Principal' : `${idx + 1}º Prêmio`}
                        </p>
                        <p className="text-sm font-semibold text-stone-900 truncate">
                          {p.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4 text-xs text-stone-600 font-medium">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>
                      Valor por bilhete: <strong className="text-stone-900">{event ? formatBRL(event.ticketPriceCents) : 'R$ 20,00'}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Total de bilhetes: <strong className="text-stone-900">{event?.totalNumbers ?? 1000}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Status da rifa:{' '}
                      <strong className={event?.salesStatus === 'closed' ? 'text-red-700' : 'text-emerald-700'}>
                        {event?.salesStatus === 'closed' ? 'Pausada para o sorteio' : 'Vendas abertas'}
                      </strong>
                    </span>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-stone-700 hover:text-stone-900 p-0 hover:bg-transparent">
                    <Link href="/dashboard/configurar" className="underline underline-offset-4">
                      Adicionar mais prêmios →
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 text-center sm:text-left">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-[#855b1b]">
                    <GiftIcon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-stone-900">
                      Nenhum prêmio cadastrado ainda
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5 font-medium">
                      Adicione prêmios (ex: Whisky 12 anos, Caixa JBL, Airfryer) para animar os convidados a participarem da rifa.
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold px-5 h-9 shrink-0">
                  <Link href="/dashboard/configurar">
                    Adicionar Primeiro Prêmio
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        </section>

        {/* Quick Access Links */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-stone-900">Links de Acesso Rápido</h2>
              <p className="text-xs text-stone-600 font-medium">Compartilhe o link da rifa com os convidados, o telão no salão e o acesso dos padrinhos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Guest Cartela Link */}
            <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-800">
                    📱 Para os Convidados
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-stone-100 text-stone-700"
                    disabled={!guestUrl}
                    onClick={() => copyToClipboard(guestUrl, 'Link dos Convidados')}
                  >
                    {copiedLink === 'Link dos Convidados' ? (
                      <CheckIcon className="size-3.5 text-emerald-700" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-heading text-lg font-bold mt-3 text-stone-900">Página da Rifa</h3>
                <p className="text-xs text-stone-500 font-mono line-clamp-1 mt-0.5">
                  {guestUrl || 'Gerando link da rifa...'}
                </p>
              </div>
              <div className="pt-4">
                {guestUrl ? (
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full border-stone-300 bg-white hover:bg-stone-50 h-10 font-semibold text-xs text-stone-800">
                    <a href={guestUrl} target="_blank" rel="noopener noreferrer">
                      Abrir Rifa <ExternalLinkIcon className="size-3.5 ml-1.5" />
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full rounded-full h-10" disabled>
                    <Spinner className="size-3.5 mr-1.5" /> Carregando...
                  </Button>
                )}
              </div>
            </Card>

            {/* Telão Interativo */}
            <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-800">
                    🖥️ Para o Telão / Projetor
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-stone-100 text-stone-700"
                    disabled={!telaoUrl}
                    onClick={() => copyToClipboard(telaoUrl, 'Link do Telão')}
                  >
                    {copiedLink === 'Link do Telão' ? (
                      <CheckIcon className="size-3.5 text-emerald-700" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-heading text-lg font-bold mt-3 text-stone-900">Telão ao Vivo</h3>
                <p className="text-xs text-stone-500 font-mono line-clamp-1 mt-0.5">
                  {telaoUrl || 'Gerando link do telão...'}
                </p>
              </div>
              <div className="pt-4">
                {telaoUrl ? (
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full border-stone-300 bg-white hover:bg-stone-50 h-10 font-semibold text-xs text-stone-800">
                    <a href={telaoUrl} target="_blank" rel="noopener noreferrer">
                      Abrir Telão <TvIcon className="size-3.5 ml-1.5" />
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full rounded-full h-10" disabled>
                    <Spinner className="size-3.5 mr-1.5" /> Carregando...
                  </Button>
                )}
              </div>
            </Card>

            {/* Console dos Padrinhos */}
            <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-800">
                    👔 Para os Padrinhos
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-stone-100 text-stone-700"
                    disabled={!padrinhoUrl}
                    onClick={() => copyToClipboard(padrinhoUrl, 'Link dos Padrinhos')}
                  >
                    {copiedLink === 'Link dos Padrinhos' ? (
                      <CheckIcon className="size-3.5 text-emerald-700" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-heading text-lg font-bold mt-3 text-stone-900">Modo Padrinhos</h3>
                <p className="text-xs text-stone-500 font-mono line-clamp-1 mt-0.5">
                  {padrinhoUrl || 'Gerando link dos padrinhos...'}
                </p>
              </div>
              <div className="pt-4">
                {padrinhoUrl ? (
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full border-stone-300 bg-white hover:bg-stone-50 h-10 font-semibold text-xs text-stone-800">
                    <a href={padrinhoUrl} target="_blank" rel="noopener noreferrer">
                      Abrir Acesso <ShieldCheckIcon className="size-3.5 ml-1.5" />
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full rounded-full h-10" disabled>
                    <Spinner className="size-3.5 mr-1.5" /> Carregando...
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Payouts History Table */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-stone-900">Histórico de Saques</h2>
          <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] overflow-hidden">
            <CardContent className="p-0">
              {payouts.length === 0 ? (
                <div className="p-10 text-center text-sm text-stone-500 font-medium">
                  Você ainda não solicitou nenhum saque. Assim que receber vendas, o saldo ficará disponível imediatamente.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/80 text-xs uppercase tracking-wider text-stone-600 font-bold">
                        <th className="p-4 pl-6">Data</th>
                        <th className="p-4">Valor</th>
                        <th className="p-4">Chave PIX</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6">Código PIX</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-xs">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="p-4 pl-6 text-sm text-stone-900">
                            {new Date(p.createdAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-4 font-bold text-stone-900 text-sm wedding-numeral tabular-nums">
                            {formatBRL(p.amountCents)}
                          </td>
                          <td className="p-4 text-stone-800">
                            <span className="uppercase text-stone-500 mr-1">({p.pixKeyType})</span>
                            {p.pixKey}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                              {p.status === 'completed' ? 'Transferido' : p.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-stone-500 font-mono">
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

        {/* PIX Cashout Modal with Spring Animation and High-Craft UI */}
        <AnimatePresence>
          {payoutOpen && balance ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setPayoutOpen(false);
              }}
            >
              <motion.div
                variants={scalePop}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="relative w-full max-w-lg rounded-[28px] border border-stone-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-stone-900 text-stone-50 shadow-sm">
                      <WalletIcon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-stone-900">Solicitar Saque PIX</h3>
                      <p className="text-xs text-stone-600 font-medium mt-0.5">
                        Transferência gratuita e imediata para sua conta bancária.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPayoutOpen(false)}
                    className="size-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>

                {/* Available Balance Box */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-stone-600 block">
                      Saldo Disponível
                    </span>
                    <span className="wedding-numeral text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
                      {formatBRL(balance.availableBalanceCents)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPayoutAmount((balance.availableBalanceCents / 100).toFixed(2));
                    }}
                    className="rounded-full text-xs font-semibold border-stone-300 bg-white hover:bg-stone-100 text-stone-800"
                  >
                    Sacar Tudo
                  </Button>
                </div>

                <form onSubmit={onRequestPayout} className="space-y-4">
                  <FieldGroup>
                    {/* Chave PIX Section */}
                    <div className="grid grid-cols-3 gap-3">
                      <Field className="col-span-1">
                        <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-stone-700">Tipo</FieldLabel>
                        <select
                          aria-label="Tipo de Chave PIX"
                          value={pixKeyType}
                          onChange={(e) => setPixKeyType(e.target.value)}
                          className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3 py-1 text-sm shadow-2xs focus-visible:ring-2 focus-visible:ring-stone-900 outline-none font-medium text-stone-800"
                        >
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                          <option value="email">E-mail</option>
                          <option value="phone">Telefone</option>
                          <option value="random">Aleatória</option>
                        </select>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="pixKey" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                          Chave PIX de Destino *
                        </FieldLabel>
                        <Input
                          id="pixKey"
                          required
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          placeholder={
                            pixKeyType === 'cpf'
                              ? '000.000.000-00'
                              : pixKeyType === 'cnpj'
                                ? '00.000.000/0000-00'
                                : pixKeyType === 'email'
                                  ? 'seu-email@exemplo.com'
                                  : pixKeyType === 'phone'
                                    ? '(11) 99999-9999'
                                    : 'Chave aleatória'
                          }
                          className="h-11 rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-2xs font-medium"
                        />
                      </Field>
                    </div>

                    {/* Valor do Saque */}
                    <Field>
                      <div className="flex items-center justify-between mb-1">
                        <FieldLabel htmlFor="payoutAmount" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                          Valor a Transferir (R$)
                        </FieldLabel>
                        <span className="text-[11px] text-stone-500 font-medium">
                          Deixe em branco para sacar o valor total
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500">
                          R$
                        </span>
                        <Input
                          id="payoutAmount"
                          type="number"
                          step="0.01"
                          min="1"
                          max={balance.availableBalanceCents / 100}
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder={(balance.availableBalanceCents / 100).toFixed(2)}
                          className="h-12 pl-10 rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 wedding-numeral font-bold text-lg shadow-2xs"
                        />
                      </div>
                    </Field>
                  </FieldGroup>

                  {/* Summary Breakdown */}
                  <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 text-xs space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>Valor da transferência:</span>
                      <strong className="text-stone-900 wedding-numeral tabular-nums">
                        {formatBRL(
                          payoutAmount
                            ? Math.round(parseFloat(payoutAmount.replace(',', '.')) * 100) || 0
                            : balance.availableBalanceCents,
                        )}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de saque:</span>
                      <span className="text-emerald-700 font-semibold">R$ 0,00 (Gratuito)</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200 pt-1.5 font-medium">
                      <span>Saldo restante na conta:</span>
                      <strong className="text-stone-800 wedding-numeral tabular-nums">
                        {formatBRL(
                          Math.max(
                            0,
                            balance.availableBalanceCents -
                              (payoutAmount
                                ? Math.round(parseFloat(payoutAmount.replace(',', '.')) * 100) || 0
                                : balance.availableBalanceCents),
                          ),
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* Modal Footer Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setPayoutOpen(false)}
                      className="rounded-full text-xs font-semibold text-stone-700 hover:bg-stone-100"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={payoutPending || !pixKey.trim()}
                      className="h-11 px-7 rounded-full text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(44,38,30,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer disabled:opacity-50"
                    >
                      {payoutPending ? <Spinner data-icon="inline-start" /> : null}
                      {payoutPending
                        ? 'Transferindo…'
                        : `Transferir ${formatBRL(
                            payoutAmount
                              ? Math.round(parseFloat(payoutAmount.replace(',', '.')) * 100) || 0
                              : balance.availableBalanceCents,
                          )}`}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
