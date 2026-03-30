import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  formatDogAgeLabelFromDob,
  isOnboardingProfileComplete,
  loadOnboardingProfile,
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
};

/**
 * Loads saved onboarding profile + avatar for the home screen; refetches when the tab gains focus
 * (e.g. after Save on Dog Profile).
 */
export function useHomeDogProfile(): HomeDogProfileState {
  const [profile, setProfile] = useState<OnboardingProfilePersisted | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const p = await loadOnboardingProfile();
    const complete = isOnboardingProfileComplete(p) ? p : null;
    let uri: string | null = null;
    if (complete && (await dogAvatarFileExists())) {
      uri = getDogAvatarFileUri();
    }
    setProfile(complete);
    setAvatarUri(uri);
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

  return { profile, avatarUri, ageLabel, ready };
}
