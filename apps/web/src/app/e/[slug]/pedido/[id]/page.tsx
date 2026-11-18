import { OrderStatus } from '@/app/pedido/[id]/OrderStatus';
import { fetchPublicEvent } from '@/lib/api';

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function EventPedidoPage({ params }: Props) {
  const { slug, id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId < 1) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Pedido inválido.</p>
      </main>
    );
  }

  let themeId: string | undefined;
  try {
    const event = await fetchPublicEvent(slug);
    themeId = event.themeId;
  } catch {
    // fallback without theme
  }

  return (
    <OrderStatus
      orderId={orderId}
      backHref={`/e/${slug}`}
      themeId={themeId}
    />
  );
}
