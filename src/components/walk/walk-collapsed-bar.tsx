import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';
import { useWalkSession } from '@/context/walk-session-context';
import { appStrings } from '@/strings';

/**
 * Bottom “tab” shown while a walk is active and minimized; tap to reopen full screen.
 */
function isOnOnboardingScreen(segments: string[]): boolean {
  return segments.some((s) => s === 'onboarding');
}

export function WalkCollapsedBarPortal() {
  const router = useRouter();
  const segments = useSegments();
  const { isActive, isCollapsed, expandWalkUi } = useWalkSession();

  if (!isActive || !isCollapsed || isOnOnboardingScreen(segments)) {
    return null;
  }

  return (
    <WalkCollapsedBar
      onExpand={() => {
        expandWalkUi();
        router.push('/walk-in-progress');
      }}
    />
  );
}

function CollapsedBarPulsingWalkIcon() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
    transform: [
      {
        scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.35] }),
      },
    ],
  };

  return (
    <View style={styles.iconBadge}>
      <Animated.View style={[styles.iconPulseRing, ringStyle]} />
      <MaterialIcons
        name="directions-walk"
        size={22}
        color={StitchCupertinoHome.primary}
        style={styles.walkIcon}
      />
    </View>
  );
}

function WalkCollapsedBar({ onExpand }: { onExpand: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]}
      pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={appStrings.routine.walkInProgress.collapsedBarA11y}
        onPress={onExpand}
        style={({ pressed }) => [styles.bar, pressed && styles.barPressed]}>
        <CollapsedBarPulsingWalkIcon />
        <Text style={styles.label} numberOfLines={1}>
          {appStrings.routine.walkInProgress.title}
        </Text>
        <MaterialIcons
          name="keyboard-arrow-up"
          size={26}
          color={StitchCupertinoHome.onSurfaceVariant}
        />
      </Pressable>
    </View>
  );
}

const BAR_RADIUS = 20;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    zIndex: 20_000,
    elevation: 24,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BAR_RADIUS,
    backgroundColor: StitchCupertinoHome.surfaceLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: StitchCupertinoHome.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  barPressed: {
    opacity: 0.92,
  },
  iconBadge: {
    width: 40,
    height: 40,
    marginRight: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPulseRing: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: StitchCupertinoHome.primaryContainer,
  },
  walkIcon: {
    zIndex: 1,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: StitchCupertinoHome.onSurface,
    letterSpacing: -0.2,
  },
});
