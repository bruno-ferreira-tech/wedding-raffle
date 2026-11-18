import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verifies Stripe-Signature header (t=,v1=) against the raw request body.
 * Returns false on missing/malformed header, bad signature, or stale timestamp.
 */
export function verifyStripeWebhookSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  secret: string,
  nowMs: number = Date.now(),
  toleranceSec = 300,
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(',').map((p) => p.trim());
  const timestampRaw = parts.find((p) => p.startsWith('t='))?.slice(2);
  const signatures = parts
    .filter((p) => p.startsWith('v1='))
    .map((p) => p.slice(3));

  if (!timestampRaw || signatures.length === 0) {
    return false;
  }

  const timestamp = Number(timestampRaw);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  if (Math.abs(nowMs / 1000 - timestamp) > toleranceSec) {
    return false;
  }

  const payload =
    typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const signedPayload = `${timestampRaw}.${payload}`;
  const expected = createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return signatures.some((sig) => safeEqualHex(expected, sig));
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
