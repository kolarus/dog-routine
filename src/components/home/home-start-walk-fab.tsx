import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
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

/**
 * Stitch "Home - Premium Start Walk FAB" — `fab-gradient` + inset gloss (approximated in RN).
 * @see linear-gradient(145deg, #FFD700 0%, #FFB300 50%, #E69500 100%)
 */
const FAB_GOLD_LIGHT = '#FFD700';
const FAB_GOLD_MID = '#FFB300';
const FAB_GOLD_DEEP = '#E69500';

export function HomeStartWalkFab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(0);
  const pulseAlt = useSharedValue(0);
  const fabScale = useSharedValue(1);

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

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.58]) }],
    opacity: interpolate(pulse.value, [0, 0.32, 1], [0.52, 0.26, 0]),
  }));

  const ringAltStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulseAlt.value, [0, 1], [1, 1.42]) }],
    opacity: interpolate(pulseAlt.value, [0, 0.38, 1], [0.38, 0.18, 0]),
  }));

  const fabPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const bottomOffset = Math.max(insets.bottom, Spacing.two) + Spacing.three;

  return (
    <View
      style={[styles.anchor, { bottom: bottomOffset, right: Spacing.three }]}
      pointerEvents="box-none">
      <View style={styles.fabStack} pointerEvents="box-none">
        <Animated.View pointerEvents="none" style={[styles.pulseRing, ringAltStyle]} />
        <Animated.View pointerEvents="none" style={[styles.pulseRing, ringStyle]} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={appStrings.home.startWalkFabA11y}
          onPress={() => router.push('/routine/walk')}
          style={({ pressed }) => [pressed && styles.pressed]}>
          <Animated.View style={[styles.fabShadow, fabPressStyle]}>
            <View style={styles.fabFace}>
              <LinearGradient
                colors={[FAB_GOLD_LIGHT, FAB_GOLD_MID, FAB_GOLD_DEEP]}
                locations={[0, 0.5, 1]}
                start={{ x: 0.12, y: 0 }}
                end={{ x: 0.88, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              {/* Inset gloss: `inset 0 1px 1px rgba(255,255,255,0.4)` from Stitch */}
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.14)', 'transparent']}
                locations={[0, 0.42, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.fabGloss}
              />
              {/* Subtle bottom depth: `inset 0 -2px 4px rgba(0,0,0,0.1)` */}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    zIndex: 20,
    alignItems: 'flex-end',
  },
  fabStack: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: RADIUS,
    backgroundColor: 'rgba(255, 179, 0, 0.42)',
  },
  pressed: {
    opacity: 0.92,
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
