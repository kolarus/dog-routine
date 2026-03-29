import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { OnboardingFocusedColors } from '@/constants/onboarding-focused';

const TRAILING_ICON_SIZE = 22;
const INPUT_FONT = 18;
const INPUT_PAD_V = 16;
const INPUT_PAD_H = 16;
const BORDER_RADIUS = 12;
const LABEL_MARGIN = 8;

export type OnboardingUnderlineFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
} & Omit<TextInputProps, 'style' | 'value' | 'onChangeText' | 'placeholder'>;

export function OnboardingUnderlineField({
  label,
  value,
  onChangeText,
  placeholder,
  ...inputProps
}: OnboardingUnderlineFieldProps) {
  const [focused, setFocused] = React.useState(false);
  const placeholderColor = 'rgba(81, 69, 50, 0.4)';
  const underlineIdle = 'rgba(214, 196, 172, 0.2)';

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: OnboardingFocusedColors.onSurfaceVariant, marginBottom: LABEL_MARGIN }]}>
        {label}
      </Text>
      <View
        style={[
          styles.fieldShell,
          {
            backgroundColor: OnboardingFocusedColors.surfaceContainerLow,
            borderBottomColor: focused ? OnboardingFocusedColors.primaryContainer : underlineIdle,
            borderTopLeftRadius: BORDER_RADIUS,
            borderTopRightRadius: BORDER_RADIUS,
          },
        ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            {
              color: OnboardingFocusedColors.onSurface,
              fontSize: INPUT_FONT,
              paddingVertical: INPUT_PAD_V,
              paddingHorizontal: INPUT_PAD_H,
              paddingRight: INPUT_PAD_H + TRAILING_ICON_SIZE + 8,
            },
          ]}
          {...inputProps}
        />
        <View style={styles.trailing} pointerEvents="none">
          <MaterialIcons
            name="pets"
            size={TRAILING_ICON_SIZE}
            color={`${OnboardingFocusedColors.onSurfaceVariant}80`}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  fieldShell: {
    borderBottomWidth: 2,
    position: 'relative',
  },
  input: {
    fontWeight: '500',
  },
  trailing: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
