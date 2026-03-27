import { getClubTheme, searchClubs } from '../utils/clubThemes';

describe('getClubTheme', () => {
  test('returns the correct theme for a known club name', () => {
    const theme = getClubTheme('Arsenal');
    expect(theme.name).toBe('Arsenal');
    expect(theme.primary).toBe('#EF0107');
  });

  test('is case-insensitive', () => {
    const theme = getClubTheme('arsenal');
    expect(theme.name).toBe('Arsenal');
  });

  test('works with a club nickname/alias', () => {
    const theme = getClubTheme('The Gunners');
    expect(theme.name).toBe('Arsenal');
  });

  test('returns the default green theme for an unknown club', () => {
    const theme = getClubTheme('Unknown FC');
    expect(theme.primary).toBe('#22c55e');
  });

  test('returns the default theme for an empty string', () => {
    const theme = getClubTheme('');
    expect(theme.primary).toBe('#22c55e');
  });
});

describe('searchClubs', () => {
  test('returns matching clubs for a partial query', () => {
    const results = searchClubs('man');
    expect(results).toContain('Manchester City');
    expect(results).toContain('Manchester United');
  });

  test('is case-insensitive', () => {
    const results = searchClubs('ARSENAL');
    expect(results).toContain('Arsenal');
  });

  test('returns an empty array for an empty query', () => {
    expect(searchClubs('')).toEqual([]);
  });

  test('respects the limit parameter', () => {
    const results = searchClubs('a', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  test('returns an empty array when no clubs match', () => {
    const results = searchClubs('zzznomatch');
    expect(results).toEqual([]);
  });
});
