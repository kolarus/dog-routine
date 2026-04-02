import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

const CARD_BORDER = 'rgba(132, 117, 96, 0.12)';

export type ScheduleReminderCardProps = {
  title: string;
  subtitle: string;
  accentColor: string;
  wellColor: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
};

export function ScheduleReminderCard({
  title,
  subtitle,
  accentColor,
  wellColor,
  enabled,
  onToggle,
}: ScheduleReminderCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: StitchCupertinoHome.surfaceLowest,
          borderColor: CARD_BORDER,
        },
      ]}>
      <View style={[styles.iconWell, { backgroundColor: wellColor }]}>
        <MaterialIcons name="notifications-active" size={22} color={accentColor} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: StitchCupertinoHome.onSurface }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: StitchCupertinoHome.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: '#d1ccc4', true: accentColor }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth * 2,
    marginTop: Spacing.one,
  },
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});
