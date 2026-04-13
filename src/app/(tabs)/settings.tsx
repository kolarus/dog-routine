import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppNavTopBar } from '@/components/navigation';
import { useWalkCollapsedBarInset, useWalkSession } from '@/context/walk-session-context';
import { clearAllPersistedDogData } from '@/modules/dog-profile';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';
import { appStrings } from '@/strings';

const s = appStrings.settings;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const walkCollapsedInset = useWalkCollapsedBarInset();
  const { clearAllActivityData } = useWalkSession();
  const [busyDog, setBusyDog] = useState(false);
  const [busyActivity, setBusyActivity] = useState(false);
  const busy = busyDog || busyActivity;

  const onClearDogPress = () => {
    Alert.alert(s.clearConfirmTitle, s.clearConfirmMessage, [
      { text: s.cancel, style: 'cancel' },
      {
        text: s.clearData,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyDog(true);
            try {
              await clearAllPersistedDogData();
              Alert.alert(s.clearedTitle, s.clearedMessage);
            } finally {
              setBusyDog(false);
            }
          })();
        },
      },
    ]);
  };

  const onClearActivityPress = () => {
    Alert.alert(s.clearActivityConfirmTitle, s.clearActivityConfirmMessage, [
      { text: s.cancel, style: 'cancel' },
      {
        text: s.clearActivityData,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyActivity(true);
            try {
              await clearAllActivityData();
              Alert.alert(s.activityClearedTitle, s.activityClearedMessage);
            } finally {
              setBusyActivity(false);
            }
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: StitchCupertinoHome.canvas }]}
      edges={[]}>
      <AppNavTopBar title={s.title} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              Spacing.four + Math.max(insets.bottom, Spacing.two) + walkCollapsedInset,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: StitchCupertinoHome.surfaceLowest }]}>
          <Text style={[styles.hint, { color: StitchCupertinoHome.onSurfaceVariant }]}>
            {s.clearDataHint}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={s.clearData}
            disabled={busy}
            onPress={onClearDogPress}
            style={({ pressed }) => [
              styles.button,
              { opacity: busy ? 0.5 : pressed ? 0.88 : 1 },
            ]}>
            <Text style={styles.buttonLabel}>{s.clearData}</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: StitchCupertinoHome.surfaceLowest }]}>
          <Text style={[styles.hint, { color: StitchCupertinoHome.onSurfaceVariant }]}>
            {s.clearActivityDataHint}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={s.clearActivityData}
            disabled={busy}
            onPress={onClearActivityPress}
            style={({ pressed }) => [
              styles.button,
              { opacity: busy ? 0.5 : pressed ? 0.88 : 1 },
            ]}>
            <Text style={styles.buttonLabel}>{s.clearActivityData}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: StitchCupertinoHome.error,
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
