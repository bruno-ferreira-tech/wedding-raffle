import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { verifyStripeWebhookSignature } from './stripe-webhook';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly orders: OrdersService) {}

  @Post('stripe')
  @HttpCode(200)
  async stripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<{ received: true }> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (process.env.PAYMENT_PROVIDER === 'stripe' && secret) {
      const raw = req.rawBody;
      if (
        !raw ||
        !verifyStripeWebhookSignature(raw, signature, secret)
      ) {
        throw new UnauthorizedException('Invalid Stripe signature');
      }
    }

    const event = req.body as {
      type?: string;
      data?: { object?: { id?: string; status?: string } };
    };

    if (
      event?.type === 'payment_intent.succeeded' ||
      (event?.type === 'payment_intent.updated' &&
        event?.data?.object?.status === 'succeeded')
    ) {
      const chargeId = event.data?.object?.id;
      if (typeof chargeId === 'string' && chargeId.length > 0) {
        await this.orders.confirmPaidByProviderChargeId(chargeId);
      }
    }

    return { received: true };
  }

  @Post('mercadopago')
  @HttpCode(200)
  async mercadoPago(
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    const body = req.body as {
      action?: string;
      type?: string;
      data?: { id?: string | number };
      id?: string | number;
    };
    const query = req.query as Record<string, string | undefined>;

    const paymentId =
      body?.data?.id ??
      body?.id ??
      query?.['data.id'] ??
      query?.id;

    if (!paymentId) {
      return { ok: true };
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      return { ok: true };
    }

    try {
      const res = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const payment = (await res.json()) as { status?: string };
        if (payment.status === 'approved') {
          await this.orders.confirmPaidByProviderChargeId(String(paymentId));
        }
      }
    } catch {
      // Ignore webhook fetch errors to avoid 500 response on retries
    }

    return { ok: true };
  }
}
