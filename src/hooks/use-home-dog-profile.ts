import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  formatDogAgeLabelFromDob,
  isOnboardingProfileComplete,
  loadOnboardingProfile,
  loadSkippedDogProfile,
  subscribeProfileDiskChanged,
} from '@/modules/dog-profile';
import type { OnboardingProfilePersisted } from '@/modules/dog-profile';
import { dogAvatarFileExists, getDogAvatarFileUri } from '@/modules/local-photo';

export type HomeDogProfileState = {
  /** Saved profile when complete; otherwise `null`. */
  profile: OnboardingProfilePersisted | null;
  /** `file://` URI when avatar exists on disk */
  avatarUri: string | null;
  /** Derived from DOB when parseable */
  ageLabel: string | null;
  ready: boolean;
  /** User chose “Skip for now” on the home setup banner (persisted). */
  skippedDogProfile: boolean;
  /**
   * First-run banner: no `onboarding-profile.json` yet and user has not skipped.
   * Any Save (even empty name) writes that file and hides the banner.
   */
  showProfileSetupBanner: boolean;
};

/**
 * Loads saved onboarding profile + avatar for the home screen; refetches when the tab gains focus
 * (e.g. after Save on Dog Profile).
 */
export function useHomeDogProfile(): HomeDogProfileState {
  const [profile, setProfile] = useState<OnboardingProfilePersisted | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [skippedDogProfile, setSkippedDogProfile] = useState(false);
  /** `onboarding-profile.json` exists and parses (includes empty-name saves). */
  const [hasPersistedProfileFile, setHasPersistedProfileFile] = useState(false);

  const refresh = useCallback(async () => {
    const [p, skipped] = await Promise.all([loadOnboardingProfile(), loadSkippedDogProfile()]);
    setHasPersistedProfileFile(p !== null);
    const complete = isOnboardingProfileComplete(p) ? p : null;
    let uri: string | null = null;
    if (complete && (await dogAvatarFileExists())) {
      uri = getDogAvatarFileUri();
    }
    setProfile(complete);
    setAvatarUri(uri);
    setSkippedDogProfile(skipped);
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => subscribeProfileDiskChanged(() => void refresh()), [refresh]);

  const ageLabel = useMemo(
    () => (profile ? formatDogAgeLabelFromDob(profile.dob) : null),
    [profile],
  );

  const showProfileSetupBanner = ready && !hasPersistedProfileFile && !skippedDogProfile;

  return { profile, avatarUri, ageLabel, ready, skippedDogProfile, showProfileSetupBanner };
}
