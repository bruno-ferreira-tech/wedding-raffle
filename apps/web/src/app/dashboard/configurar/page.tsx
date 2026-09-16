'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckIcon,
  PaletteIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  ApiError,
  fetchDashboardEvents,
  fetchDashboardEvent,
  updateDashboardEvent,
  type EventDetail,
} from '@/lib/api';

const THEMES = [
  {
    id: 'champagne-navy',
    name: 'Champagne & Navy',
    subtitle: 'Cerimonial Luxuoso',
    bg: '#141829',
    primary: '#c6a75e',
    text: '#f8fafc',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold & Velvet',
    subtitle: 'Romântico & Suave',
    bg: '#25151c',
    primary: '#d4a373',
    text: '#fff1f2',
  },
  {
    id: 'emerald-brass',
    name: 'Emerald & Brass',
    subtitle: 'Floresta & Bronze',
    bg: '#12221a',
    primary: '#d4b26f',
    text: '#f0fdf4',
  },
  {
    id: 'monochrome-slate',
    name: 'Monochrome & Ivory',
    subtitle: 'Minimalista & Prata',
    bg: '#171923',
    primary: '#e2e8f0',
    text: '#ffffff',
  },
];

export default function ConfigureEventPage() {
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Form fields
  const [coupleNames, setCoupleNames] = useState('');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [themeId, setThemeId] = useState('champagne-navy');
  const [ticketPriceReais, setTicketPriceReais] = useState('20.00');
  const [totalNumbers, setTotalNumbers] = useState(1000);
  const [padrinhoPin, setPadrinhoPin] = useState('1234');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [prizes, setPrizes] = useState<Array<{ prizeIndex: number; label: string }>>([
    { prizeIndex: 0, label: 'Whisky 12 Anos' },
  ]);

  const loadEvent = useCallback(async () => {
    try {
      const list = await fetchDashboardEvents();
      if (list.length === 0) {
        router.push('/dashboard');
        return;
      }
      const detailed = await fetchDashboardEvent(list[0].id);
      setEvent(detailed);

      setCoupleNames(detailed.coupleNames || '');
      setTitle(detailed.title || '');
      setEventDate(
        detailed.eventDate ? new Date(detailed.eventDate).toISOString().split('T')[0] : '',
      );
      setWelcomeMessage(detailed.welcomeMessage || '');
      setThemeId(detailed.themeId || 'champagne-navy');
      setTicketPriceReais((detailed.ticketPriceCents / 100).toFixed(2));
      setTotalNumbers(detailed.totalNumbers || 1000);
      setPadrinhoPin(detailed.padrinhoPin || '1234');
      setPixKey(detailed.pixKey || '');
      setPixKeyType(detailed.pixKeyType || 'cpf');
      if (detailed.prizes && detailed.prizes.length > 0) {
        setPrizes(detailed.prizes.map((p, idx) => ({ prizeIndex: idx, label: p.label })));
      }
    } catch {
      setError('Falha ao carregar configurações do evento.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  function addPrize() {
    setPrizes((prev) => [
      ...prev,
      {
        prizeIndex: prev.length,
        label: `Prêmio #${prev.length + 1}`,
      },
    ]);
  }

  function removePrize(index: number) {
    setPrizes((prev) =>
      prev.filter((_, idx) => idx !== index).map((p, idx) => ({ ...p, prizeIndex: idx })),
    );
  }

  function updatePrizeLabel(index: number, label: string) {
    setPrizes((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, label } : p)),
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;

    if (!coupleNames.trim()) {
      toast.error('Informe o nome dos noivos.');
      return;
    }

    startTransition(async () => {
      try {
        const ticketPriceCents = Math.round(parseFloat(ticketPriceReais.replace(',', '.')) * 100);

        await updateDashboardEvent(event.id, {
          coupleNames: coupleNames.trim(),
          title: title.trim() || `Casamento ${coupleNames.trim()}`,
          eventDate: eventDate ? new Date(eventDate).toISOString() : null,
          welcomeMessage: welcomeMessage.trim() || null,
          themeId,
          ticketPriceCents: isNaN(ticketPriceCents) ? 2000 : ticketPriceCents,
          padrinhoPin: padrinhoPin.trim() || '1234',
          pixKey: pixKey.trim() || null,
          pixKeyType,
          prizes: prizes.filter((p) => p.label.trim().length > 0),
        });

        toast.success('Configurações salvas com sucesso!');
        await loadEvent();
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Falha ao salvar configurações.';
        toast.error(msg);
      }
    });
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-background text-foreground transition-colors duration-500">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="apple-pressable size-8 rounded-full border border-white/10 hover:bg-white/10">
              <Link href="/dashboard">
                <ArrowLeftIcon className="size-4" />
              </Link>
            </Button>
            <h1 className="font-heading text-lg font-bold">Configurar Casamento</h1>
          </div>

          <Button
            type="submit"
            form="config-form"
            size="sm"
            disabled={pending}
            className="apple-pressable h-9 px-4 rounded-full font-heading text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            {pending ? <Spinner data-icon="inline-start" /> : <SaveIcon className="size-3.5 mr-1.5" />}
            {pending ? 'Salvando…' : 'Salvar Alterações'}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {error ? (
          <Alert variant="destructive" className="mb-6 rounded-2xl border-destructive/30 bg-destructive/10">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form id="config-form" onSubmit={onSubmit} className="space-y-8 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_both]">
          {/* Section 1: Informações Gerais */}
          <Card className="apple-glass rounded-3xl border-white/12 shadow-xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="font-heading text-xl font-bold">Informações Gerais</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Personalize os dados de apresentação que aparecem na rifa e no telão.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="coupleNames" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nome dos Noivos *
                    </FieldLabel>
                    <Input
                      id="coupleNames"
                      required
                      value={coupleNames}
                      onChange={(e) => setCoupleNames(e.target.value)}
                      placeholder="Ex: Marina & Bruno"
                      disabled={pending}
                      className="h-11 rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="eventDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Data do Casamento
                    </FieldLabel>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      disabled={pending}
                      className="h-11 rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Título da Rifa
                  </FieldLabel>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Corta-Gravata dos Noivos Marina & Bruno"
                    disabled={pending}
                    className="h-11 rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="welcomeMessage" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mensagem de Boas-Vindas
                  </FieldLabel>
                  <Input
                    id="welcomeMessage"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Ex: Ajude os noivos na lua de mel e concorra a prêmios incríveis!"
                    disabled={pending}
                    className="h-11 rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Section 2: Temas Visuais */}
          <Card className="apple-glass rounded-3xl border-white/12 shadow-xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-5">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <PaletteIcon className="size-4" />
                </div>
                <div>
                  <CardTitle className="font-heading text-xl font-bold">Tema Visual da Festa</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Selecione a paleta cromática que combina com a decoração do seu casamento.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {THEMES.map((theme) => {
                  const isSelected = themeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setThemeId(theme.id)}
                      className={`apple-pressable cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-lg shadow-primary/10'
                          : 'border-white/10 hover:border-white/20 bg-black/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">{theme.name}</p>
                          <p className="text-xs text-muted-foreground">{theme.subtitle}</p>
                        </div>
                        {isSelected ? (
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckIcon className="size-3.5" />
                          </div>
                        ) : null}
                      </div>

                      <div className="flex h-7 w-full overflow-hidden rounded-xl border border-white/10">
                        <div style={{ backgroundColor: theme.bg }} className="flex-1" />
                        <div style={{ backgroundColor: theme.primary }} className="w-1/3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Regras da Rifa e Valores */}
          <Card className="apple-glass rounded-3xl border-white/12 shadow-xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="font-heading text-xl font-bold">Regras e Valores</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Defina o preço de cada número e a chave de segurança dos padrinhos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="ticketPrice" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Valor por Número (R$)
                    </FieldLabel>
                    <Input
                      id="ticketPrice"
                      value={ticketPriceReais}
                      onChange={(e) => setTicketPriceReais(e.target.value)}
                      placeholder="20.00"
                      disabled={pending}
                      className="h-11 rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 apple-numeral font-semibold"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="totalNumbers" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total de Números na Cartela
                    </FieldLabel>
                    <Input
                      id="totalNumbers"
                      type="number"
                      value={totalNumbers}
                      disabled
                      className="h-11 rounded-xl bg-white/5 border-white/10 opacity-75 cursor-not-allowed apple-numeral"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="padrinhoPin" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    PIN dos Padrinhos (4 dígitos)
                  </FieldLabel>
                  <Input
                    id="padrinhoPin"
                    maxLength={6}
                    value={padrinhoPin}
                    onChange={(e) => setPadrinhoPin(e.target.value)}
                    placeholder="1234"
                    disabled={pending}
                    className="h-11 font-mono tracking-widest sm:max-w-xs rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Código que os padrinhos usarão para registrar vendas em dinheiro vivo pelo smartphone.
                  </p>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Section 4: Cadastro de Prêmios */}
          <Card className="apple-glass rounded-3xl border-white/12 shadow-xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading text-xl font-bold">Prêmios do Sorteio</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Adicione os prêmios que serão sorteados ao vivo na festa.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrize}
                className="apple-pressable rounded-full border-white/15 bg-white/5 text-xs font-semibold"
              >
                <PlusIcon className="size-3.5 mr-1" />
                Adicionar Prêmio
              </Button>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {prizes.map((prize, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-black/20 p-2 rounded-2xl border border-white/10">
                  <span className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 font-mono text-xs font-semibold text-primary px-3 py-2 min-w-[5rem]">
                    #{idx + 1} Lugar
                  </span>
                  <Input
                    value={prize.label}
                    onChange={(e) => updatePrizeLabel(idx, e.target.value)}
                    placeholder={`Ex: Whisky 12 anos, Caixa de Som JBL, Airfryer…`}
                    disabled={pending}
                    className="h-10 rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                  {prizes.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="apple-pressable size-9 rounded-xl text-destructive hover:bg-destructive/10"
                      onClick={() => removePrize(idx)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 5: Chave PIX para Recebimento */}
          <Card className="apple-glass rounded-3xl border-white/12 shadow-xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="font-heading text-xl font-bold">Chave PIX dos Noivos</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Chave cadastrada para transferências automáticas dos seus saques.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field className="sm:col-span-1">
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo da Chave</FieldLabel>
                    <select
                      aria-label="Tipo de Chave PIX"
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value)}
                      className="h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-1 text-sm shadow-xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-none"
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </Field>

                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="pixKey" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chave PIX</FieldLabel>
                    <Input
                      id="pixKey"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="Insira sua chave PIX principal"
                      disabled={pending}
                      className="h-11 rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
            <CardFooter className="p-0 pt-6 flex justify-end">
              <Button
                type="submit"
                disabled={pending}
                className="apple-pressable h-12 px-8 rounded-2xl font-heading text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              >
                {pending ? <Spinner data-icon="inline-start" /> : <SaveIcon className="size-4 mr-1.5" />}
                {pending ? 'Salvando…' : 'Salvar Todas as Configurações'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}
