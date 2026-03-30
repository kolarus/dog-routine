import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import {
  isRoutineScheduleKind,
  RoutineScheduleScreen,
  type RoutineScheduleKind,
} from '@/components/routine';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { appStrings } from '@/strings';

const SCHEDULE_NAV: Record<RoutineScheduleKind, string> = {
  walk: appStrings.routine.walkSchedule.navTitle,
  feed: appStrings.routine.feedSchedule.navTitle,
};

/**
 * Full-screen routine activity (no tab bar). Pushed from Home bento for walk / feed.
 * `kind` is the dynamic segment: `walk` → walk schedule, `feed` → feeding schedule.
 */
export default function RoutineActivityScreen() {
  const { kind: kindParam } = useLocalSearchParams<{ kind: string }>();
  const navigation = useNavigation();

  const scheduleKind = useMemo(
    (): RoutineScheduleKind | null => (isRoutineScheduleKind(kindParam) ? kindParam : null),
    [kindParam],
  );

  const title = scheduleKind ? SCHEDULE_NAV[scheduleKind] : 'Routine';

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  if (scheduleKind) {
    return (
      <View style={{ flex: 1, backgroundColor: StitchCupertinoHome.canvas }}>
        <RoutineScheduleScreen kind={scheduleKind} />
      </View>
    );
  }

  return <View style={{ flex: 1, backgroundColor: StitchCupertinoHome.canvas }} />;
}
