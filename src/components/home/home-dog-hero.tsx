import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

export type HomeDogHeroProps = {
  title: string;
  subtitle: string;
  imageUri: string | null;
  /** `require(...)` when no saved photo; `null` = solid background only (no stock photo). */
  fallbackImage: number | null;
  avatarRevision?: number;
};

export function HomeDogHero({
  title,
  subtitle,
  imageUri,
  fallbackImage,
  avatarRevision = 0,
}: HomeDogHeroProps) {
  const remote = imageUri
    ? { uri: imageUri, cacheKey: `home-hero-avatar-${avatarRevision}` }
    : null;

  return (
    <View style={styles.heroWrap}>
      {remote ? (
        <Image source={remote} style={styles.heroImage} contentFit="cover" transition={200} />
      ) : fallbackImage != null ? (
        <Image source={fallbackImage} style={styles.heroImage} contentFit="cover" transition={200} />
      ) : null}
      <View style={styles.heroOverlay}>
        <View style={styles.heroScrim} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.heroSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    borderRadius: StitchCupertinoHome.heroRadius,
    overflow: 'hidden',
    aspectRatio: 4 / 3,
    backgroundColor: StitchCupertinoHome.surfaceLow,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: StitchCupertinoHome.heroRadius,
  },
  /** Bottom ~30% only — enough contrast for title / age over the image. */
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    top: '70%',
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  heroCopy: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});
