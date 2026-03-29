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

import { notifyProfileDiskChanged, subscribeProfileDiskChanged } from './profile-disk-events';
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
 * Subscribes to {@link subscribeProfileDiskChanged} so **Settings → Clear data** (or any external
 * disk change) resets this form and drops the photo when the avatar file is gone. After
 * {@link saveProfile}, the same event runs a redundant reload; that is harmless.
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

  useEffect(() => {
    return subscribeProfileDiskChanged(() => {
      void (async () => {
        const profile = await loadOnboardingProfile();
        if (profile) {
          setDogName(profile.dogName);
          setDob(profile.dob);
          setHasSavedProfile(isOnboardingProfileComplete(profile));
          setAvatarDisplayToken(profile.savedAt);
        } else {
          setDogName('');
          setDob(defaultDob());
          setHasSavedProfile(false);
          setAvatarDisplayToken(0);
        }

        const avatarExists = await dogAvatarFileExists();
        const canonical = resolveDocumentFileUri(DOG_AVATAR_RELATIVE_PATH);
        const pick = pickUriRef.current;

        if (avatarExists) {
          setSavedAvatarUri(getDogAvatarFileUri());
        } else {
          setSavedAvatarUri(null);
          if (pick && canonical && stripUriQuery(pick) === stripUriQuery(canonical)) {
            photo.clear();
          }
        }
      })();
    });
  }, [photo]);

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
    setDob,
    avatarUri,
    avatarDisplayToken,
    pickAvatar: photo.pickFromLibrary,
    clearAvatar,
    saveProfile,
    hydrated,
    hasSavedProfile,
  };
}
