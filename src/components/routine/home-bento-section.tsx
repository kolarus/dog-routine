import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

import { ROUTINE_ITEMS } from './definitions';
import { RoutinePill } from './routine-pill';
import type { RoutineAppearance } from './types';

const WIDE_BREAKPOINT = 768;

/**
 * Home-only layout: 2×2 bento on narrow screens (medicine full-width row),
 * three equal columns when wide. Reuse {@link RoutinePill} elsewhere with your own wrapper.
 */
export function HomeBentoRoutineSection() {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme();
  const theme = useTheme();

  const layoutWide = useMemo(() => width >= WIDE_BREAKPOINT, [width]);
  const appearance: RoutineAppearance = scheme !== 'dark' ? 'stitch-light' : 'system';

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: appearance === 'stitch-light' ? 'transparent' : theme.backgroundElement,
        },
      ]}>
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
            appearance={appearance}
            layoutStyle={layoutStyleForItem(item.kind, layoutWide)}
            onPress={() => {}}
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
