import { deleteDogAvatarFile } from '@/modules/local-photo';
import {
  deleteAllScheduleFiles,
  notifyScheduleDiskChanged,
  syncAllRoutineScheduleNotifications,
} from '@/modules/routine-schedule';

import { notifyProfileDiskChanged } from './profile-disk-events';
import { deleteSkippedDogProfileFile } from './skipped-profile-flag';
import { deleteOnboardingProfileFile } from './storage';

/**
 * Removes onboarding JSON, profile photo, and routine schedules from app storage.
 * Walk / activity history lives in separate files — use `clearPersistedActivityFiles` from
 * `@/modules/activity-data` (or `clearAllActivityData` on the walk session) to remove that.
 */
export async function clearAllPersistedDogData(): Promise<void> {
  await deleteOnboardingProfileFile();
  await deleteSkippedDogProfileFile();
  await deleteDogAvatarFile();
  await deleteAllScheduleFiles();
  await syncAllRoutineScheduleNotifications();
  notifyProfileDiskChanged();
  notifyScheduleDiskChanged('walk');
  notifyScheduleDiskChanged('feed');
}
