import { createHmac } from 'node:crypto';
import { verifyStripeWebhookSignature } from './stripe-webhook';

describe('verifyStripeWebhookSignature', () => {
  const secret = 'whsec_test';
  const body = '{"id":"evt_1"}';
  const timestamp = 1_720_000_000;

  function sign(payload: string, t: number): string {
    const digest = createHmac('sha256', secret)
      .update(`${t}.${payload}`, 'utf8')
      .digest('hex');
    return `t=${t},v1=${digest}`;
  }

  it('accepts a valid signature within tolerance', () => {
    const header = sign(body, timestamp);
    expect(
      verifyStripeWebhookSignature(
        body,
        header,
        secret,
        timestamp * 1000,
      ),
    ).toBe(true);
  });

  it('rejects wrong secret, tampered body, and stale timestamp', () => {
    const header = sign(body, timestamp);
    expect(
      verifyStripeWebhookSignature(body, header, 'wrong', timestamp * 1000),
    ).toBe(false);
    expect(
      verifyStripeWebhookSignature(
        '{"id":"evt_2"}',
        header,
        secret,
        timestamp * 1000,
      ),
    ).toBe(false);
    expect(
      verifyStripeWebhookSignature(
        body,
        header,
        secret,
        (timestamp + 400) * 1000,
      ),
    ).toBe(false);
  });

  it('rejects missing header', () => {
    expect(
      verifyStripeWebhookSignature(body, undefined, secret, timestamp * 1000),
    ).toBe(false);
  });
});
