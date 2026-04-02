import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { ROUTINE_ITEMS } from './definitions';
import { RoutinePill } from './routine-pill';
import type { RoutineKind } from './types';

const WIDE_BREAKPOINT = 768;

/**
 * Home-only layout: 2×2 bento on narrow screens (medicine full-width row),
 * three equal columns when wide. Reuse {@link RoutinePill} elsewhere with your own wrapper.
 */
export function HomeBentoRoutineSection() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const layoutWide = useMemo(() => width >= WIDE_BREAKPOINT, [width]);

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
        {ROUTINE_ITEMS.map((item) => (
          <RoutinePill
            key={item.kind}
            label={item.label}
            subtitle={item.subtitle}
            icon={item.icon}
            iconColor={item.iconColor}
            iconWell={item.iconWell}
            showDue={item.showDue}
            disabled={item.disabled}
            layoutStyle={layoutStyleForItem(item.kind, layoutWide)}
            onPress={() => onRoutinePress(item.kind)}
          />
        ))}
      </View>
    </View>
  );
}

function layoutStyleForItem(kind: (typeof ROUTINE_ITEMS)[number]['kind'], layoutWide: boolean) {
  if (layoutWide) {
    return styles.layoutWide;
  }
  if (kind === 'medicine') {
    return styles.layoutFull;
  }
  return styles.layoutHalf;
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
  layoutFull: {
    width: '100%',
  },
  layoutWide: {
    flex: 1,
    minWidth: 160,
  },
});
