import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PurchaseForm } from '@/app/_components/PurchaseForm';
import { fetchPublicEvent } from '@/lib/api';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EventRafflePage({ params }: Props) {
  const { slug } = await params;

  try {
    const event = await fetchPublicEvent(slug);
    return <PurchaseForm event={event} />;
  } catch {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center p-6 text-center">
        <h1 className="font-heading text-3xl font-bold mb-3">Casamento não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          Não localizamos a rifa com o endereço &ldquo;{slug}&rdquo;. Verifique o link e tente novamente.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Voltar para o início
        </Link>
      </main>
    );
  }
}
