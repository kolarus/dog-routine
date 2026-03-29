import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OnboardingFocusedColors,
  OnboardingFocusedLayout as L,
} from '@/constants/onboarding-focused';

const ICON_SIZE = 22;
const PRESSED_SCALE = 0.98;

export type OnboardingPrimaryCtaProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Optional trailing icon name; omit or pass `null` for text-only */
  icon?: React.ComponentProps<typeof MaterialIcons>['name'] | null;
};

export function OnboardingPrimaryCta({
  label,
  onPress,
  disabled,
  icon = 'check-circle',
}: OnboardingPrimaryCtaProps) {
  const textColor = OnboardingFocusedColors.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: OnboardingFocusedColors.primary,
          paddingVertical: L.ctaVerticalPadding,
          borderRadius: L.ctaBorderRadius,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled ? PRESSED_SCALE : 1 }],
          shadowColor: OnboardingFocusedColors.ctaShadow,
        },
      ]}>
      <Text style={[styles.label, { color: textColor, fontSize: L.ctaFontSize }]}>{label}</Text>
      {icon ? (
        <View style={styles.iconGap}>
          <MaterialIcons name={icon} size={ICON_SIZE} color={textColor} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  label: {
    fontWeight: '700',
  },
  iconGap: {
    marginLeft: 8,
  },
});
