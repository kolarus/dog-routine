import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearAllPersistedDogData } from '@/modules/dog-profile';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { appStrings } from '@/strings';

const s = appStrings.settings;

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const light = scheme !== 'dark';
  const [busy, setBusy] = useState(false);

  const bg = light ? StitchCupertinoHome.canvas : theme.background;
  const text = light ? StitchCupertinoHome.onSurface : theme.text;
  const secondary = light ? StitchCupertinoHome.onSurfaceVariant : theme.textSecondary;
  const card = light ? StitchCupertinoHome.surfaceLowest : theme.backgroundElement;

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
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: BottomTabInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: text }]}>{s.title}</Text>

        <View style={[styles.card, { backgroundColor: card }]}>
          <Text style={[styles.hint, { color: secondary }]}>{s.clearDataHint}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
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
