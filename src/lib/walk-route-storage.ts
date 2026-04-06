import * as FileSystem from 'expo-file-system/legacy';

import { metersBetweenLatLng } from '@/lib/geo';

export type WalkRoutePoint = { latitude: number; longitude: number };

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
      if (!last || metersBetweenLatLng(last, p) >= minSegmentM) {
        merged.push(p);
        last = p;
      }
    }
    await saveWalkRoutePoints(merged);
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
    return data.points.filter(
      (p) =>
        typeof p?.latitude === 'number' &&
        Number.isFinite(p.latitude) &&
        typeof p?.longitude === 'number' &&
        Number.isFinite(p.longitude),
    );
  } catch {
    return [];
  }
}
