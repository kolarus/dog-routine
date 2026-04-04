import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Pressable, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';

export type ActiveWalkMapHeroProps = {
  mapImageUri: string;
  mapImageA11y: string;
  mapTapA11y: string;
  onMapPress: () => void;
};

/** Full-bleed map behind the bottom sheet. */
export function ActiveWalkMapHero({
  mapImageUri,
  mapImageA11y,
  mapTapA11y,
  onMapPress,
}: ActiveWalkMapHeroProps) {
  return (
    <View style={styles.section}>
      <Image
        accessible={false}
        source={{ uri: mapImageUri }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(250,249,254,0.35)', 'transparent', 'rgba(250,249,254,0.92)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={mapTapA11y}
        accessibilityHint={mapImageA11y}
        onPress={onMapPress}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: StitchCupertinoHome.surfaceLow,
  },
});
