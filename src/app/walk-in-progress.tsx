import * as Haptics from 'expo-haptics';
import { isGlassEffectAPIAvailable } from 'expo-glass-effect';
import BottomSheet from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants, { AppOwnership } from 'expo-constants';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
} from 'react';
import { Alert, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ACTIVE_WALK_SHEET_SNAP_HEIGHT_PCTS,
  ActiveWalkBottomSheet,
  ActiveWalkControls,
  ActiveWalkMapHero,
  type ActiveWalkMapHeroRef,
  ActiveWalkMapRecenterButton,
  ActiveWalkMetricsGrid,
  ActiveWalkTimerBlock,
  ActiveWalkTopBar,
} from '@/components/walk/in-progress';
import { ACTIVE_WALK_MAP_IMAGE_URI } from '@/constants/active-walk-map';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';
import { useWalkSession } from '@/context/walk-session-context';
import { formatActivityElapsedLabel } from '@/hooks/use-activity-session-timer';
import {
  estimateStepsFromWalkMeters,
  formatActiveWalkSheetDistanceKm,
} from '@/lib/format-activity';
import { totalRouteLengthMeters } from '@/lib/geo';
import { appStrings } from '@/strings';

const s = appStrings.routine.walkInProgress;

export default function WalkInProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    collapseWalkUi,
    expandWalkUi,
    endWalk,
    routePoints,
    reconcileRouteFromStorage,
    elapsedSec,
    paused,
    togglePause,
    showWalkCalories,
    walkCaloriesDisplayValue,
  } = useWalkSession();

  useFocusEffect(
    useCallback(() => {
      expandWalkUi();
    }, [expandWalkUi]),
  );

  useEffect(() => {
    void reconcileRouteFromStorage();
  }, [reconcileRouteFromStorage]);

  const canGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable();

  const [sheetIndex, setSheetIndex] = useState(1);
  const sheetRef = useRef<ComponentRef<typeof BottomSheet>>(null);
  const mapHeroRef = useRef<ActiveWalkMapHeroRef>(null);
  const sheetAnimatedIndex = useSharedValue(1);

  const showNativeMapChrome =
    Platform.OS === 'ios' && Constants.appOwnership !== AppOwnership.Expo;

  const onRecenterMap = useCallback(() => {
    void mapHeroRef.current?.recenterOnUserLocation();
  }, []);

  const onMapPress = useCallback(() => {
    if (sheetIndex === 0) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.snapToIndex(0);
    }
  }, [sheetIndex]);

  const onSheetChange = useCallback((index: number) => {
    setSheetIndex(index);
  }, []);

  const handleCollapse = useCallback(() => {
    collapseWalkUi();
    router.back();
  }, [collapseWalkUi, router]);

  const finishActivity = useCallback(() => {
    endWalk();
    router.back();
  }, [endWalk, router]);

  const promptFinishActivity = useCallback(() => {
    Alert.alert(s.finishConfirmTitle, s.finishConfirmMessage, [
      { text: s.finishConfirmCancel, style: 'cancel' },
      {
        text: s.finishConfirmAction,
        style: 'destructive',
        onPress: () => {
          if (Platform.OS !== 'web') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          finishActivity();
        },
      },
    ]);
  }, [finishActivity]);

  const onPhotoPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const onTogglePause = useCallback(async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    togglePause();
  }, [togglePause]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return undefined;
      }
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        handleCollapse();
        return true;
      });
      return () => sub.remove();
    }, [handleCollapse]),
  );

  const sheetExpanded = sheetIndex === 1;
  const mapTapA11y = sheetExpanded ? s.mapShowMoreA11y : s.mapShowDetailsA11y;

  const { distanceKmLabel, stepsLabel } = useMemo(() => {
    const meters = totalRouteLengthMeters(routePoints);
    return {
      distanceKmLabel: formatActiveWalkSheetDistanceKm(meters),
      stepsLabel: String(estimateStepsFromWalkMeters(meters)),
    };
  }, [routePoints]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ActiveWalkMapHero
        ref={mapHeroRef}
        mapImageUri={ACTIVE_WALK_MAP_IMAGE_URI}
        mapImageA11y={s.mapImageA11y}
        mapTapA11y={mapTapA11y}
        onMapPress={onMapPress}
        sheetSnapHeightPct={ACTIVE_WALK_SHEET_SNAP_HEIGHT_PCTS[sheetIndex]}
        sheetExpanded={sheetExpanded}
        routeCoordinates={routePoints}
      />
      <ActiveWalkBottomSheet
        ref={sheetRef}
        bottomInset={insets.bottom}
        animatedIndex={sheetAnimatedIndex}
        onSheetChange={onSheetChange}
        upperContent={
          <View>
            <ActiveWalkTimerBlock
              elapsedLabel={formatActivityElapsedLabel(elapsedSec)}
              caption={s.timeElapsed}
            />
            <ActiveWalkMetricsGrid
              distanceValue={distanceKmLabel}
              distanceUnit={s.km}
              stepsValue={stepsLabel}
              stepsUnit={s.steps}
              calories={{
                value: showWalkCalories ? walkCaloriesDisplayValue : s.caloriesUnavailable,
                unit: s.calories,
              }}
            />
          </View>
        }
        lowerContent={
          <ActiveWalkControls
            paused={paused}
            pauseA11y={s.pauseA11y}
            resumeA11y={s.resumeA11y}
            onTogglePause={onTogglePause}
            finishCaption={s.finishActivityCaption}
            finishA11y={s.finishActivityA11y}
            onFinishPress={promptFinishActivity}
            photoA11y={s.photoA11y}
            onPhotoPress={onPhotoPress}
          />
        }
      />
      {showNativeMapChrome ? (
        <ActiveWalkMapRecenterButton
          animatedIndex={sheetAnimatedIndex}
          sheetExpanded={sheetExpanded}
          accessibilityLabel={s.recenterMapA11y}
          onPress={onRecenterMap}
        />
      ) : null}
      <ActiveWalkTopBar
        paddingTop={insets.top + Spacing.two}
        useGlass={canGlass}
        title={s.title}
        collapseA11y={s.collapseA11y}
        onCollapse={handleCollapse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: StitchCupertinoHome.canvas,
  },
});
