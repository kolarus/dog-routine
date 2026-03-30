import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { RoutinePill } from '@/components/routine/routine-pill';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { appStrings } from '@/strings';

const s = appStrings.routine.walkingHistory;

/**
 * Full-width pill from Stitch “Cupertino Canine Home — Updated”, placed after the hero and before walk/feed/medicine.
 */
export function HomeWalkingHistoryPill() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <RoutinePill
        label={s.label}
        subtitle={s.subtitle}
        icon="history"
        iconColor={StitchCupertinoHome.primary}
        iconWell={StitchCupertinoHome.walkIconWell}
        onPress={() => router.push('/routine/history')}
        layoutStyle={styles.fullWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  fullWidth: {
    width: '100%',
  },
});
