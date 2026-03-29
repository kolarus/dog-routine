import type { OnboardingDobState } from './types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * Parses month from onboarding row (full name, or 1–12, or placeholder).
 */
export function parseOnboardingMonthIndex(month: string): number | null {
  const t = month.trim();
  if (!t || /^month$/i.test(t)) return null;

  const lower = t.toLowerCase();
  const byName = MONTH_NAMES.findIndex((n) => n.toLowerCase() === lower);
  if (byName >= 0) return byName;

  const n = Number.parseInt(t, 10);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n - 1;

  return null;
}

export function parseOnboardingDobToDate(dob: OnboardingDobState): Date | null {
  const monthIndex = parseOnboardingMonthIndex(dob.month);
  const day = Number.parseInt(dob.day, 10);
  const year = Number.parseInt(dob.year, 10);
  if (monthIndex === null || !Number.isInteger(day) || !Number.isInteger(year)) return null;
  if (year < 1900 || year > 2100) return null;

  const d = new Date(year, monthIndex, day);
  if (d.getFullYear() !== year || d.getMonth() !== monthIndex || d.getDate() !== day) {
    return null;
  }
  return d;
}

/** Earliest selectable birth date in the native picker. */
export const ONBOARDING_DOB_MIN_DATE = new Date(1900, 0, 1);

/** Sensible default when opening the picker with no valid date yet (e.g. ~3 years ago). */
export function defaultBirthPickerDate(now = new Date()): Date {
  return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
}

/** Persisted shape from a local `Date` (uses full English month names for compatibility with {@link parseOnboardingMonthIndex}). */
export function birthDateToOnboardingDobState(d: Date): OnboardingDobState {
  return {
    month: MONTH_NAMES[d.getMonth()],
    day: String(d.getDate()).padStart(2, '0'),
    year: String(d.getFullYear()),
  };
}

/** Human-readable date for the onboarding row; `null` if DOB is still placeholders / invalid. */
export function formatOnboardingDobForDisplay(dob: OnboardingDobState): string | null {
  const d = parseOnboardingDobToDate(dob);
  if (!d) return null;
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatDogAgeFromBirthDate(birth: Date, now = new Date()): string {
  const start = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (start > end) return '';

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (end.getDate() < start.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) return 'Less than a month old';

  const yPart = years > 0 ? `${years} year${years === 1 ? '' : 's'}` : '';
  const mPart = months > 0 ? `${months} month${months === 1 ? '' : 's'}` : '';

  if (yPart && mPart) return `${yPart}, ${mPart} old`;
  if (yPart) return `${yPart} old`;
  return `${mPart} old`;
}

export function formatDogAgeLabelFromDob(dob: OnboardingDobState): string | null {
  const d = parseOnboardingDobToDate(dob);
  if (!d) return null;
  const s = formatDogAgeFromBirthDate(d);
  return s || null;
}
