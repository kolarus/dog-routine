import {
  deleteAsync,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';

import { resolveDocumentFileUri } from '@/modules/local-photo';

import { deleteSkippedDogProfileFile } from './skipped-profile-flag';
import type { OnboardingProfilePersisted } from './types';

/** Profile JSON next to other app-owned files (e.g. `dog-avatar.jpg`). */
const PROFILE_RELATIVE_PATH = 'onboarding-profile.json';

function profileFileUri(): string | null {
  return resolveDocumentFileUri(PROFILE_RELATIVE_PATH);
}

function parseProfile(raw: string): OnboardingProfilePersisted | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o.dogName !== 'string' || !o.dob || typeof o.dob !== 'object') return null;
    const d = o.dob as Record<string, unknown>;
    if (typeof d.month !== 'string' || typeof d.day !== 'string' || typeof d.year !== 'string') {
      return null;
    }
    const savedAt =
      typeof o.savedAt === 'number' && Number.isFinite(o.savedAt) ? o.savedAt : Date.now();
    return {
      dogName: o.dogName,
      dob: { month: d.month, day: d.day, year: d.year },
      savedAt,
    };
  } catch {
    return null;
  }
}

export function isOnboardingProfileComplete(p: OnboardingProfilePersisted | null): boolean {
  return p !== null && p.dogName.trim().length > 0;
}

export async function hasStoredOnboardingProfile(): Promise<boolean> {
  const p = await loadOnboardingProfile();
  return isOnboardingProfileComplete(p);
}

export async function loadOnboardingProfile(): Promise<OnboardingProfilePersisted | null> {
  const uri = profileFileUri();
  if (uri) {
    const info = await getInfoAsync(uri);
    if (info.exists && !info.isDirectory) {
      const raw = await readAsStringAsync(uri);
      const fromFile = parseProfile(raw);
      if (fromFile) return fromFile;
    }
  }

  return null;
}

export async function saveOnboardingProfile(profile: OnboardingProfilePersisted): Promise<void> {
  const uri = profileFileUri();
  if (!uri) {
    throw new Error('Cannot save onboarding profile: document directory is unavailable');
  }
  await deleteSkippedDogProfileFile();
  await writeAsStringAsync(uri, JSON.stringify(profile));
}

export async function deleteOnboardingProfileFile(): Promise<void> {
  const uri = profileFileUri();
  if (!uri) return;
  const info = await getInfoAsync(uri);
  if (info.exists) {
    await deleteAsync(uri, { idempotent: true });
  }
}
