import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { appStrings } from '@/strings';

import type { RoutineItem } from './types';

const { walking, feeding, medicine } = appStrings.routine;

export const ROUTINE_ITEMS: RoutineItem[] = [
  {
    kind: 'walk',
    label: walking.label,
    subtitle: walking.subtitle,
    icon: 'directions-walk',
    iconColor: StitchCupertinoHome.primary,
    iconWell: StitchCupertinoHome.walkIconWell,
  },
  {
    kind: 'feed',
    label: feeding.label,
    subtitle: feeding.subtitle,
    icon: 'restaurant',
    iconColor: StitchCupertinoHome.secondary,
    iconWell: StitchCupertinoHome.feedIconWell,
  },
  {
    kind: 'medicine',
    label: medicine.label,
    subtitle: medicine.subtitle,
    icon: 'medical-services',
    iconColor: StitchCupertinoHome.error,
    iconWell: StitchCupertinoHome.medicineIconWell,
    showDue: true,
  },
];
