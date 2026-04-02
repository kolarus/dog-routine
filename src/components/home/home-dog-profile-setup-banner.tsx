import {
  Lexend_400Regular,
  Lexend_500Medium,
} from '@expo-google-fonts/lexend';
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { DEFAULT_DOG_PROFILE_IMAGE } from '@/constants/default-dog-profile-image';
import { ProfileSetupBannerFonts } from '@/constants/profile-setup-banner';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { setSkippedDogProfile } from '@/modules/dog-profile';
import { appStrings } from '@/strings';

const s = appStrings.home.profileSetupBanner;

/** Stitch HTML: `rounded-[2rem]` */
const HERO_RADIUS = 32;
/** Stitch HTML: `rounded-xl` on primary CTA */
const CTA_RADIUS = 12;

export function HomeDogProfileSetupBanner() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [skipping, setSkipping] = React.useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_800ExtraBold,
    PlusJakartaSans_700Bold,
    Lexend_400Regular,
    Lexend_500Medium,
  });

  const contentW = Math.min(MaxContentWidth, windowWidth) - Spacing.three * 2;
  const heroHeight = Math.min((contentW * 3) / 4, 320);

  const onSkip = React.useCallback(() => {
    setSkipping(true);
    void (async () => {
      try {
        await setSkippedDogProfile();
      } finally {
        setSkipping(false);
      }
    })();
  }, []);

  const titleFF = fontsLoaded ? ProfileSetupBannerFonts.title : undefined;
  const bodyFF = fontsLoaded ? ProfileSetupBannerFonts.body : undefined;
  const btnFF = fontsLoaded ? ProfileSetupBannerFonts.button : undefined;
  const skipFF = fontsLoaded ? ProfileSetupBannerFonts.skip : undefined;

  return (
    <View
      style={styles.section}
      accessibilityLabel={`${s.title}. ${s.body}`}
      accessibilityRole="none">
      <View
        style={[
          styles.heroClip,
          {
            width: '100%',
            height: heroHeight,
            borderRadius: HERO_RADIUS,
            backgroundColor: StitchCupertinoHome.surfaceLow,
          },
        ]}>
        <Image
          source={DEFAULT_DOG_PROFILE_IMAGE}
          style={[StyleSheet.absoluteFillObject, styles.heroImage]}
          contentFit="cover"
          accessibilityLabel={s.heroImageA11y}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(244, 243, 248, 0.95)']}
          locations={[0.35, 1]}
          style={styles.heroFade}
        />
      </View>

      <Text
        style={[
          styles.title,
          {
            fontFamily: titleFF,
            color: StitchCupertinoHome.onSurface,
          },
        ]}>
        {s.title}
      </Text>
      <Text
        style={[
          styles.body,
          {
            fontFamily: bodyFF,
            color: StitchCupertinoHome.onSurfaceVariant,
          },
        ]}>
        {s.body}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={s.addProfileA11y}
        onPress={() => router.push('/onboarding')}
        style={({ pressed }) => [styles.ctaPress, pressed && styles.ctaPressActive]}>
        <LinearGradient
          colors={[StitchCupertinoHome.primary, StitchCupertinoHome.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaGradient}>
          <Text style={[styles.ctaLabel, { fontFamily: btnFF }]}>{s.addProfile}</Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={s.skipForNowA11y}
        onPress={onSkip}
        disabled={skipping}
        style={({ pressed }) => [styles.skipBtn, pressed && !skipping && styles.skipPressed]}>
        {skipping ? (
          <ActivityIndicator color={StitchCupertinoHome.onSurfaceVariant} />
        ) : (
          <Text
            style={[
              styles.skipLabel,
              {
                fontFamily: skipFF,
                color: StitchCupertinoHome.onSurfaceVariant,
              },
            ]}>
            {s.skipForNow}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignItems: 'center',
    marginBottom: Spacing.five + 8,
  },
  heroClip: {
    overflow: 'hidden',
    marginBottom: Spacing.four,
    alignSelf: 'stretch',
  },
  heroImage: {
    opacity: 0.8,
  },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: Spacing.three,
    maxWidth: 340,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.five + 8,
    maxWidth: 320,
  },
  ctaPress: {
    alignSelf: 'stretch',
    borderRadius: CTA_RADIUS,
    shadowColor: StitchCupertinoHome.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  ctaPressActive: {
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    borderRadius: CTA_RADIUS,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  skipBtn: {
    marginTop: Spacing.four,
    paddingVertical: Spacing.two,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipPressed: {
    opacity: 0.75,
  },
  skipLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
