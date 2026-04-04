import { z } from 'zod';
import { searchClubs } from './clubThemes';

/**
 * Derives the full list of valid canonical club names.
 * We search every letter + digit to catch names like "RB Leipzig" (starts with a digit).
 * Using a Set removes any duplicates.
 */
function getAllCanonicalNames(): string[] {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
  const seen = new Set<string>();
  for (const char of chars) {
    for (const name of searchClubs(char, 200)) {
      seen.add(name);
    }
  }
  return Array.from(seen);
}

const validClubNames = getAllCanonicalNames();

/**
 * Schema for a single club name field.
 *
 * Rule 1 — must be a string (not a number, null, etc.)
 * Rule 2 — must not be empty
 * Rule 3 — must match a known canonical club name (case-insensitive)
 */
export const clubNameSchema = z
  .string({ error: 'Club name must be text.' })
  .trim()
  .min(1, { message: 'Club name is required.' })
  .refine(
    (val) => validClubNames.some((name) => name.toLowerCase() === val.toLowerCase()),
    { message: 'Please select a recognised club from the suggestions.' }
  );

/**
 * Validates a club name and returns either an error message string,
 * or null if the value is valid.
 *
 * Usage:
 *   const error = validateClubName(form.club);
 *   if (error) { ... show error ... }
 */
export function validateClubName(value: unknown): string | null {
  const result = clubNameSchema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  return null;
}
