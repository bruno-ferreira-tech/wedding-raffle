import type { CreatePixInput, CreatePixResult, PaymentProvider } from './types';

/**
 * Stripe PIX via PaymentIntent.
 *
 * TODO: Stripe PIX is BR-account / invite-gated and the display payload shape
 * (next_action.pix_display_qr_code) can vary by API version. Validate against a
 * live BR test key before production; until then prefer PAYMENT_PROVIDER=fake.
 */
export class StripePixPaymentProvider implements PaymentProvider {
  constructor(private readonly secretKey: string) {}

  async createPixCharge(input: CreatePixInput): Promise<CreatePixResult> {
    const expiresAfterSeconds = Math.max(
      60,
      Math.floor((input.expiresAt.getTime() - Date.now()) / 1000),
    );

    const body = new URLSearchParams();
    body.set('amount', String(input.amountCents));
    body.set('currency', 'brl');
    body.append('payment_method_types[]', 'pix');
    body.set(
      'payment_method_options[pix][expires_after_seconds]',
      String(expiresAfterSeconds),
    );
    body.set('metadata[orderId]', String(input.orderId));
    body.set('metadata[buyerName]', input.buyerName);

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Stripe PaymentIntent failed: ${response.status} ${detail}`);
    }

    const intent = (await response.json()) as {
      id: string;
      next_action?: {
        pix_display_qr_code?: {
          data?: string;
          image_url_png?: string;
        };
      };
    };

    const copyPaste = intent.next_action?.pix_display_qr_code?.data;
    if (!copyPaste) {
      // TODO: some Stripe API versions require confirm / expand before PIX QR appears.
      throw new Error(
        'Stripe PaymentIntent created but PIX copy-paste was missing from next_action',
      );
    }

    return {
      provider: 'stripe',
      providerChargeId: intent.id,
      copyPaste,
    };
  }
}
