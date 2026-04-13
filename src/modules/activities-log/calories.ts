/** MET for ~3 mph / light–moderate walking (ACSM-style). */
const WALK_MET = 3.5;

/**
 * kcal from active moving time using MET formula: (MET × 3.5 × kg / 200) × minutes.
 * @see https://pubmed.ncbi.nlm.nih.gov/15852394/ (ACSM metabolic equation context)
 */
export function walkCaloriesFromMetabolicModel(
  weightKg: number,
  activeDurationSec: number,
  met: number = WALK_MET,
): number {
  if (
    !Number.isFinite(weightKg) ||
    weightKg <= 0 ||
    !Number.isFinite(activeDurationSec) ||
    activeDurationSec <= 0
  ) {
    return 0;
  }
  const minutes = activeDurationSec / 60;
  const kcal = ((met * 3.5 * weightKg) / 200) * minutes;
  return Math.round(kcal * 10) / 10;
}

/**
 * When Apple Health body mass is available, returns estimated kcal (may be `0` at 0 moving time).
 * Otherwise `null` — UI should hide calories.
 */
export function walkCaloriesFromHealthProfile(
  weightKg: number | null,
  activeDurationSec: number,
): number | null {
  if (weightKg == null || !Number.isFinite(weightKg) || weightKg <= 0) {
    return null;
  }
  if (!Number.isFinite(activeDurationSec) || activeDurationSec < 0) {
    return null;
  }
  if (activeDurationSec === 0) {
    return 0;
  }
  return walkCaloriesFromMetabolicModel(weightKg, activeDurationSec);
}
