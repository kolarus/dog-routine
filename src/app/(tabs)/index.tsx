import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HomeDogHero,
  HomeDogProfileSetupBanner,
  HomeHeader,
  HomeStartWalkFab,
  HomeWalkingHistoryPill,
} from '@/components/home';
import { HomeBentoRoutineSection } from '@/components/routine';
import { DEFAULT_DOG_PROFILE_IMAGE } from '@/constants/default-dog-profile-image';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useHomeDogProfile } from '@/hooks/use-home-dog-profile';
import { appStrings } from '@/strings';

const HERO_FALLBACK = DEFAULT_DOG_PROFILE_IMAGE;

/** Opaque header + status-bar inset so they match (not canvas `#faf9fe` showing through). */
const HOME_HEADER_BG = StitchCupertinoHome.surfaceLowest;

/** Match Start Walk FAB height (`home-start-walk-fab`) for scroll bottom padding. */
const HOME_FAB_BLOCK = 80;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, avatarUri, ageLabel, ready, showProfileSetupBanner } = useHomeDogProfile();

  const heroTitle = profile
    ? `${profile.dogName.trim()}'s day`
    : appStrings.home.heroTitleFallback;

  const heroSubtitle = profile
    ? ageLabel ?? appStrings.home.ageUnknown
    : appStrings.home.heroSubtitleFallback;

  const heroImageUri = avatarUri;
  const revision = profile?.savedAt ?? 0;

  /** Same default as onboarding whenever there is no saved photo (including named profile, no DOB). */
  const heroFallback = HERO_FALLBACK;

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
          {showProfileSetupBanner ? (
            <HomeDogProfileSetupBanner />
          ) : (
            <HomeDogHero
              title={heroTitle}
              subtitle={heroSubtitle}
              imageUri={ready ? heroImageUri : null}
              fallbackImage={heroFallback}
              avatarRevision={revision}
            />
          )}
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
