/** Distance for activity summaries (meters → km or m). */
export function formatActivityDistanceMeters(meters: number): string {
  if (!Number.isFinite(meters) || meters <= 0) {
    return '0 m';
  }
  if (meters >= 1000) {
    const km = meters / 1000;
    const digits = km >= 10 ? 0 : 1;
    return `${km.toFixed(digits)} km`;
  }
  return `${Math.round(meters)} m`;
}

/** Wall-clock session length from start/end timestamps. */
export function formatSessionDurationMs(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return '0 min';
  }
  if (durationMs < 60_000) {
    return '< 1 min';
  }
  const totalMin = Math.floor(durationMs / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} min`;
}

export function formatActivityStartDate(startTimeMs: number): string {
  return new Date(startTimeMs).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatCaloriesValue(kcal: number): string {
  if (!Number.isFinite(kcal) || kcal <= 0) {
    return '0';
  }
  return kcal >= 10 ? Math.round(kcal).toString() : kcal.toFixed(1);
}

/** Distance label for the in-progress sheet (always km, two decimals). */
export function formatActiveWalkSheetDistanceKm(meters: number): string {
  if (!Number.isFinite(meters) || meters <= 0) {
    return '0.00';
  }
  return (meters / 1000).toFixed(2);
}

/** Rough step count from GPS path length (~0.78 m per step while walking). */
export function estimateStepsFromWalkMeters(meters: number): number {
  if (!Number.isFinite(meters) || meters <= 0) {
    return 0;
  }
  return Math.max(0, Math.round(meters / 0.78));
}
