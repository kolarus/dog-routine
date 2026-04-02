import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { AppNavTopBar } from '@/components/navigation';
import { isRoutineScheduleKind, type RoutineScheduleKind } from '@/components/routine';
import { ScheduleScreen } from '@/components/schedule';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { appStrings } from '@/strings';

/** Stitch “Refined Walk Schedule” top bar title (not the in-page “Daily routine” heading). */
const SCHEDULE_BAR_TITLE: Record<RoutineScheduleKind, string> = {
  walk: appStrings.routine.walkSchedule.brandKicker,
  feed: appStrings.routine.feedSchedule.brandKicker,
};

/**
 * Full-screen routine activity (no tab bar). Pushed from Home bento for walk / feed.
 * `kind` is the dynamic segment: `walk` → walk schedule, `feed` → feeding schedule.
 */
export default function RoutineActivityScreen() {
  const { kind: kindParam } = useLocalSearchParams<{ kind: string }>();

  const scheduleKind = useMemo(
    (): RoutineScheduleKind | null => (isRoutineScheduleKind(kindParam) ? kindParam : null),
    [kindParam],
  );

  const barTitle = scheduleKind ? SCHEDULE_BAR_TITLE[scheduleKind] : 'Routine';

  if (scheduleKind) {
    return (
      <View style={{ flex: 1, backgroundColor: StitchCupertinoHome.canvas }}>
        <AppNavTopBar title={barTitle} />
        <ScheduleScreen kind={scheduleKind} />
      </View>
    );
  }

  return <View style={{ flex: 1, backgroundColor: StitchCupertinoHome.canvas }} />;
}
