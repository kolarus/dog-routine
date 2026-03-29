import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DOG_AVATAR_RELATIVE_PATH,
  deleteDogAvatarFile,
  dogAvatarFileExists,
  getDogAvatarFileUri,
  resolveDocumentFileUri,
  useLocalPhotoPicker,
} from '@/modules/local-photo';
import { appStrings } from '@/strings';

import { notifyProfileDiskChanged } from './profile-disk-events';
import {
  isOnboardingProfileComplete,
  loadOnboardingProfile,
  saveOnboardingProfile,
} from './storage';
import type { OnboardingDobState } from './types';

const s = appStrings.onboarding;

const defaultDob = (): OnboardingDobState => ({
  month: s.dobInitialMonth,
  day: s.dobInitialDay,
  year: s.dobInitialYear,
});

function stripUriQuery(uri: string): string {
  const i = uri.indexOf('?');
  return i === -1 ? uri : uri.slice(0, i);
}

/**
 * Onboarding form state. JSON and canonical avatar file are written only when the user taps Save.
 *
 * This hook does **not** subscribe to {@link subscribeProfileDiskChanged} — it is the *producer*
 * of that event (via {@link saveProfile}). Other screens (Home, Settings) subscribe as consumers.
 */
export function useOnboardingProfile() {
  const [hydrated, setHydrated] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [dogName, setDogName] = useState('');
  const [dob, setDob] = useState<OnboardingDobState>(defaultDob);
  const [savedAvatarUri, setSavedAvatarUri] = useState<string | null>(null);
  /** Bumps when profile/avatar is saved so local images bypass expo-image disk cache. */
  const [avatarDisplayToken, setAvatarDisplayToken] = useState(0);

  const photo = useLocalPhotoPicker();
  const pickUri = photo.uri;

  const dogNameRef = useRef(dogName);
  const dobRef = useRef(dob);
  const pickUriRef = useRef<string | null>(null);
  dogNameRef.current = dogName;
  dobRef.current = dob;
  pickUriRef.current = pickUri;

  useEffect(() => {
    let alive = true;
    void (async () => {
      const profile = await loadOnboardingProfile();
      if (!alive) return;

      if (profile) {
        setDogName(profile.dogName);
        setDob(profile.dob);
        setHasSavedProfile(isOnboardingProfileComplete(profile));
        setAvatarDisplayToken(profile.savedAt);
      }

      if (await dogAvatarFileExists()) {
        setSavedAvatarUri(getDogAvatarFileUri());
      }

      setHydrated(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const saveProfile = useCallback(async () => {
    const name = dogNameRef.current;
    const dobSnap = dobRef.current;
    const currentPick = pickUriRef.current;
    const canonical = resolveDocumentFileUri(DOG_AVATAR_RELATIVE_PATH);

    if (currentPick && canonical) {
      const samePath = stripUriQuery(currentPick) === stripUriQuery(canonical);
      if (!samePath) {
        await photo.commitSourceToRelativePath(DOG_AVATAR_RELATIVE_PATH, currentPick);
      }
    }

    setSavedAvatarUri(getDogAvatarFileUri());

    const payload = { dogName: name, dob: dobSnap, savedAt: Date.now() };
    await saveOnboardingProfile(payload);
    setAvatarDisplayToken(payload.savedAt);
    setHasSavedProfile(isOnboardingProfileComplete(payload));
    notifyProfileDiskChanged();
  }, [photo]);

  const onDobSegment = useCallback((id: string) => {
    if (id === 'month') {
      setDob((d) => ({
        ...d,
        month: d.month === s.dobInitialMonth ? s.dobDemoMonth : s.dobInitialMonth,
      }));
    }
    if (id === 'day') {
      setDob((d) => ({
        ...d,
        day: d.day === s.dobInitialDay ? s.dobDemoDay : s.dobInitialDay,
      }));
    }
    if (id === 'year') {
      setDob((d) => ({
        ...d,
        year: d.year === s.dobInitialYear ? s.dobDemoYear : s.dobInitialYear,
      }));
    }
  }, []);

  const clearAvatar = useCallback(async () => {
    photo.clear();
    setSavedAvatarUri(null);
    await deleteDogAvatarFile();
  }, [photo]);

  const avatarUri = photo.uri ?? savedAvatarUri;

  return {
    dogName,
    setDogName,
    dob,
    onDobSegment,
    avatarUri,
    avatarDisplayToken,
    pickAvatar: photo.pickFromLibrary,
    clearAvatar,
    saveProfile,
    hydrated,
    hasSavedProfile,
  };
}
