import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { appStrings } from '@/strings';

export type RoutinePillProps = {
  label: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor: string;
  iconWell: string;
  showDue?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  /** Layout-only styles (width, flex, margins) from the parent container. */
  layoutStyle?: StyleProp<ViewStyle>;
};

const DISABLED_TINT = 'rgba(132, 117, 96, 0.35)';
const DISABLED_WELL = 'rgba(132, 117, 96, 0.06)';

export function RoutinePill({
  label,
  subtitle,
  icon,
  iconColor,
  iconWell,
  showDue,
  disabled,
  onPress,
  layoutStyle,
}: RoutinePillProps) {
  const cardBg = StitchCupertinoHome.surfaceLowest;
  const borderColor = 'rgba(132, 117, 96, 0.12)';

  const resolvedIconColor = disabled ? DISABLED_TINT : iconColor;
  const resolvedWell = disabled ? DISABLED_WELL : iconWell;
  const titleColor = disabled ? DISABLED_TINT : StitchCupertinoHome.onSurface;
  const subtitleColor = disabled
    ? 'rgba(132, 117, 96, 0.28)'
    : StitchCupertinoHome.onSurfaceVariant;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${subtitle}`}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        layoutStyle,
        {
          backgroundColor: cardBg,
          borderColor,
          opacity: pressed && !disabled ? 0.92 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
      ]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconWell, { backgroundColor: resolvedWell }]}>
          <MaterialIcons name={icon} size={22} color={resolvedIconColor} />
        </View>
        {showDue && !disabled ? (
          <View style={styles.dueBadge}>
            <Text style={styles.dueBadgeText}>{appStrings.routine.dueBadge}</Text>
          </View>
        ) : null}
      </View>
      <View>
        <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.cardSubtitle, { color: subtitleColor }]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: StitchCupertinoHome.cardMinHeight,
    borderRadius: StitchCupertinoHome.cardRadius,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueBadge: {
    backgroundColor: StitchCupertinoHome.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  dueBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
