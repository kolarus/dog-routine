import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeDogHero, HomeHeader } from '@/components/home';
import { HomeBentoRoutineSection } from '@/components/routine';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHomeDogProfile } from '@/hooks/use-home-dog-profile';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { appStrings } from '@/strings';

const HERO_FALLBACK = require('@/assets/images/stitch-hero-cooper.png');
const AVATAR_PLACEHOLDER = require('@/assets/images/stitch-profile-avatar.png');

export default function HomeScreen() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const light = scheme !== 'dark';

  const canvas = light ? StitchCupertinoHome.canvas : theme.background;
  const headerTint = light ? StitchCupertinoHome.headerBlurTint : theme.backgroundElement;
  const titleColor = light ? StitchCupertinoHome.onSurface : theme.text;

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
    <View style={[styles.root, { backgroundColor: canvas }]}>
      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <HomeHeader
          brand={appStrings.home.brand}
          titleColor={titleColor}
          headerBackgroundColor={headerTint}
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
    paddingBottom: BottomTabInset + Spacing.four,
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
