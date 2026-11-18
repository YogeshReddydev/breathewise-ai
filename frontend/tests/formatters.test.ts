import { describe, it, expect } from 'vitest';
import { formatTimeHour, formatDatePretty } from '../src/utils/formatters';

describe('Formatters Utilities', () => {
  it('formats ISO time hour cleanly', () => {
    const iso = '2026-11-18T14:30:00Z';
    const formatted = formatTimeHour(iso);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('handles custom ISO hour strings without timezone', () => {
    const raw = '2026-11-18T09:00';
    const formatted = formatTimeHour(raw);
    expect(formatted).toBeDefined();
  });

  it('safely handles invalid date strings by returning original text', () => {
    const invalid = 'not-a-valid-date';
    const formatted = formatDatePretty(invalid);
    expect(formatted).toBe(invalid);
  });
});
