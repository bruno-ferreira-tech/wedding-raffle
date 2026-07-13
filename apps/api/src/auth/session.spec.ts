import { createSessionCookie, verifySessionCookie } from './session';

describe('session', () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-session-secret';
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = originalSecret;
    }
  });

  it('signs and verifies a padrinho session', () => {
    const cookie = createSessionCookie('padrinho');
    expect(verifySessionCookie(cookie)).toBe('padrinho');
  });

  it('signs and verifies an admin session', () => {
    const cookie = createSessionCookie('admin');
    expect(verifySessionCookie(cookie)).toBe('admin');
  });

  it('rejects tampered cookie value', () => {
    const cookie = createSessionCookie('padrinho');
    const [role] = cookie.split('.');
    expect(verifySessionCookie(`${role}.deadbeef`)).toBeNull();
  });

  it('rejects cookie with wrong secret', () => {
    const cookie = createSessionCookie('admin');
    process.env.SESSION_SECRET = 'other-secret';
    expect(verifySessionCookie(cookie)).toBeNull();
  });

  it('throws when SESSION_SECRET is missing on sign', () => {
    delete process.env.SESSION_SECRET;
    expect(() => createSessionCookie('padrinho')).toThrow(/SESSION_SECRET/);
  });

  it('throws when SESSION_SECRET is missing on verify', () => {
    delete process.env.SESSION_SECRET;
    expect(() => verifySessionCookie('padrinho.abc')).toThrow(/SESSION_SECRET/);
  });
});
