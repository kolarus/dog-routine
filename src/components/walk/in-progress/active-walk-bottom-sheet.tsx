import BottomSheet, {
  BottomSheetView,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { forwardRef, useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

export const ACTIVE_WALK_SHEET_RADIUS = 40;

/** Height of the sheet as % of container; must stay in sync with `snapPoints`. Index 0 = collapsed, 1 = expanded. */
export const ACTIVE_WALK_SHEET_SNAP_HEIGHT_PCTS = [11, 50] as const;

export type ActiveWalkBottomSheetProps = {
  bottomInset: number;
  onSheetChange: (index: number) => void;
  upperContent: ReactNode;
  lowerContent: ReactNode;
  /** When set, gorhom syncs this shared value with the live sheet index (for overlays). */
  animatedIndex?: SharedValue<number>;
};

type SheetMainProps = {
  upperContent: ReactNode;
  lowerContent: ReactNode;
  contentPaddingBottom: number;
};

function SheetMainContent({ upperContent, lowerContent, contentPaddingBottom }: SheetMainProps) {
  const { animatedIndex } = useBottomSheet();

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 0.35, 1],
      [0, 0.2, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <BottomSheetView style={[styles.sheetView, { paddingBottom: contentPaddingBottom }]}>
      <Animated.View style={[styles.expandedBlock, expandedStyle]}>
        <View style={styles.expandedInner}>
          {upperContent}
          {lowerContent}
        </View>
      </Animated.View>
    </BottomSheetView>
  );
}

export const ActiveWalkBottomSheet = forwardRef<BottomSheet, ActiveWalkBottomSheetProps>(
  function ActiveWalkBottomSheet(
    { bottomInset, onSheetChange, upperContent, lowerContent, animatedIndex },
    ref,
  ) {
    const animationConfigs = useBottomSheetSpringConfigs({
      damping: 28,
      stiffness: 380,
      mass: 0.55,
      overshootClamping: false,
    });

    /** Collapsed vs expanded; cap expanded so the map stays visible (~half screen). */
    const snapPoints = useMemo(
      (): (string | number)[] => [
        `${ACTIVE_WALK_SHEET_SNAP_HEIGHT_PCTS[0]}%`,
        `${ACTIVE_WALK_SHEET_SNAP_HEIGHT_PCTS[1]}%`,
      ],
      [],
    );

    /** Inset as inner padding only — `bottomInset` on the sheet leaves a visible gap (often gray) above the home indicator. */
    const contentPaddingBottom = useMemo(
      () => Spacing.five + Spacing.two + bottomInset,
      [bottomInset],
    );

    return (
      <BottomSheet
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        bottomInset={0}
        animationConfigs={animationConfigs}
        onChange={onSheetChange}
        animatedIndex={animatedIndex}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
        handleStyle={styles.handleContainer}
        enableOverDrag>
        <SheetMainContent
          contentPaddingBottom={contentPaddingBottom}
          upperContent={upperContent}
          lowerContent={lowerContent}
        />
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: StitchCupertinoHome.canvas,
    borderTopLeftRadius: ACTIVE_WALK_SHEET_RADIUS,
    borderTopRightRadius: ACTIVE_WALK_SHEET_RADIUS,
    overflow: 'hidden',
  },
  handleContainer: {
    paddingTop: Spacing.one + 2,
    paddingBottom: Spacing.half,
  },
  handleIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: StitchCupertinoHome.outlineVariant,
    opacity: 0.65,
  },
  sheetView: {
    flex: 1,
    paddingHorizontal: Spacing.three + 2,
  },
  expandedBlock: {
    flex: 1,
    width: '100%',
    marginTop: Spacing.half,
  },
  expandedInner: {
    flex: 1,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
});
