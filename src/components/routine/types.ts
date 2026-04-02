import type { ComponentProps } from 'react';
import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type RoutineKind = 'walk' | 'feed' | 'medicine';

/** Kinds that use the configurable schedule screen (`/routine/[kind]`). */
export type RoutineScheduleKind = Extract<RoutineKind, 'walk' | 'feed'>;

export function isRoutineScheduleKind(value: unknown): value is RoutineScheduleKind {
  return value === 'walk' || value === 'feed';
}

export type RoutineItem = {
  kind: RoutineKind;
  label: string;
  subtitle: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  iconColor: string;
  iconWell: string;
  showDue?: boolean;
  disabled?: boolean;
};

