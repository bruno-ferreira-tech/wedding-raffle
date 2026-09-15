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
    <div className="min-h-dvh w-full bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="size-8">
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
            className="font-heading uppercase tracking-wider"
          >
            {pending ? <Spinner data-icon="inline-start" /> : <SaveIcon className="size-4 mr-1.5" />}
            {pending ? 'Salvando…' : 'Salvar Alterações'}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form id="config-form" onSubmit={onSubmit} className="space-y-8">
          {/* Section 1: Informações Gerais */}
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Informações Gerais</CardTitle>
              <CardDescription>
                Personalize os dados que aparecem para seus convidados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="coupleNames">Nome dos Noivos *</FieldLabel>
                    <Input
                      id="coupleNames"
                      required
                      value={coupleNames}
                      onChange={(e) => setCoupleNames(e.target.value)}
                      placeholder="Ex: Marina & Bruno"
                      disabled={pending}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="eventDate">Data do Casamento</FieldLabel>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      disabled={pending}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="title">Título da Rifa</FieldLabel>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Corta-Gravata dos Noivos Marina & Bruno"
                    disabled={pending}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="welcomeMessage">Mensagem de Boas-Vindas</FieldLabel>
                  <Input
                    id="welcomeMessage"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Ex: Ajude os noivos na lua de mel e concorra a prêmios incríveis!"
                    disabled={pending}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Section 2: Temas Visuais */}
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PaletteIcon className="size-5 text-primary" />
                <CardTitle className="font-heading text-xl">Tema Visual da Festa</CardTitle>
              </div>
              <CardDescription>
                Selecione a paleta cromática sofisticada que combina com a decoração do seu casamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {THEMES.map((theme) => {
                  const isSelected = themeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setThemeId(theme.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                          : 'border-border/60 hover:border-border hover:bg-muted/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">{theme.name}</p>
                          <p className="text-xs text-muted-foreground">{theme.subtitle}</p>
                        </div>
                        {isSelected ? <CheckIcon className="size-5 text-primary" /> : null}
                      </div>

                      <div className="flex h-8 w-full overflow-hidden rounded-md border border-border/40">
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
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Regras e Valores</CardTitle>
              <CardDescription>
                Defina o preço de cada número e a quantidade da cartela.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="ticketPrice">Valor por Número (R$)</FieldLabel>
                    <Input
                      id="ticketPrice"
                      value={ticketPriceReais}
                      onChange={(e) => setTicketPriceReais(e.target.value)}
                      placeholder="20.00"
                      disabled={pending}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="totalNumbers">Total de Números na Cartela (fixo)</FieldLabel>
                    <Input
                      id="totalNumbers"
                      type="number"
                      value={totalNumbers}
                      disabled
                      className="bg-muted/40 cursor-not-allowed"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="padrinhoPin">
                    PIN dos Padrinhos (4 dígitos)
                  </FieldLabel>
                  <Input
                    id="padrinhoPin"
                    maxLength={6}
                    value={padrinhoPin}
                    onChange={(e) => setPadrinhoPin(e.target.value)}
                    placeholder="1234"
                    disabled={pending}
                    className="font-mono tracking-widest sm:max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Código de segurança que os padrinhos usarão para registrar vendas em dinheiro vivo pelo celular.
                  </p>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Section 4: Cadastro de Prêmios */}
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading text-xl">Prêmios do Sorteio</CardTitle>
                <CardDescription>
                  Adicione os prêmios que serão sorteados no final da festa.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPrize}>
                <PlusIcon className="size-4 mr-1" />
                Adicionar Prêmio
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {prizes.map((prize, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs w-20 justify-center">
                    #{idx + 1} Lugar
                  </Badge>
                  <Input
                    value={prize.label}
                    onChange={(e) => updatePrizeLabel(idx, e.target.value)}
                    placeholder={`Ex: Whisky 12 anos, Caixa de Som JBL, Airfryer…`}
                    disabled={pending}
                  />
                  {prizes.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
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
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Chave PIX dos Noivos</CardTitle>
              <CardDescription>
                Chave cadastrada para transferências automáticas de saldo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field className="sm:col-span-1">
                    <FieldLabel>Tipo da Chave</FieldLabel>
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

                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="pixKey">Chave PIX</FieldLabel>
                    <Input
                      id="pixKey"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="Insira sua chave PIX principal"
                      disabled={pending}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={pending}
                className="font-heading uppercase tracking-wider"
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
