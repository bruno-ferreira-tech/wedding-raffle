import { OrderStatus } from './OrderStatus';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PedidoPage({ params }: Props) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId < 1) {
    return (
      <main style={{ padding: '2rem', color: 'var(--paper)' }}>
        <p>Pedido inválido.</p>
      </main>
    );
  }

  return <OrderStatus orderId={orderId} />;
}
