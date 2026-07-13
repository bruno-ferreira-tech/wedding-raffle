import { FakePaymentProvider } from './fake';
import { MercadoPagoPixPaymentProvider } from './mercado-pago-pix';
import { StripePixPaymentProvider } from './stripe-pix';
import type { PaymentProvider } from './types';

export type PaymentProviderName = 'stripe' | 'mercadopago' | 'fake';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function parseProviderName(raw: string): PaymentProviderName {
  if (raw === 'fake' || raw === 'stripe' || raw === 'mercadopago') {
    return raw;
  }
  throw new Error(
    `PAYMENT_PROVIDER is unknown: ${raw} (expected stripe|mercadopago|fake)`,
  );
}

export function getPaymentProvider(): PaymentProvider {
  const raw = process.env.PAYMENT_PROVIDER;
  if (!raw) {
    throw new Error('PAYMENT_PROVIDER is required');
  }

  const name = parseProviderName(raw);
  switch (name) {
    case 'fake':
      return new FakePaymentProvider();
    case 'stripe':
      return new StripePixPaymentProvider(requireEnv('STRIPE_SECRET_KEY'));
    case 'mercadopago':
      return new MercadoPagoPixPaymentProvider(
        requireEnv('MERCADOPAGO_ACCESS_TOKEN'),
      );
    default: {
      const _exhaustive: never = name;
      throw new Error(`Unexpected PAYMENT_PROVIDER: ${_exhaustive}`);
    }
  }
}
