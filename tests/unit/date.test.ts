import { getForecastDates } from '../../src/lib/date';

describe('getForecastDates', () => {
  it('creates five ordered local dates and crosses month boundaries', () => {
    expect(getForecastDates('UTC', '2026-10-30T12:00')).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
    ]);
  });

  it('uses the provider timezone when the current date is unavailable', () => {
    const now = new Date('2026-10-27T23:30:00.000Z');

    expect(getForecastDates('Pacific/Kiritimati', null, now)[0]).toBe('2026-10-28');
  });

  it('falls back to UTC when the provider timezone is invalid', () => {
    const now = new Date('2026-10-27T23:30:00.000Z');

    expect(getForecastDates('invalid/timezone', null, now)[0]).toBe('2026-10-27');
  });

  it('ignores malformed current dates and derives today from the timezone', () => {
    const now = new Date('2026-10-27T23:30:00.000Z');

    expect(getForecastDates('UTC', '2026-02-31T12:00', now)[0]).toBe('2026-10-27');
  });
});
