import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';
import { appStrings } from '@/strings';

/**
 * Full-screen walk session (placeholder). Presented as a modal over the tab shell.
 */
export default function WalkInProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={appStrings.routine.walkInProgress.closeA11y}
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.close, pressed && styles.closePressed]}>
          <MaterialIcons name="close" size={26} color={StitchCupertinoHome.onSurface} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{appStrings.routine.walkInProgress.title}</Text>
        <Text style={styles.subtitle}>{appStrings.routine.walkInProgress.placeholder}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: StitchCupertinoHome.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    minHeight: 44,
  },
  headerSpacer: {
    flex: 1,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: StitchCupertinoHome.surfaceLow,
  },
  closePressed: {
    opacity: 0.85,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: StitchCupertinoHome.onSurface,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: Spacing.two,
    fontSize: 15,
    fontWeight: '500',
    color: StitchCupertinoHome.onSurfaceVariant,
    lineHeight: 22,
  },
});
