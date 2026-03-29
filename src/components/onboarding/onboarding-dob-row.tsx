import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingFocusedColors } from '@/constants/onboarding-focused';

const SEGMENT_GAP = 12;
const SEGMENT_RADIUS = 12;
const SEGMENT_PAD_V = 16;
const SEGMENT_PAD_H = 16;
const LABEL_MARGIN = 8;
const CHEVRON_COLOR = 'rgba(81, 69, 50, 0.5)';

export type OnboardingDobSegment = {
  id: string;
  label: string;
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
};

export type OnboardingDobRowProps = {
  fieldLabel: string;
  segments: OnboardingDobSegment[];
  onPressSegment?: (id: string) => void;
};

export function OnboardingDobRow({ fieldLabel, segments, onPressSegment }: OnboardingDobRowProps) {
  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.label,
          { color: OnboardingFocusedColors.onSurfaceVariant, marginBottom: LABEL_MARGIN },
        ]}>
        {fieldLabel}
      </Text>
      <View style={[styles.row, { gap: SEGMENT_GAP }]}>
        {segments.map((seg) => (
          <Pressable
            key={seg.id}
            accessibilityRole="button"
            accessibilityLabel={`${fieldLabel}: ${seg.label}`}
            onPress={() => onPressSegment?.(seg.id)}
            style={({ pressed }) => [
              styles.segment,
              {
                flex: seg.flex ?? 1,
                minWidth: seg.minWidth,
                maxWidth: seg.maxWidth,
                backgroundColor: pressed
                  ? OnboardingFocusedColors.surfaceContainerHigh
                  : OnboardingFocusedColors.surfaceContainerLow,
                borderRadius: SEGMENT_RADIUS,
                paddingVertical: SEGMENT_PAD_V,
                paddingHorizontal: SEGMENT_PAD_H,
              },
            ]}>
            <Text style={[styles.segmentText, { color: OnboardingFocusedColors.onSurface }]} numberOfLines={1}>
              {seg.label}
            </Text>
            <MaterialIcons name="expand-more" size={22} color={CHEVRON_COLOR} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 4,
  },
});
