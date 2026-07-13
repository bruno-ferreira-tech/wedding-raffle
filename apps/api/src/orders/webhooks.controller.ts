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
  mercadoPago(): { ok: true } {
    // Stub: wire MP signature + payment lookup when provider goes live.
    return { ok: true };
  }
}
