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
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block font-heading text-3xl font-bold tracking-tight text-primary">
            Corta-Gravata
          </Link>
          <p className="text-sm text-muted-foreground">
            Acesse o painel do seu casamento para gerenciar sua rifa e sacar via PIX.
          </p>
        </div>

        <Card className="border-primary/20 bg-card/80 shadow-2xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Entrar no Painel</CardTitle>
            <CardDescription>Informe as credenciais cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" className="space-y-4" onSubmit={onSubmit}>
              <FieldGroup>
                <Field data-invalid={Boolean(error) || undefined}>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@casamento.com"
                    disabled={pending}
                  />
                </Field>

                <Field data-invalid={Boolean(error) || undefined}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
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
                  />
                </Field>
              </FieldGroup>

              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Erro ao entrar</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              form="login-form"
              size="lg"
              className="w-full font-heading uppercase tracking-wider"
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {pending ? 'Entrando…' : 'Entrar'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Ainda não tem conta?{' '}
              <Link href="/cadastro" className="font-semibold text-primary underline underline-offset-4">
                Criar minha rifa grátis
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
