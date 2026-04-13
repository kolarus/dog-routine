export type ActivityKind = 'walk';

export type ActivityStatus = 'in_progress' | 'done';

export type ActivityCaloriesSource = 'health' | 'none';

export type ActivityLogEntry = {
  id: string;
  kind: ActivityKind;
  status: ActivityStatus;
  startTimeMs: number;
  /** Set when the activity is finished; `null` while in progress. */
  endTimeMs: number | null;
  meters: number;
  caloriesBurnt: number;
  /**
   * `health` = estimated from Apple Health body mass + moving time.
   * `none` = not shown (no permission / no weight / non-iOS).
   */
  caloriesSource: ActivityCaloriesSource;
  /**
   * Moving time shown in the UI (pause excludes wall clock), in seconds.
   * Updated while in progress; frozen when `status` is `done`.
   */
  activeDurationSec: number;
  /** Meaningful while `in_progress`; always `false` once `done`. */
  isPaused: boolean;
};
