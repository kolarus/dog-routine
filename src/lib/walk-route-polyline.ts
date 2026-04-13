import type { WalkRoutePoint } from '@/lib/walk-route-storage';

export type LatLng = { latitude: number; longitude: number };

/**
 * Breaks the route into separate coordinate lists when:
 * - consecutive samples are farther apart in time than `maxGapMs` (e.g. app backgrounded), or
 * - the user resumed after pausing (`resumeAfterPause` on the newer sample).
 * Omits the bridging segment so the map does not draw a false straight line across the gap.
 */
export function splitWalkRoutePointsByTimeGap(
  points: WalkRoutePoint[],
  maxGapMs: number,
): LatLng[][] {
  if (points.length < 2) {
    return [];
  }
  const segments: LatLng[][] = [];
  let current: LatLng[] = [
    { latitude: points[0].latitude, longitude: points[0].longitude },
  ];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const t0 = prev.recordedAt;
    const t1 = cur.recordedAt;
    const hasBoth =
      typeof t0 === 'number' &&
      Number.isFinite(t0) &&
      typeof t1 === 'number' &&
      Number.isFinite(t1);
    const gapMs = hasBoth ? t1 - t0 : 0;

    if (cur.resumeAfterPause === true || gapMs > maxGapMs) {
      if (current.length >= 2) {
        segments.push(current);
      }
      current = [{ latitude: cur.latitude, longitude: cur.longitude }];
    } else {
      current.push({ latitude: cur.latitude, longitude: cur.longitude });
    }
  }

  if (current.length >= 2) {
    segments.push(current);
  }

  return segments;
}
