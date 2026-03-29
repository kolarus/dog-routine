import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  OnboardingFocusedColors,
  OnboardingFocusedLayout as L,
} from '@/constants/onboarding-focused';
import { BottomTabInset } from '@/constants/theme';

export type OnboardingFocusedLayoutProps = {
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function OnboardingFocusedLayout({ children, footer }: OnboardingFocusedLayoutProps) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const horizontalPadding = Math.max(
    L.horizontalPaddingMin,
    Math.round(windowWidth * L.horizontalPaddingWidthFraction),
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: OnboardingFocusedColors.canvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={L.keyboardVerticalOffset}>
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: L.contentTopPadding + insets.top,
              paddingBottom: L.scrollBottomGutter + insets.bottom,
              maxWidth: L.maxCanvasWidth,
              width: '100%',
              alignSelf: 'center',
            },
          ]}>
          {children}
        </ScrollView>

        <View
          style={[
            styles.footerWrap,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: insets.bottom + BottomTabInset + L.ctaVerticalPadding / 2,
              backgroundColor: OnboardingFocusedColors.canvas,
            },
          ]}>
          <View style={styles.footerInner}>
            {footer}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footerWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  footerInner: {
    maxWidth: L.maxCanvasWidth,
    width: '100%',
    alignSelf: 'center',
  },
});
