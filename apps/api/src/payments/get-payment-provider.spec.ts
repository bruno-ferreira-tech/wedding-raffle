import { getPaymentProvider } from './get-payment-provider';
import { FakePaymentProvider } from './fake';
import { MercadoPagoPixPaymentProvider } from './mercado-pago-pix';
import { StripePixPaymentProvider } from './stripe-pix';

describe('getPaymentProvider', () => {
  const original = {
    PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
  };

  afterEach(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('returns FakePaymentProvider when PAYMENT_PROVIDER=fake', () => {
    process.env.PAYMENT_PROVIDER = 'fake';
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;

    const provider = getPaymentProvider();
    expect(provider).toBeInstanceOf(FakePaymentProvider);
  });

  it('returns StripePixPaymentProvider when stripe + key are set', () => {
    process.env.PAYMENT_PROVIDER = 'stripe';
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    expect(getPaymentProvider()).toBeInstanceOf(StripePixPaymentProvider);
  });

  it('returns MercadoPagoPixPaymentProvider when mercadopago + token are set', () => {
    process.env.PAYMENT_PROVIDER = 'mercadopago';
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'mp_test_x';
    expect(getPaymentProvider()).toBeInstanceOf(MercadoPagoPixPaymentProvider);
  });

  it('throws when PAYMENT_PROVIDER is missing', () => {
    delete process.env.PAYMENT_PROVIDER;
    expect(() => getPaymentProvider()).toThrow(/PAYMENT_PROVIDER/);
  });

  it('throws when PAYMENT_PROVIDER is unknown', () => {
    process.env.PAYMENT_PROVIDER = 'paypal';
    expect(() => getPaymentProvider()).toThrow(/PAYMENT_PROVIDER/);
  });

  it('throws when stripe is selected without STRIPE_SECRET_KEY', () => {
    process.env.PAYMENT_PROVIDER = 'stripe';
    delete process.env.STRIPE_SECRET_KEY;
    expect(() => getPaymentProvider()).toThrow(/STRIPE_SECRET_KEY/);
  });

  it('throws when mercadopago is selected without MERCADOPAGO_ACCESS_TOKEN', () => {
    process.env.PAYMENT_PROVIDER = 'mercadopago';
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    expect(() => getPaymentProvider()).toThrow(/MERCADOPAGO_ACCESS_TOKEN/);
  });
});
