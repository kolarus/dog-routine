import type { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { appendWalkRouteSamples } from '@/lib/walk-route-storage';

/** Must match `Location.startLocationUpdatesAsync` / `stopLocationUpdatesAsync`. */
export const WALK_ROUTE_LOCATION_TASK = 'dogroutine-walk-route';

TaskManager.defineTask(WALK_ROUTE_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    return;
  }
  const locations = (data as { locations?: LocationObject[] })?.locations;
  if (!locations?.length) {
    return;
  }
  const points = locations.map((loc) => ({
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  }));
  await appendWalkRouteSamples(points);
});
