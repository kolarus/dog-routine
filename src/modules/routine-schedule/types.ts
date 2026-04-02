import type { RoutineScheduleKind } from '@/components/routine/types';

export type PersistedScheduleSlot = {
  id: string;
  /** 0–23 */
  hour: number;
  /** 0–59 */
  minute: number;
  /** Optional days label — reserved for future use. */
  days?: string;
};

export type PersistedRoutineSchedule = {
  kind: RoutineScheduleKind;
  slots: PersistedScheduleSlot[];
  remindersEnabled: boolean;
  savedAt: number;
};
