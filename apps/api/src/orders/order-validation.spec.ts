import {
  RESERVATION_MINUTES,
  parseCreateOrderInput,
  reservationExpiresAt,
} from './order-validation';

describe('parseCreateOrderInput', () => {
  it('accepts a trimmed name and unique ids in 1..2000', () => {
    expect(
      parseCreateOrderInput({ buyerName: '  Ana  ', numberIds: [1, 42, 2000] }),
    ).toEqual({ buyerName: 'Ana', numberIds: [1, 42, 2000] });
  });

  it('rejects empty or whitespace-only name', () => {
    expect(() =>
      parseCreateOrderInput({ buyerName: '', numberIds: [1] }),
    ).toThrow(/nome/i);
    expect(() =>
      parseCreateOrderInput({ buyerName: '   ', numberIds: [1] }),
    ).toThrow(/nome/i);
  });

  it('rejects missing or empty numberIds', () => {
    expect(() =>
      parseCreateOrderInput({ buyerName: 'Ana', numberIds: [] }),
    ).toThrow(/número/i);
    expect(() =>
      parseCreateOrderInput({ buyerName: 'Ana', numberIds: undefined }),
    ).toThrow(/número/i);
  });

  it('rejects non-integers, duplicates, and out-of-range ids', () => {
    expect(() =>
      parseCreateOrderInput({ buyerName: 'Ana', numberIds: [1.5] }),
    ).toThrow(/inválid/i);
    expect(() =>
      parseCreateOrderInput({ buyerName: 'Ana', numberIds: [0] }),
    ).toThrow(/inválid/i);
    expect(() =>
      parseCreateOrderInput({ buyerName: 'Ana', numberIds: [2001] }),
    ).toThrow(/inválid/i);
    expect(() =>
      parseCreateOrderInput({ buyerName: 'Ana', numberIds: [1, 1] }),
    ).toThrow(/duplicad/i);
  });
});

describe('reservationExpiresAt', () => {
  it(`is ${RESERVATION_MINUTES} minutes after now`, () => {
    const now = new Date('2026-07-13T12:00:00.000Z');
    expect(reservationExpiresAt(now).toISOString()).toBe(
      '2026-07-13T12:15:00.000Z',
    );
  });
});
