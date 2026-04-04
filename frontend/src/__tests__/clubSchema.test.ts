import { describe, test, expect } from 'vitest';
import { validateClubName } from '../utils/clubSchema';

describe('validateClubName — type checking', () => {
  test('returns an error for a number', () => {
    expect(validateClubName(42)).toBe('Club name must be text.');
  });

  test('returns an error for null', () => {
    expect(validateClubName(null)).toBe('Club name must be text.');
  });

  test('returns an error for undefined', () => {
    expect(validateClubName(undefined)).toBe('Club name must be text.');
  });

  test('returns an error for a boolean', () => {
    expect(validateClubName(true)).toBe('Club name must be text.');
  });
});

describe('validateClubName — empty input', () => {
  test('returns an error for an empty string', () => {
    expect(validateClubName('')).toBe('Club name is required.');
  });

  test('returns an error for a whitespace-only string', () => {
    expect(validateClubName('   ')).toBe('Club name is required.');
  });
});

describe('validateClubName — valid club names', () => {
  test('accepts a canonical Premier League club name', () => {
    expect(validateClubName('Arsenal')).toBeNull();
  });

  test('accepts a canonical La Liga club name', () => {
    expect(validateClubName('Barcelona')).toBeNull();
  });

  test('accepts a canonical Bundesliga club name', () => {
    expect(validateClubName('Bayern Munich')).toBeNull();
  });

  test('accepts a canonical Serie A club name', () => {
    expect(validateClubName('Juventus')).toBeNull();
  });

  test('accepts a canonical Ligue 1 club name', () => {
    expect(validateClubName('Paris Saint-Germain')).toBeNull();
  });

  test('is case-insensitive for canonical names', () => {
    expect(validateClubName('arsenal')).toBeNull();
    expect(validateClubName('ARSENAL')).toBeNull();
  });

  test('ignores leading and trailing whitespace', () => {
    expect(validateClubName('  Arsenal  ')).toBeNull();
  });
});

describe('validateClubName — unrecognised clubs', () => {
  test('returns an error for a typo', () => {
    expect(validateClubName('Arsenall')).toBe('Please select a recognised club from the suggestions.');
  });

  test('returns an error for a completely made-up club', () => {
    expect(validateClubName('My Local FC')).toBe('Please select a recognised club from the suggestions.');
  });

  test('returns an error for a partial name that is not canonical', () => {
    expect(validateClubName('Man')).toBe('Please select a recognised club from the suggestions.');
  });
});
