import { Telao } from '@/app/telao/Telao';
import { fetchPublicEvent } from '@/lib/api';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EventTelaoPage({ params }: Props) {
  const { slug } = await params;

  try {
    const event = await fetchPublicEvent(slug);
    return <Telao event={event} />;
  } catch {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Casamento não encontrado.</p>
      </main>
    );
  }
}
