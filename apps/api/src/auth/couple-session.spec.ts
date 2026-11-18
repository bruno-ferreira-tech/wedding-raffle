import {
  hashPassword,
  verifyPassword,
  createCoupleSession,
  verifyCoupleSession,
} from './couple-session';

describe('couple-session', () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-session-secret-at-least-32-characters-long';
  });

  afterEach(() => {
    process.env.SESSION_SECRET = originalSecret;
  });

  it('hashes and correctly verifies passwords', () => {
    const password = 'MinhaSenhaSegura123';
    const hash = hashPassword(password);

    expect(hash).toContain(':');
    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword('SenhaIncorreta', hash)).toBe(false);
  });

  it('creates and verifies couple session token', () => {
    const token = createCoupleSession(42, 'noivos@exemplo.com');
    const session = verifyCoupleSession(token);

    expect(session).toEqual({
      userId: 42,
      email: 'noivos@exemplo.com',
    });
  });

  it('rejects tampered couple session token', () => {
    const token = createCoupleSession(42, 'noivos@exemplo.com');
    expect(verifyCoupleSession(`${token}tampered`)).toBeNull();
  });
});
