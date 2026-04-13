import * as FileSystem from 'expo-file-system/legacy';

import { metersBetweenLatLng } from '@/lib/geo';

export type WalkRoutePoint = {
  latitude: number;
  longitude: number;
  /** Unix ms from the location fix; used to split map polylines after long gaps. */
  recordedAt?: number;
  /** First sample after user tapped Resume — map draws a new segment (no line across pause). */
  resumeAfterPause?: boolean;
};

const FILE_NAME = 'active-walk-route.json';

/** Serialize file read–merge–write so foreground + background tasks never clobber each other. */
let persistChain: Promise<void> = Promise.resolve();

function enqueuePersist(fn: () => Promise<void>): Promise<void> {
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

export async function saveWalkRoutePoints(points: WalkRoutePoint[]): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(fileUri(), JSON.stringify({ v: 1, points }));
  } catch {
    // Best-effort persistence for a future sync pipeline.
  }
}

/**
 * Append samples to the on-disk route using the same spacing rule as in-memory recording.
 * Safe to call from a TaskManager background task.
 */
export async function appendWalkRouteSamples(
  samples: WalkRoutePoint[],
  minSegmentM = 4,
): Promise<void> {
  if (samples.length === 0) {
    return;
  }
  await enqueuePersist(async () => {
    const existing = await loadWalkRoutePoints();
    let last = existing[existing.length - 1];
    const merged = [...existing];
    for (const p of samples) {
      if (
        !last ||
        metersBetweenLatLng(last, p) >= minSegmentM ||
        p.resumeAfterPause === true
      ) {
        merged.push(p);
        last = p;
      }
    }
    await saveWalkRoutePoints(merged);
  });
}

/** Removes the on-disk route file (separate from dog profile / schedules). */
export async function deletePersistedWalkRouteFile(): Promise<void> {
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

export async function loadWalkRoutePoints(): Promise<WalkRoutePoint[]> {
  try {
    const path = fileUri();
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      return [];
    }
    const raw = await FileSystem.readAsStringAsync(path);
    const data = JSON.parse(raw) as { points?: WalkRoutePoint[] };
    if (!Array.isArray(data.points)) {
      return [];
    }
    return data.points.filter((p) => {
      if (
        typeof p?.latitude !== 'number' ||
        !Number.isFinite(p.latitude) ||
        typeof p?.longitude !== 'number' ||
        !Number.isFinite(p.longitude)
      ) {
        return false;
      }
      if (p.recordedAt !== undefined) {
        if (typeof p.recordedAt !== 'number' || !Number.isFinite(p.recordedAt)) {
          return false;
        }
      }
      if (
        p.resumeAfterPause !== undefined &&
        typeof p.resumeAfterPause !== 'boolean'
      ) {
        return false;
      }
      return true;
    });
  } catch {
    return [];
  }
}
