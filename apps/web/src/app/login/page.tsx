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
import { ApiError, loginCouple } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Preencha seu e-mail e senha.');
      return;
    }

    startTransition(async () => {
      try {
        await loginCouple({
          email: email.trim(),
          password,
        });
        toast.success('Bem-vindos de volta!');
        router.push('/dashboard');
      } catch (err) {
        const message =
          err instanceof ApiError && err.status === 401
            ? 'E-mail ou senha incorretos.'
            : err instanceof Error
              ? err.message
              : 'Não foi possível entrar.';
        setError(message);
      }
    });
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block font-heading text-3xl font-bold tracking-tight text-foreground hover:opacity-85">
            Corta-Gravata
          </Link>
          <p className="text-sm text-muted-foreground">
            Acesse o painel dos noivos para gerenciar sua rifa e realizar saques via PIX.
          </p>
        </div>

        <Card className="wedding-card shadow-lg p-4 sm:p-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-heading text-2xl font-bold text-foreground">Entrar no Painel</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Informe seu e-mail e senha de cadastro
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form id="login-form" className="space-y-4" onSubmit={onSubmit}>
              <FieldGroup>
                <Field data-invalid={Boolean(error) || undefined}>
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
                    placeholder="noivos@casamento.com"
                    disabled={pending}
                    className="h-12 rounded-xl bg-background border-border px-4 text-sm focus:ring-2 focus:ring-primary shadow-2xs"
                  />
                </Field>

                <Field data-invalid={Boolean(error) || undefined}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Senha
                    </FieldLabel>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={pending}
                    className="h-12 rounded-xl bg-background border-border px-4 text-sm focus:ring-2 focus:ring-primary shadow-2xs"
                  />
                </Field>
              </FieldGroup>

              {error ? (
                <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
                  <AlertTitle>Erro ao entrar</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              form="login-form"
              size="lg"
              className="wedding-button wedding-shimmer h-12 w-full rounded-2xl text-sm font-semibold shadow-md disabled:opacity-50"
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {pending ? 'Entrando…' : 'Acessar Meu Painel'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Ainda não tem conta?{' '}
              <Link href="/cadastro" className="font-semibold text-primary underline underline-offset-4 hover:opacity-85 transition-opacity">
                Criar rifa dos noivos grátis
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
