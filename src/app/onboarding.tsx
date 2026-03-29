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
  const profile = useOnboardingProfile();

  return (
    <OnboardingFocusedLayout
      footer={
        <OnboardingPrimaryCta label={s.saveProfile} onPress={() => void profile.saveProfile()} />
      }>
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
