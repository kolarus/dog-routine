import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import {
  OnboardingDobField,
  OnboardingFocusedLayout,
  OnboardingMomentumHeader,
  OnboardingPhotoSlot,
  OnboardingPrimaryCta,
  OnboardingUnderlineField,
} from '@/components/onboarding';
import { OnboardingFocusedLayout as L } from '@/constants/onboarding-focused';
import { useOnboardingProfile } from '@/modules/dog-profile';
import { appStrings } from '@/strings';

const s = appStrings.onboarding;

export default function OnboardingScreen() {
  const router = useRouter();
  const profile = useOnboardingProfile();

  const onSave = React.useCallback(async () => {
    await profile.saveProfile();
    // Wait for disk + notifyProfileDiskChanged so Home reads a complete profile and drops the setup banner.
    // Pop preserves `animation: 'fade'` reverse (fade out); replace is for no history (e.g. deep link).
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [profile, router]);

  return (
    <OnboardingFocusedLayout
      footer={<OnboardingPrimaryCta label={s.saveProfile} onPress={onSave} />}>
      <OnboardingMomentumHeader title={s.headerTitle} subtitle={s.headerSubtitle} />
      <OnboardingPhotoSlot
        imageUri={profile.avatarUri}
        imageDisplayToken={profile.avatarDisplayToken}
        onPress={profile.pickAvatar}
      />
      <View style={{ gap: L.fieldStackGap }}>
        <OnboardingUnderlineField
          label={s.dogNameLabel}
          value={profile.dogName}
          onChangeText={profile.setDogName}
          placeholder={s.dogNamePlaceholder}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <OnboardingDobField fieldLabel={s.dobLabel} dob={profile.dob} onChangeDob={profile.setDob} />
      </View>
    </OnboardingFocusedLayout>
  );
}
