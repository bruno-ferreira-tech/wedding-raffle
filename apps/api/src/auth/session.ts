import { createHmac, timingSafeEqual } from 'node:crypto';

export type SessionRole = 'padrinho' | 'admin';

export const SESSION_COOKIE_NAME = 'wr_session';

function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is required');
  }
  return secret;
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export function createSessionCookie(role: SessionRole): string {
  const secret = requireSessionSecret();
  return `${role}.${sign(role, secret)}`;
}

export function verifySessionCookie(cookie: string | undefined): SessionRole | null {
  if (!cookie) {
    return null;
  }

  const secret = requireSessionSecret();
  const separator = cookie.indexOf('.');
  if (separator <= 0) {
    return null;
  }

  const role = cookie.slice(0, separator);
  const signature = cookie.slice(separator + 1);
  if (role !== 'padrinho' && role !== 'admin') {
    return null;
  }

  const expected = sign(role, secret);
  if (!safeEqual(signature, expected)) {
    return null;
  }

  return role;
}

export function sessionCookieOptions(): {
  httpOnly: true;
  sameSite: 'lax' | 'none' | 'strict';
  secure: boolean;
  path: '/';
  maxAge: number;
} {
  const isProd = process.env.NODE_ENV === 'production';
  const forceSecure = process.env.COOKIE_SECURE === 'true';
  const sameSiteEnv =
    (process.env.COOKIE_SAME_SITE as 'lax' | 'none' | 'strict') || 'lax';

  return {
    httpOnly: true,
    sameSite: sameSiteEnv,
    secure: forceSecure || (isProd && sameSiteEnv === 'none'),
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
