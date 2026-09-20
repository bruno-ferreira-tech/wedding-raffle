'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  MonitorIcon,
  PaletteIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  TvIcon,
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
import { LiveTelaoPreview } from '@/components/wedding/live-telao-preview';


const THEMES = [
  {
    id: 'champagne-navy',
    name: 'Champagne & Marfim',
    subtitle: 'Clássico & Atemporal',
    bg: '#faf8f5',
    primary: '#b89047',
    text: '#262320',
  },
  {
    id: 'rose-gold',
    name: 'Rosé & Linho',
    subtitle: 'Romântico & Suave',
    bg: '#fdfaf9',
    primary: '#b66d72',
    text: '#2a2426',
  },
  {
    id: 'emerald-brass',
    name: 'Sálvia & Ouro Velho',
    subtitle: 'Botânico & Campo',
    bg: '#f7faf7',
    primary: '#4d6e53',
    text: '#1f2821',
  },
  {
    id: 'monochrome-slate',
    name: 'Noite de Gala',
    subtitle: 'Black-Tie Aveludado',
    bg: '#141312',
    primary: '#d4af37',
    text: '#f5f2eb',
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
    <div className="min-h-dvh w-full bg-[#faf8f5] text-stone-900">
      <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#faf8f5]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="size-8 rounded-full hover:bg-stone-200/60 text-stone-700">
              <Link href="/dashboard">
                <ArrowLeftIcon className="size-4" />
              </Link>
            </Button>
            <h1 className="font-heading text-lg font-bold text-stone-900">Configurar Casamento</h1>
          </div>

          <Button
            type="submit"
            form="config-form"
            size="sm"
            disabled={pending}
            className="h-9 px-5 rounded-full text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(44,38,30,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer"
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

        <form id="config-form" onSubmit={onSubmit} className="space-y-8">
          {/* Section 1: Informações Gerais */}
          <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 sm:p-7">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="font-heading text-xl font-bold text-stone-900">Informações Gerais</CardTitle>
              <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
                Personalize os dados de apresentação que aparecem na rifa e no telão.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="coupleNames" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Nome dos Noivos *
                    </FieldLabel>
                    <Input
                      id="coupleNames"
                      required
                      value={coupleNames}
                      onChange={(e) => setCoupleNames(e.target.value)}
                      placeholder="Ex: Marina & Bruno"
                      disabled={pending}
                      className="h-11 rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-2xs font-medium"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="eventDate" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Data do Casamento
                    </FieldLabel>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      disabled={pending}
                      className="h-11 rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-2xs font-medium"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Título da Rifa
                  </FieldLabel>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Corta-Gravata dos Noivos Marina & Bruno"
                    disabled={pending}
                    className="h-11 rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-2xs font-medium"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="welcomeMessage" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Mensagem de Boas-Vindas
                  </FieldLabel>
                  <Input
                    id="welcomeMessage"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Ex: Ajude os noivos na lua de mel e concorra a prêmios incríveis!"
                    disabled={pending}
                    className="h-11 rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-2xs font-medium"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Section: Telão ao Vivo no Salão Nobre */}
          <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 sm:p-7">
            <CardHeader className="p-0 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-stone-900 text-stone-50">
                    <TvIcon className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl font-bold text-stone-900">Telão ao Vivo no Salão</CardTitle>
                    <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
                      Projete o painel em tempo real para animar a pista de dança e os convidados.
                    </CardDescription>
                  </div>
                </div>

                {event ? (
                  <Button asChild variant="outline" size="sm" className="rounded-full border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800">
                    <Link href={`/e/${event.slug}/telao`} target="_blank">
                      <ExternalLinkIcon className="size-3.5 mr-1.5" />
                      Abrir Telão (HDMI)
                    </Link>
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MonitorIcon className="size-4 text-[#855b1b]" />
                    <span className="text-xs font-semibold text-stone-800">Como conectar ao projetor ou TV</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Atualiza em tempo real
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  Conecte o notebook do cerimonial ou DJ ao projetor ou TV via HDMI. Abra o link do telão no navegador (Google Chrome, Edge ou Safari) e pressione <strong className="text-stone-900">F11</strong> para ativar o modo de tela cheia sem barras de navegação.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1 font-medium">
                  <span>✦ QR Code automático na tela para compras</span>
                  <span>✦ Atualização instantânea a cada PIX</span>
                  <span>✦ Animação com confetes 3D no sorteio</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs uppercase tracking-wider text-stone-600 font-semibold">
                  Pré-visualização Interativa do Telão:
                </p>
                <LiveTelaoPreview />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Temas Visuais */}
          <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 sm:p-7">
            <CardHeader className="p-0 pb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-stone-900 text-stone-50">
                  <PaletteIcon className="size-4" />
                </div>
                <div>
                  <CardTitle className="font-heading text-xl font-bold text-stone-900">Tema Visual da Festa</CardTitle>
                  <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
                    Selecione a paleta de cores que combina com a decoração do seu casamento.
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
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-stone-900 ring-2 ring-stone-900/20 bg-stone-100/70 shadow-xs'
                          : 'border-stone-200 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm text-stone-900">{theme.name}</p>
                          <p className="text-xs text-stone-600 font-medium">{theme.subtitle}</p>
                        </div>
                        {isSelected ? (
                          <div className="flex size-6 items-center justify-center rounded-full bg-stone-900 text-stone-50">
                            <CheckIcon className="size-3.5" />
                          </div>
                        ) : null}
                      </div>

                      <div className="flex h-7 w-full overflow-hidden rounded-xl border border-stone-200 shadow-2xs">
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
          <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 sm:p-7">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="font-heading text-xl font-bold text-stone-900">Regras e Valores</CardTitle>
              <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
                Defina o preço de cada número e a senha de segurança dos padrinhos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="ticketPrice" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Valor por Número (R$)
                    </FieldLabel>
                    <Input
                      id="ticketPrice"
                      value={ticketPriceReais}
                      onChange={(e) => setTicketPriceReais(e.target.value)}
                      placeholder="20.00"
                      disabled={pending}
                      className="h-11 rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 wedding-numeral font-bold shadow-2xs"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="totalNumbers" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Total de Números na Cartela
                    </FieldLabel>
                    <Input
                      id="totalNumbers"
                      type="number"
                      value={totalNumbers}
                      disabled
                      className="h-11 rounded-xl bg-stone-100 border-stone-200 opacity-80 cursor-not-allowed wedding-numeral font-semibold text-stone-700"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="padrinhoPin" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Senha dos Padrinhos (4 dígitos)
                  </FieldLabel>
                  <Input
                    id="padrinhoPin"
                    maxLength={6}
                    value={padrinhoPin}
                    onChange={(e) => setPadrinhoPin(e.target.value)}
                    placeholder="1234"
                    disabled={pending}
                    className="h-11 font-mono tracking-widest sm:max-w-xs rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-2xs font-semibold"
                  />
                  <p className="text-xs text-stone-600 font-medium mt-1.5">
                    Código que os padrinhos usarão para registrar vendas em dinheiro vivo ou Pix na festa.
                  </p>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Section 4: Cadastro de Prêmios */}
          <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 sm:p-7">
            <CardHeader className="p-0 pb-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading text-xl font-bold text-stone-900">Prêmios do Sorteio</CardTitle>
                <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
                  Adicione os prêmios que serão sorteados ao vivo na festa.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrize}
                className="rounded-full border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-100"
              >
                <PlusIcon className="size-3.5 mr-1" />
                Adicionar Prêmio
              </Button>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {prizes.map((prize, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200">
                  <span className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 px-3 py-2 min-w-[5.5rem]">
                    #{idx + 1} Prêmio
                  </span>
                  <Input
                    value={prize.label}
                    onChange={(e) => updatePrizeLabel(idx, e.target.value)}
                    placeholder={`Ex: Whisky 12 anos, Caixa de Som JBL, Airfryer…`}
                    disabled={pending}
                    className="h-10 rounded-xl bg-white border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-2xs font-medium"
                  />
                  {prizes.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-xl text-stone-500 hover:text-destructive hover:bg-red-50"
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
          <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 sm:p-7">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="font-heading text-xl font-bold text-stone-900">Chave PIX dos Noivos</CardTitle>
              <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
                Chave para receber os saques diretamente na sua conta bancária.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field className="sm:col-span-1">
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-stone-700">Tipo da Chave</FieldLabel>
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
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </Field>

                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="pixKey" className="text-xs font-semibold uppercase tracking-wider text-stone-700">Chave PIX</FieldLabel>
                    <Input
                      id="pixKey"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="Insira sua chave PIX principal"
                      disabled={pending}
                      className="h-11 rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-2xs font-medium"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
            <CardFooter className="p-0 pt-6 flex justify-end">
              <Button
                type="submit"
                disabled={pending}
                className="h-12 px-8 rounded-full text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_12px_28px_-6px_rgba(44,38,30,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer"
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
