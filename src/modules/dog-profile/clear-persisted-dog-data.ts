import { deleteDogAvatarFile } from '@/modules/local-photo';

import { notifyProfileDiskChanged } from './profile-disk-events';
import { deleteOnboardingProfileFile } from './storage';

/** Removes onboarding JSON and canonical profile photo from app storage. */
export async function clearAllPersistedDogData(): Promise<void> {
  await deleteOnboardingProfileFile();
  await deleteDogAvatarFile();
  notifyProfileDiskChanged();
}
