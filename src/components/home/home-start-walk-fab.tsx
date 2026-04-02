import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { appStrings } from '@/strings';

const FAB_SIZE = 80;
const RADIUS = FAB_SIZE / 2;

const FAB_GOLD_LIGHT = '#FFD700';
const FAB_GOLD_MID = '#FFB300';
const FAB_GOLD_DEEP = '#E69500';

/** Time to reach full “cover screen” scale while finger is down */
const HOLD_DURATION_MS = 920;
/** Release after this fraction of the hold duration counts as “completed” → navigate */
const HOLD_COMPLETE_RATIO = 0.9;
/** Light ticks while the orb grows (ms between pulses) */
const GROWTH_HAPTIC_INTERVAL_MS = 128;
/** Keep full-screen orb until stack modal fade can cover it (avoids a flash of home) */
const HOLD_RESET_AFTER_NAV_MS = 480;

async function hapticLight() {
  if (Platform.OS === 'web') return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Softer than the initial press — reads as ongoing “charging” feedback */
async function hapticGrowthTick() {
  if (Platform.OS === 'web') return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
}

async function hapticSuccess() {
  if (Platform.OS === 'web') return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Scale factor so a circle centered on the FAB covers the farthest screen corner.
 */
function computeMaxScreenScale(
  screenW: number,
  screenH: number,
  bottomOffset: number,
  rightMargin: number,
): number {
  const cx = screenW - rightMargin - FAB_SIZE / 2;
  const cy = screenH - bottomOffset - FAB_SIZE / 2;
  const corners: [number, number][] = [
    [0, 0],
    [screenW, 0],
    [0, screenH],
    [screenW, screenH],
  ];
  const r = FAB_SIZE / 2;
  let maxD = 0;
  for (const [px, py] of corners) {
    const d = Math.hypot(px - cx, py - cy);
    maxD = Math.max(maxD, d);
  }
  return maxD / r + 0.06;
}

/** Shared gold disc (no icon) — used for the expanding layer so scaling stays smooth. */
function FabGoldDisc() {
  return (
    <View style={styles.discFace}>
      <LinearGradient
        colors={[FAB_GOLD_LIGHT, FAB_GOLD_MID, FAB_GOLD_DEEP]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.14)', 'transparent']}
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fabGloss}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.07)']}
        locations={[0.35, 1]}
        style={styles.fabShade}
      />
    </View>
  );
}

export function HomeStartWalkFab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const pulse = useSharedValue(0);
  const pulseAlt = useSharedValue(0);
  const fabScale = useSharedValue(1);
  /** 0 = resting, 1 = grown to fullscreen cover */
  const holdProgress = useSharedValue(0);
  const maxScaleShared = useSharedValue(28);

  const holdStartRef = useRef(0);
  const navigatedRef = useRef(false);
  const growthHapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deferredHoldResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearGrowthHaptics = useCallback(() => {
    if (growthHapticIntervalRef.current !== null) {
      clearInterval(growthHapticIntervalRef.current);
      growthHapticIntervalRef.current = null;
    }
  }, []);

  const cancelDeferredHoldReset = useCallback(() => {
    if (deferredHoldResetRef.current !== null) {
      clearTimeout(deferredHoldResetRef.current);
      deferredHoldResetRef.current = null;
    }
  }, []);

  const scheduleDeferredHoldReset = useCallback(() => {
    cancelDeferredHoldReset();
    deferredHoldResetRef.current = setTimeout(() => {
      deferredHoldResetRef.current = null;
      holdProgress.value = 0;
    }, HOLD_RESET_AFTER_NAV_MS);
  }, [cancelDeferredHoldReset, holdProgress]);

  useEffect(() => {
    return () => {
      clearGrowthHaptics();
      cancelDeferredHoldReset();
    };
  }, [cancelDeferredHoldReset, clearGrowthHaptics]);

  useFocusEffect(
    useCallback(() => {
      cancelDeferredHoldReset();
      holdProgress.value = 0;
      navigatedRef.current = false;
    }, [cancelDeferredHoldReset, holdProgress]),
  );

  const bottomOffset = Math.max(insets.bottom, Spacing.two) + Spacing.three;
  const rightMargin = Spacing.three;

  const maxScale = useMemo(
    () => computeMaxScreenScale(screenW, screenH, bottomOffset, rightMargin),
    [screenW, screenH, bottomOffset, rightMargin],
  );

  useEffect(() => {
    maxScaleShared.value = maxScale;
  }, [maxScale, maxScaleShared]);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    pulseAlt.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    fabScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [fabScale, pulse, pulseAlt]);

  const scaleMultiplier = useDerivedValue(() => {
    const max = maxScaleShared.value;
    return 1 + holdProgress.value * (max - 1);
  });

  /** Static hit target: idle breathing only; fades as the expanding layer takes over. */
  const staticFabStyle = useAnimatedStyle(() => ({
    opacity: interpolate(holdProgress.value, [0, 0.12], [1, 0], 'clamp'),
    transform: [{ scale: fabScale.value }],
  }));

  /**
   * Separate gold disc (not the Pressable) scales from its center — same center as the FAB,
   * so it grows outward instead of translating off-screen (wrong pivot was causing “flies away”).
   */
  const expandingOrbStyle = useAnimatedStyle(() => ({
    opacity: interpolate(holdProgress.value, [0, 0.12], [0, 1], 'clamp'),
    transform: [{ scale: scaleMultiplier.value }],
  }));

  const ringStyle = useAnimatedStyle(() => {
    const base = interpolate(pulse.value, [0, 0.32, 1], [0.52, 0.26, 0]);
    const ringOpacity = base * (1 - holdProgress.value);
    return {
      transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.58]) }],
      opacity: ringOpacity,
    };
  });

  const ringAltStyle = useAnimatedStyle(() => {
    const base = interpolate(pulseAlt.value, [0, 0.38, 1], [0.38, 0.18, 0]);
    const ringOpacity = base * (1 - holdProgress.value);
    return {
      transform: [{ scale: interpolate(pulseAlt.value, [0, 1], [1, 1.42]) }],
      opacity: ringOpacity,
    };
  });

  const completeHoldAndNavigate = useCallback(() => {
    if (navigatedRef.current) return;
    clearGrowthHaptics();
    navigatedRef.current = true;
    void hapticSuccess();
    holdProgress.value = 1;
    router.push('/walk-in-progress');
    scheduleDeferredHoldReset();
  }, [clearGrowthHaptics, holdProgress, router, scheduleDeferredHoldReset]);

  const handlePressIn = () => {
    navigatedRef.current = false;
    holdStartRef.current = Date.now();
    cancelDeferredHoldReset();
    clearGrowthHaptics();
    void hapticLight();
    if (Platform.OS !== 'web') {
      growthHapticIntervalRef.current = setInterval(() => {
        void hapticGrowthTick();
      }, GROWTH_HAPTIC_INTERVAL_MS);
    }
    cancelAnimation(holdProgress);
    holdProgress.value = 0;
    holdProgress.value = withTiming(
      1,
      {
        duration: HOLD_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(completeHoldAndNavigate)();
        }
      },
    );
  };

  const handlePressOut = () => {
    if (navigatedRef.current) {
      return;
    }
    clearGrowthHaptics();
    cancelAnimation(holdProgress);
    const elapsed = Date.now() - holdStartRef.current;
    const completed = elapsed >= HOLD_DURATION_MS * HOLD_COMPLETE_RATIO;

    if (completed) {
      completeHoldAndNavigate();
      return;
    }

    holdProgress.value = withTiming(0, {
      duration: Math.min(320, Math.max(180, elapsed * 0.45)),
      easing: Easing.out(Easing.cubic),
    });
  };

  return (
    <View
      style={[styles.anchor, { bottom: bottomOffset, right: rightMargin }]}
      pointerEvents="box-none">
      <View style={styles.fabStack} pointerEvents="box-none">
        <Animated.View pointerEvents="none" style={[styles.pulseRing, ringAltStyle]} />
        <Animated.View pointerEvents="none" style={[styles.pulseRing, ringStyle]} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={appStrings.home.startWalkFabA11y}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [styles.hitArea, pressed && styles.pressed]}>
          <Animated.View style={[styles.fabShadow, staticFabStyle]}>
            <View style={styles.fabFace}>
              <LinearGradient
                colors={[FAB_GOLD_LIGHT, FAB_GOLD_MID, FAB_GOLD_DEEP]}
                locations={[0, 0.5, 1]}
                start={{ x: 0.12, y: 0 }}
                end={{ x: 0.88, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.14)', 'transparent']}
                locations={[0, 0.42, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.fabGloss}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', 'rgba(0,0,0,0.07)']}
                locations={[0.35, 1]}
                style={styles.fabShade}
              />
              <MaterialIcons
                name="directions-walk"
                size={36}
                color="#ffffff"
                style={styles.fabIcon}
              />
            </View>
          </Animated.View>
        </Pressable>

        {/* Drawn above the press target so the growth is visible; touches pass through to Pressable */}
        <Animated.View
          pointerEvents="none"
          style={[styles.orbShell, expandingOrbStyle]}
          collapsable={false}>
          <FabGoldDisc />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    zIndex: 9999,
    alignItems: 'flex-end',
    overflow: 'visible',
  },
  fabStack: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  orbShell: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: RADIUS,
    overflow: 'hidden',
    zIndex: 3,
  },
  discFace: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS,
    overflow: 'hidden',
  },
  hitArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: RADIUS,
    backgroundColor: 'rgba(255, 179, 0, 0.42)',
    zIndex: 1,
  },
  pressed: {
    opacity: 0.96,
  },
  fabShadow: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: RADIUS,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    ...Platform.select({
      ios: {
        shadowColor: FAB_GOLD_MID,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 14,
      },
      default: {},
    }),
  },
  fabFace: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '56%',
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },
  fabShade: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
  },
  fabIcon: {
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.5,
      },
      default: {},
    }),
  },
});
