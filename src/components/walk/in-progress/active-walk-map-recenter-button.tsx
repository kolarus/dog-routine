import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

import { ACTIVE_WALK_SHEET_SNAP_HEIGHT_PCTS } from './active-walk-bottom-sheet';

const BTN = 44;
/** Centers the control on the sheet’s top edge (half above, half on the sheet). */
const EDGE_INSET = BTN / 2;
/** Shift the whole control up by one full button height on top of that alignment. */
const RAISE_BY_BUTTON_HEIGHT = BTN;

export type ActiveWalkMapRecenterButtonProps = {
  animatedIndex: SharedValue<number>;
  accessibilityLabel: string;
  onPress: () => void;
};

export function ActiveWalkMapRecenterButton({
  animatedIndex,
  accessibilityLabel,
  onPress,
}: ActiveWalkMapRecenterButtonProps) {
  const { height: windowHeight } = useWindowDimensions();
  const windowH = useSharedValue(windowHeight);

  useEffect(() => {
    windowH.value = windowHeight;
  }, [windowHeight, windowH]);

  const animatedStyle = useAnimatedStyle(() => {
    const H = windowH.value;
    const [pctCollapsed, pctExpanded] = ACTIVE_WALK_SHEET_SNAP_HEIGHT_PCTS;
    const topWhenCollapsed = H * (1 - pctCollapsed / 100) - EDGE_INSET;
    const topWhenExpanded = H * (1 - pctExpanded / 100) - EDGE_INSET;
    const top =
      interpolate(
        animatedIndex.value,
        [0, 1],
        [topWhenCollapsed, topWhenExpanded],
        Extrapolation.CLAMP,
      ) - RAISE_BY_BUTTON_HEIGHT;
    return {
      position: 'absolute' as const,
      top,
      right: Spacing.three + 2,
      width: BTN,
      height: BTN,
      zIndex: 100,
    };
  });

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Animated.View style={animatedStyle} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={handlePress}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <MaterialIcons name="my-location" size={22} color={StitchCupertinoHome.primary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: StitchCupertinoHome.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  fabPressed: {
    opacity: 0.88,
  },
});
