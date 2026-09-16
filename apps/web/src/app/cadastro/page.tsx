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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block font-heading text-3xl font-bold tracking-tight text-foreground hover:opacity-85">
            Corta-Gravata
          </Link>
          <p className="text-sm text-muted-foreground">
            Crie sua rifa dos noivos em minutos. Pagamentos automáticos no PIX e arrecadação direta na sua conta.
          </p>
        </div>

        <Card className="wedding-card shadow-lg p-4 sm:p-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-heading text-2xl font-bold text-foreground">Criar Rifa dos Noivos</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Sem mensalidades ou taxas de adesão
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
                    className="h-12 rounded-xl bg-background border-border px-4 text-sm focus:ring-2 focus:ring-primary shadow-2xs"
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
                    className="h-12 rounded-xl bg-background border-border px-4 text-sm focus:ring-2 focus:ring-primary shadow-2xs"
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
                    className="h-12 rounded-xl bg-background border-border px-4 text-sm focus:ring-2 focus:ring-primary shadow-2xs"
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
                    className="h-12 rounded-xl bg-background border-border px-4 text-sm focus:ring-2 focus:ring-primary shadow-2xs"
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
              className="wedding-button h-12 w-full rounded-2xl text-sm font-semibold shadow-md disabled:opacity-50"
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {pending ? 'Criando sua rifa…' : 'Criar Rifa da Nossa Festa'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-semibold text-primary underline underline-offset-4 hover:opacity-85 transition-opacity">
                Entrar no painel
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
