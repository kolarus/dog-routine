import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OnboardingFocusedColors,
  OnboardingFocusedLayout as L,
} from '@/constants/onboarding-focused';
import { appStrings } from '@/strings';

export type OnboardingPhotoSlotProps = {
  /** Local `file://` or content URI after the user picks an image */
  imageUri?: string | null;
  /** Change when the same path is overwritten (e.g. after Save) so the image cache refreshes */
  imageDisplayToken?: number;
  onPress?: () => void;
  addPhotoLabel?: string;
  changePhotoLabel?: string;
};

export function OnboardingPhotoSlot({
  imageUri,
  imageDisplayToken = 0,
  onPress,
  addPhotoLabel = appStrings.onboarding.addPhoto,
  changePhotoLabel = appStrings.onboarding.changePhoto,
}: OnboardingPhotoSlotProps) {
  const diameter = L.photoDiameter;
  const radius = diameter / 2;
  const hitBox = diameter + 12;
  const hasImage = Boolean(imageUri);
  const a11yLabel = hasImage ? changePhotoLabel : addPhotoLabel;

  return (
    <View style={[styles.section, { marginBottom: L.photoSectionBottomMargin }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        onPress={onPress}
        hitSlop={12}
        style={({ pressed }) => [
          styles.hitBox,
          {
            width: hitBox,
            height: hitBox,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}>
        <View
          style={[
            styles.circle,
            {
              width: diameter,
              height: diameter,
              borderRadius: radius,
              backgroundColor: OnboardingFocusedColors.surfaceContainerHigh,
            },
          ]}>
          {hasImage && imageUri ? (
            <Image
              source={{
                uri: imageUri,
                cacheKey: `onboarding-avatar-${imageDisplayToken}`,
              }}
              style={styles.imageFill}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <>
              <MaterialIcons
                name="add-a-photo"
                size={36}
                color={OnboardingFocusedColors.onSurfaceVariant}
              />
              <Text style={[styles.microLabel, { color: OnboardingFocusedColors.onSurfaceVariant }]}>
                {addPhotoLabel.toUpperCase()}
              </Text>
            </>
          )}
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: OnboardingFocusedColors.primaryContainer,
              bottom: 2,
              right: 2,
              padding: L.editBadgePadding,
            },
          ]}>
          <MaterialIcons
            name="edit"
            size={18}
            color={OnboardingFocusedColors.onPrimaryContainer}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  hitBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageFill: {
    ...StyleSheet.absoluteFillObject,
  },
  microLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
});
