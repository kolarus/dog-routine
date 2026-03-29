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
import { useTheme } from '@/hooks/use-theme';
import { appStrings } from '@/strings';

import type { RoutineAppearance } from './types';

export type RoutinePillProps = {
  label: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor: string;
  iconWell: string;
  showDue?: boolean;
  onPress?: () => void;
  /** `stitch-light` uses Cupertino home tokens; `system` follows app light/dark theme. */
  appearance: RoutineAppearance;
  /** Layout-only styles (width, flex, margins) from the parent container. */
  layoutStyle?: StyleProp<ViewStyle>;
};

export function RoutinePill({
  label,
  subtitle,
  icon,
  iconColor,
  iconWell,
  showDue,
  onPress,
  appearance,
  layoutStyle,
}: RoutinePillProps) {
  const theme = useTheme();
  const stitch = appearance === 'stitch-light';

  const cardBg = stitch ? StitchCupertinoHome.surfaceLowest : theme.backgroundElement;
  const titleColor = stitch ? StitchCupertinoHome.onSurface : theme.text;
  const subtitleColor = stitch ? StitchCupertinoHome.onSurfaceVariant : theme.textSecondary;
  const borderColor = stitch ? 'rgba(132, 117, 96, 0.12)' : 'rgba(255,255,255,0.08)';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        layoutStyle,
        {
          backgroundColor: cardBg,
          borderColor,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconWell, { backgroundColor: iconWell }]}>
          <MaterialIcons name={icon} size={22} color={iconColor} />
        </View>
        {showDue ? (
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
