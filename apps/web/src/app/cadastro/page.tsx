'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useTransition } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import { ApiError, createDashboardEvent, registerCouple } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Informe o nome dos noivos.');
      return;
    }
    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    startTransition(async () => {
      try {
        await registerCouple({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
        });

        // Automatically initialize their first raffle event
        await createDashboardEvent({
          coupleNames: name.trim(),
          title: `Casamento ${name.trim()}`,
          ticketPriceCents: 2000,
          totalNumbers: 1000,
          themeId: 'champagne-navy',
          padrinhoPin: '1234',
        });

        toast.success('Parabéns! Sua rifa foi criada com sucesso.');
        router.push('/dashboard');
      } catch (err) {
        const message =
          err instanceof ApiError && err.status === 409
            ? 'Este e-mail já está cadastrado.'
            : err instanceof Error
              ? err.message
              : 'Não foi possível cadastrar.';
        setError(message);
      }
    });
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-background px-4 py-12 text-foreground transition-colors duration-500">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-10 -left-20 h-80 w-80 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-6 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block font-heading text-3xl font-bold tracking-tight text-primary">
            Corta-Gravata
          </Link>
          <p className="text-sm text-muted-foreground">
            Crie sua rifa digital em menos de 2 minutos. Arrecadação 100% automatizada e saques instantâneos via PIX.
          </p>
        </div>

        <Card className="apple-glass rounded-3xl border-white/15 shadow-2xl p-4 sm:p-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-heading text-2xl font-bold">Criar Rifa dos Noivos</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Sem mensalidade, sem taxa fixa de adesão
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form id="register-form" className="space-y-4" onSubmit={onSubmit}>
              <FieldGroup>
                <Field data-invalid={Boolean(error && !name.trim()) || undefined}>
                  <FieldLabel htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nome dos Noivos
                  </FieldLabel>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Marina & Bruno"
                    disabled={pending}
                    className="h-12 rounded-xl bg-black/30 border-white/15 px-4 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </Field>

                <Field data-invalid={Boolean(error && !email.trim()) || undefined}>
                  <FieldLabel htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="noivos@exemplo.com"
                    disabled={pending}
                    className="h-12 rounded-xl bg-black/30 border-white/15 px-4 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </Field>

                <Field data-invalid={Boolean(error && password.length < 6) || undefined}>
                  <FieldLabel htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Senha de Acesso
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={pending}
                    className="h-12 rounded-xl bg-black/30 border-white/15 px-4 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    WhatsApp (opcional)
                  </FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    disabled={pending}
                    className="h-12 rounded-xl bg-black/30 border-white/15 px-4 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </FieldGroup>

              {error ? (
                <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              form="register-form"
              size="lg"
              className="apple-pressable h-12 w-full rounded-2xl font-heading text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50"
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {pending ? 'Criando sua rifa…' : 'Criar Minha Rifa Agora'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                Entrar no painel
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
