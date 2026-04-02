import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeDogHero, HomeHeader, HomeStartWalkFab, HomeWalkingHistoryPill } from '@/components/home';
import { HomeBentoRoutineSection } from '@/components/routine';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useHomeDogProfile } from '@/hooks/use-home-dog-profile';
import { appStrings } from '@/strings';

const HERO_FALLBACK = require('@/assets/images/stitch-hero-cooper.png');

/** Opaque header + status-bar inset so they match (not canvas `#faf9fe` showing through). */
const HOME_HEADER_BG = StitchCupertinoHome.surfaceLowest;

/** Match Start Walk FAB height (`home-start-walk-fab`) for scroll bottom padding. */
const HOME_FAB_BLOCK = 80;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, avatarUri, ageLabel, ready } = useHomeDogProfile();

  const heroTitle = profile
    ? `${profile.dogName.trim()}'s day`
    : appStrings.home.heroTitleFallback;

  const heroSubtitle = profile
    ? ageLabel ?? appStrings.home.ageUnknown
    : appStrings.home.heroSubtitleFallback;

  const heroImageUri = avatarUri;
  const revision = profile?.savedAt ?? 0;

  const heroFallback =
    !ready ? HERO_FALLBACK : profile && !avatarUri ? null : HERO_FALLBACK;

  return (
    <View style={[styles.root, { backgroundColor: StitchCupertinoHome.canvas }]}>
      <SafeAreaView style={[styles.safeTop, { backgroundColor: HOME_HEADER_BG }]} edges={['top']}>
        <HomeHeader
          brand={appStrings.home.brand}
          titleColor={StitchCupertinoHome.onSurface}
          headerBackgroundColor={HOME_HEADER_BG}
        />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Spacing.four + Spacing.three + HOME_FAB_BLOCK + Math.max(insets.bottom, Spacing.two),
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <HomeDogHero
            title={heroTitle}
            subtitle={heroSubtitle}
            imageUri={ready ? heroImageUri : null}
            fallbackImage={heroFallback}
            avatarRevision={revision}
          />
          <HomeBentoRoutineSection />
          <HomeWalkingHistoryPill />
        </View>
      </ScrollView>
      <HomeStartWalkFab />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeTop: {
    zIndex: 2,
    ...Platform.select({
      web: {
        position: 'sticky' as const,
        top: 0,
      },
      default: {},
    }),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    /** `paddingBottom` set in component (FAB + safe area). */
  },
  inner: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
    paddingTop: Spacing.two,
  },
});
