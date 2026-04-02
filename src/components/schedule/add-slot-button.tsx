import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';

export type AddSlotButtonProps = {
  label: string;
  a11yLabel: string;
  accentColor: string;
  onPress: () => void;
};

export function AddSlotButton({
  label,
  a11yLabel,
  accentColor,
  onPress,
}: AddSlotButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.75 : 1 }]}>
      <MaterialIcons name="add-circle" size={22} color={accentColor} />
      <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
