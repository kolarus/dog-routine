import type { ComponentProps } from 'react';
import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type RoutineKind = 'walk' | 'feed' | 'medicine';

export type RoutineItem = {
  kind: RoutineKind;
  label: string;
  subtitle: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  iconColor: string;
  iconWell: string;
  showDue?: boolean;
};

