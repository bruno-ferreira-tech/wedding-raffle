import { parseSalesStatusInput } from './sales-validation';

describe('parseSalesStatusInput', () => {
  it('accepts open and closed', () => {
    expect(parseSalesStatusInput({ status: 'open' })).toEqual({
      status: 'open',
    });
    expect(parseSalesStatusInput({ status: 'closed' })).toEqual({
      status: 'closed',
    });
  });

  it('rejects missing or invalid status', () => {
    expect(() => parseSalesStatusInput({})).toThrow(/status/i);
    expect(() => parseSalesStatusInput({ status: 'paused' })).toThrow(
      /status/i,
    );
    expect(() => parseSalesStatusInput({ status: 1 })).toThrow(/status/i);
  });
});
