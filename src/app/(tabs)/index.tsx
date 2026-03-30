import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeDogHero, HomeHeader, HomeWalkingHistoryPill } from '@/components/home';
import { HomeBentoRoutineSection } from '@/components/routine';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHomeDogProfile } from '@/hooks/use-home-dog-profile';
import { appStrings } from '@/strings';

const HERO_FALLBACK = require('@/assets/images/stitch-hero-cooper.png');
const AVATAR_PLACEHOLDER = require('@/assets/images/stitch-profile-avatar.png');

export default function HomeScreen() {
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
      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <HomeHeader
          brand={appStrings.home.brand}
          titleColor={StitchCupertinoHome.onSurface}
          headerBackgroundColor={StitchCupertinoHome.headerBlurTint}
          avatarUri={ready ? avatarUri : null}
          placeholder={AVATAR_PLACEHOLDER}
          avatarRevision={revision}
        />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <HomeDogHero
            title={heroTitle}
            subtitle={heroSubtitle}
            imageUri={ready ? heroImageUri : null}
            fallbackImage={heroFallback}
            avatarRevision={revision}
          />
          <HomeWalkingHistoryPill />
          <HomeBentoRoutineSection />
        </View>
      </ScrollView>
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
    paddingBottom: BottomTabInset + Spacing.four + Spacing.three,
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
