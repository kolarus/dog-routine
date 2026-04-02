import { deleteDogAvatarFile } from '@/modules/local-photo';
import {
  deleteAllScheduleFiles,
  notifyScheduleDiskChanged,
  syncAllRoutineScheduleNotifications,
} from '@/modules/routine-schedule';

import { notifyProfileDiskChanged } from './profile-disk-events';
import { deleteOnboardingProfileFile } from './storage';

/** Removes onboarding JSON, profile photo, and routine schedules from app storage. */
export async function clearAllPersistedDogData(): Promise<void> {
  await deleteOnboardingProfileFile();
  await deleteDogAvatarFile();
  await deleteAllScheduleFiles();
  await syncAllRoutineScheduleNotifications();
  notifyProfileDiskChanged();
  notifyScheduleDiskChanged('walk');
  notifyScheduleDiskChanged('feed');
}
