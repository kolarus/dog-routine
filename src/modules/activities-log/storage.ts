import * as FileSystem from 'expo-file-system/legacy';

import type { ActivityLogEntry } from '@/modules/activities-log/types';

const FILE_NAME = 'activities-log.json';

let persistChain: Promise<unknown> = Promise.resolve();

function enqueuePersist<T>(fn: () => Promise<T>): Promise<T> {
  const next = persistChain.then(fn, fn);
  persistChain = next.then(
    () => {},
    () => {},
  );
  return next;
}

function fileUri(): string {
  const base = FileSystem.documentDirectory;
  if (!base) {
    return FILE_NAME;
  }
  return `${base}${FILE_NAME}`;
}

function parseActivityEntry(x: unknown): ActivityLogEntry | null {
  if (!x || typeof x !== 'object') {
    return null;
  }
  const o = x as Record<string, unknown>;
  if (typeof o.id !== 'string' || o.id.length === 0) {
    return null;
  }
  if (o.kind !== 'walk') {
    return null;
  }
  if (o.status !== 'in_progress' && o.status !== 'done') {
    return null;
  }
  if (typeof o.startTimeMs !== 'number' || !Number.isFinite(o.startTimeMs)) {
    return null;
  }
  if (o.endTimeMs !== null) {
    if (typeof o.endTimeMs !== 'number' || !Number.isFinite(o.endTimeMs)) {
      return null;
    }
  }
  if (typeof o.meters !== 'number' || !Number.isFinite(o.meters) || o.meters < 0) {
    return null;
  }
  if (o.status === 'done') {
    if (o.endTimeMs === null) {
      return null;
    }
  } else if (o.endTimeMs !== null) {
    return null;
  }
  const isPaused = typeof o.isPaused === 'boolean' ? o.isPaused : false;
  const caloriesSource = o.caloriesSource === 'health' ? 'health' : 'none';
  const activeDurationSec =
    typeof o.activeDurationSec === 'number' && Number.isFinite(o.activeDurationSec) && o.activeDurationSec >= 0
      ? o.activeDurationSec
      : 0;
  const caloriesBurnt =
    typeof o.caloriesBurnt === 'number' && Number.isFinite(o.caloriesBurnt) && o.caloriesBurnt >= 0
      ? o.caloriesBurnt
      : 0;
  return {
    id: o.id,
    kind: 'walk',
    status: o.status,
    startTimeMs: o.startTimeMs,
    endTimeMs: o.endTimeMs as number | null,
    meters: o.meters,
    caloriesBurnt,
    caloriesSource,
    activeDurationSec,
    isPaused,
  };
}

/** Deletes the activities JSON file (separate from dog profile and schedules). */
export async function deletePersistedActivitiesLogFile(): Promise<void> {
  return enqueuePersist(async () => {
    try {
      const path = fileUri();
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
    } catch {
      // Best-effort.
    }
  });
}

/** Waits for any in-flight `mutateActivitiesLog` / `save` before reading (avoids stale reads on startup). */
export async function loadActivitiesLogAfterPendingWrites(): Promise<ActivityLogEntry[]> {
  return enqueuePersist(() => loadActivitiesLog());
}

export async function loadActivitiesLog(): Promise<ActivityLogEntry[]> {
  try {
    const path = fileUri();
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      return [];
    }
    const raw = await FileSystem.readAsStringAsync(path);
    const data = JSON.parse(raw) as { v?: number; activities?: unknown };
    if (!Array.isArray(data.activities)) {
      return [];
    }
    return data.activities
      .map(parseActivityEntry)
      .filter((e): e is ActivityLogEntry => e !== null);
  } catch {
    return [];
  }
}

export async function saveActivitiesLog(activities: ActivityLogEntry[]): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(
      fileUri(),
      JSON.stringify({ v: 1, activities }),
    );
  } catch {
    // Best-effort local log.
  }
}

/**
 * Read–mutate–write under a single chain so concurrent updates serialize.
 * Returns the persisted array after `mutator` runs.
 */
export async function mutateActivitiesLog(
  mutator: (prev: ActivityLogEntry[]) => ActivityLogEntry[],
): Promise<ActivityLogEntry[]> {
  return enqueuePersist(async () => {
    const prev = await loadActivitiesLog();
    const next = mutator(prev);
    await saveActivitiesLog(next);
    return next;
  });
}
