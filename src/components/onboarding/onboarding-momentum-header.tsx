import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import {
  OnboardingFocusedColors,
  OnboardingFocusedLayout as L,
} from '@/constants/onboarding-focused';

export type OnboardingMomentumHeaderProps = {
  title: string;
  subtitle: string;
};

export function OnboardingMomentumHeader({ title, subtitle }: OnboardingMomentumHeaderProps) {
  const { width } = useWindowDimensions();
  const titleFontSize = width < 360 ? 28 : width > 430 ? 36 : 34;
  const titleLineHeight = titleFontSize + 6;

  return (
    <View style={[styles.wrap, { marginBottom: L.headerBottomMargin, gap: 8 }]}>
      <Text
        style={[
          styles.title,
          {
            color: OnboardingFocusedColors.onSurface,
            fontSize: titleFontSize,
            lineHeight: titleLineHeight,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: OnboardingFocusedColors.onSurfaceVariant,
            fontSize: 16,
            lineHeight: 24,
          },
        ]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontWeight: '500',
  },
});
