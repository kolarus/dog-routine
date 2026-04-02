import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';
import { appStrings } from '@/strings';

const s = appStrings.settings;

/** Width reserved on each side so the title stays visually centered (Stitch “Refined Walk Schedule”). */
const BAR_SIDE = 96;

export type AppNavTopBarProps = {
  title: string;
};

/**
 * Stack-style top bar from Stitch “Refined Walk Schedule”: Home back + centered title, no overflow menu.
 */
export function AppNavTopBar({ title }: AppNavTopBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goHome = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          backgroundColor: StitchCupertinoHome.surfaceLowest,
        },
      ]}>
      <View style={styles.bar}>
        <View style={[styles.sideSlot, { width: BAR_SIDE }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={s.backToHomeA11y}
            onPress={goHome}
            style={({ pressed }) => [styles.back, pressed && styles.backPressed]}>
            <MaterialIcons name="arrow-back" size={22} color={StitchCupertinoHome.primary} />
            <Text style={[styles.backLabel, { color: StitchCupertinoHome.primary }]}>
              {s.backToHome}
            </Text>
          </Pressable>
        </View>
        <Text
          style={[styles.title, { color: StitchCupertinoHome.onSurface }]}
          numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: BAR_SIDE }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: Spacing.three,
  },
  sideSlot: {
    justifyContent: 'center',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: -Spacing.half,
    paddingVertical: Spacing.two,
  },
  backPressed: {
    opacity: 0.75,
  },
  backLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});
