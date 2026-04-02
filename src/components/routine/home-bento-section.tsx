import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';
import {
  formatNextRoutineSlotCardSubtitle,
  useRoutineSchedule,
} from '@/modules/routine-schedule';
import { appStrings } from '@/strings';

import { ROUTINE_ITEMS } from './definitions';
import { RoutinePill } from './routine-pill';
import type { RoutineKind } from './types';

const WIDE_BREAKPOINT = 768;

/**
 * Home-only layout: 2×2 bento on narrow screens (walk | feed, then medicine | settings),
 * equal columns when wide. Reuse {@link RoutinePill} elsewhere with your own wrapper.
 */
export function HomeBentoRoutineSection() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const walkSchedule = useRoutineSchedule('walk');
  const feedSchedule = useRoutineSchedule('feed');

  const layoutWide = useMemo(() => width >= WIDE_BREAKPOINT, [width]);

  const routineItems = useMemo(() => {
    const walkSubtitle = walkSchedule.ready
      ? formatNextRoutineSlotCardSubtitle(
          walkSchedule.slots,
          appStrings.routine.walking.subtitleNoSlots,
        )
      : appStrings.routine.walking.subtitleLoading;
    const feedSubtitle = feedSchedule.ready
      ? formatNextRoutineSlotCardSubtitle(
          feedSchedule.slots,
          appStrings.routine.feeding.subtitleNoSlots,
        )
      : appStrings.routine.feeding.subtitleLoading;
    return ROUTINE_ITEMS.map((item) => {
      if (item.kind === 'walk') return { ...item, subtitle: walkSubtitle };
      if (item.kind === 'feed') return { ...item, subtitle: feedSubtitle };
      return item;
    });
  }, [
    walkSchedule.ready,
    walkSchedule.slots,
    feedSchedule.ready,
    feedSchedule.slots,
  ]);

  const onRoutinePress = useCallback(
    (kind: RoutineKind) => {
      if (kind === 'walk') {
        router.push('/routine/walk');
        return;
      }
      if (kind === 'feed') {
        router.push('/routine/feed');
        return;
      }
    },
    [router],
  );

  return (
    <View style={styles.section}>
      <View style={styles.grid}>
        {routineItems.map((item) => (
          <RoutinePill
            key={item.kind}
            label={item.label}
            subtitle={item.subtitle}
            icon={item.icon}
            iconColor={item.iconColor}
            iconWell={item.iconWell}
            showDue={item.showDue}
            disabled={item.disabled}
            layoutStyle={layoutWide ? styles.layoutWide : styles.layoutHalf}
            onPress={() => onRoutinePress(item.kind)}
          />
        ))}
        <RoutinePill
          label={appStrings.home.settingsPill.label}
          subtitle={appStrings.home.settingsPill.subtitle}
          icon="settings"
          iconColor={StitchCupertinoHome.settingsIconColor}
          iconWell={StitchCupertinoHome.settingsIconWell}
          layoutStyle={layoutWide ? styles.layoutWide : styles.layoutHalf}
          onPress={() => router.push('/settings')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignSelf: 'stretch',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  layoutHalf: {
    width: '47%',
    flexGrow: 1,
  },
  layoutWide: {
    flex: 1,
    minWidth: 160,
  },
});
