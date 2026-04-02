import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';
import { appStrings } from '@/strings';

export type HomeDogHeroProps = {
  title: string;
  subtitle: string;
  imageUri: string | null;
  /** `require(...)` when no saved photo; `null` = solid background only (no stock photo). */
  fallbackImage: number | null;
  avatarRevision?: number;
};

/**
 * Compact pet profile row — matches Stitch "Home - Refined iOS Layout"
 * (circle avatar + name + subtitle), not the older full-bleed hero card.
 */
export function HomeDogHero({
  title,
  subtitle,
  imageUri,
  fallbackImage,
  avatarRevision = 0,
}: HomeDogHeroProps) {
  const router = useRouter();
  const remote = imageUri
    ? { uri: imageUri, cacheKey: `home-compact-avatar-${avatarRevision}` }
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={appStrings.home.heroNavigateA11y}
      onPress={() => router.push('/onboarding')}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.avatarRing}>
        {remote ? (
          <Image source={remote} style={styles.avatarFill} contentFit="cover" transition={200} />
        ) : fallbackImage != null ? (
          <Image
            source={fallbackImage}
            style={styles.avatarFill}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.avatarFill, styles.avatarPlaceholder]} />
        )}
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const AVATAR = 56;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rowPressed: {
    opacity: 0.92,
  },
  avatarRing: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    backgroundColor: StitchCupertinoHome.surfaceLow,
    borderWidth: 2,
    borderColor: StitchCupertinoHome.surfaceLowest,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  avatarFill: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    backgroundColor: StitchCupertinoHome.surfaceLow,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    color: StitchCupertinoHome.onSurface,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: StitchCupertinoHome.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
});
