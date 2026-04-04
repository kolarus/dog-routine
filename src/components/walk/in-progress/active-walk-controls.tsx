import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

export type ActiveWalkControlsProps = {
  paused: boolean;
  pauseA11y: string;
  resumeA11y: string;
  onTogglePause: () => void;
  finishCaption: string;
  finishA11y: string;
  onFinishPress: () => void;
  photoA11y: string;
  onPhotoPress: () => void;
};

export function ActiveWalkControls({
  paused,
  pauseA11y,
  resumeA11y,
  onTogglePause,
  finishCaption,
  finishA11y,
  onFinishPress,
  photoA11y,
  onPhotoPress,
}: ActiveWalkControlsProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={paused ? resumeA11y : pauseA11y}
        accessibilityState={{ selected: paused }}
        onPress={onTogglePause}
        style={({ pressed }) => [styles.sideControl, pressed && styles.controlPressed]}>
        <MaterialIcons
          name={paused ? 'play-arrow' : 'pause'}
          size={26}
          color={StitchCupertinoHome.onSurface}
        />
      </Pressable>

      <View style={styles.stopCluster}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={finishA11y}
          onPress={onFinishPress}
          style={({ pressed }) => [styles.stopBtn, pressed && styles.stopBtnPressed]}>
          <MaterialIcons name="stop" size={30} color="#ffffff" />
        </Pressable>
        <Text style={styles.finishCaption}>{finishCaption}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photoA11y}
        onPress={onPhotoPress}
        style={({ pressed }) => [styles.sideControl, pressed && styles.controlPressed]}>
        <MaterialIcons name="photo-camera" size={24} color={StitchCupertinoHome.onSurface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: Spacing.four + 6,
    marginTop: Spacing.three + 4,
    marginBottom: 0,
  },
  sideControl: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: StitchCupertinoHome.surfaceLow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  controlPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  stopCluster: {
    alignItems: 'center',
  },
  stopBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: StitchCupertinoHome.primaryContainer,
    shadowColor: StitchCupertinoHome.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  stopBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.94 }],
  },
  finishCaption: {
    marginTop: Spacing.two + 2,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: StitchCupertinoHome.onSurfaceVariant,
  },
});
