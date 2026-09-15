import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

export const COUPLE_SESSION_COOKIE = 'wr_couple_session';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is required');
  }
  return secret;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;

  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedKey.length) return false;

  return timingSafeEqual(keyBuffer, derivedKey);
}

export type CoupleSessionPayload = {
  userId: number;
  email: string;
};

export function createCoupleSession(userId: number, email: string): string {
  const secret = getSessionSecret();
  const payload = Buffer.from(JSON.stringify({ userId, email })).toString(
    'base64url',
  );
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyCoupleSession(token: string | undefined): CoupleSessionPayload | null {
  if (!token) return null;
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return null;

  const payloadStr = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const secret = getSessionSecret();

  const expectedSig = createHmac('sha256', secret).update(payloadStr).digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const json = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    const parsed = JSON.parse(json) as CoupleSessionPayload;
    if (typeof parsed.userId === 'number' && typeof parsed.email === 'string') {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}
