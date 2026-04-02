import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppNavTopBar } from '@/components/navigation';
import { clearAllPersistedDogData } from '@/modules/dog-profile';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';
import { appStrings } from '@/strings';

const s = appStrings.settings;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const onClearPress = () => {
    Alert.alert(s.clearConfirmTitle, s.clearConfirmMessage, [
      { text: s.cancel, style: 'cancel' },
      {
        text: s.clearData,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusy(true);
            try {
              await clearAllPersistedDogData();
              Alert.alert(s.clearedTitle, s.clearedMessage);
            } finally {
              setBusy(false);
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
          { paddingBottom: Spacing.four + Math.max(insets.bottom, Spacing.two) },
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
            onPress={onClearPress}
            style={({ pressed }) => [
              styles.button,
              { opacity: busy ? 0.5 : pressed ? 0.88 : 1 },
            ]}>
            <Text style={styles.buttonLabel}>{s.clearData}</Text>
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
