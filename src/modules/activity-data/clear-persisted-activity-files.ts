import { deletePersistedWalkRouteFile } from '@/lib/walk-route-storage';
import { deletePersistedActivitiesLogFile } from '@/modules/activities-log/storage';

/**
 * Deletes activity-only storage: walk history log + active route polyline.
 * Does not touch dog profile, photos, or routine schedules (see `clearAllPersistedDogData`).
 */
export async function clearPersistedActivityFiles(): Promise<void> {
  await Promise.all([
    deletePersistedActivitiesLogFile(),
    deletePersistedWalkRouteFile(),
  ]);
}
