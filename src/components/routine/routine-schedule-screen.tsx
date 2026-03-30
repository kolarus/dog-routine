import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { appStrings } from '@/strings';

import type { RoutineScheduleKind } from './types';

const CARD_BORDER = 'rgba(132, 117, 96, 0.12)';

type ScheduleSlot = { time: string; days: string };

export type RoutineScheduleScreenProps = {
  kind: RoutineScheduleKind;
};

function copyFor(kind: RoutineScheduleKind) {
  return kind === 'walk' ? appStrings.routine.walkSchedule : appStrings.routine.feedSchedule;
}

function themeFor(kind: RoutineScheduleKind) {
  if (kind === 'walk') {
    return {
      accent: StitchCupertinoHome.primary,
      reminderWell: StitchCupertinoHome.walkIconWell,
      saveBackground: StitchCupertinoHome.primary,
    };
  }
  return {
    accent: StitchCupertinoHome.secondary,
    reminderWell: StitchCupertinoHome.feedIconWell,
    saveBackground: StitchCupertinoHome.secondary,
  };
}

export function RoutineScheduleScreen({ kind }: RoutineScheduleScreenProps) {
  const insets = useSafeAreaInsets();
  const s = copyFor(kind);
  const theme = useMemo(() => themeFor(kind), [kind]);
  const [slots, setSlots] = useState<ScheduleSlot[]>(() => [...s.demoSlots]);

  const onSave = useCallback(() => {
    Alert.alert(s.savedTitle, s.savedMessage);
  }, [s.savedMessage, s.savedTitle]);

  const onAddSlot = useCallback(() => {
    const defaultTime = kind === 'walk' ? '9:00 AM' : '12:00 PM';
    const defaultDays = 'Weekdays';
    setSlots((rows) => [...rows, { time: defaultTime, days: defaultDays }]);
  }, [kind]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: StitchCupertinoHome.canvas }]}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.four) + Spacing.four,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {s.brandKicker} · {appStrings.home.brand}
        </Text>
        <Text style={[styles.title, { color: StitchCupertinoHome.onSurface }]}>{s.dailyTitle}</Text>
        <Text style={[styles.lead, { color: StitchCupertinoHome.onSurfaceVariant }]}>
          {s.dailySubtitle}
        </Text>

        <View style={styles.sectionTop}>
          <Text
            style={[styles.sectionLabel, { color: StitchCupertinoHome.onSurfaceVariant }]}>
            {s.timesHeading}
          </Text>
          <Text style={[styles.summary, { color: StitchCupertinoHome.onSurface }]}>
            {s.timesSummary}
          </Text>
        </View>

        <View style={styles.slotList}>
          {slots.map((row, index) => (
            <View
              key={`${row.time}-${row.days}-${index}`}
              style={[
                styles.slotCard,
                {
                  backgroundColor: StitchCupertinoHome.surfaceLowest,
                  borderColor: CARD_BORDER,
                },
              ]}>
              <View style={styles.slotCardText}>
                <Text style={[styles.slotTime, { color: StitchCupertinoHome.onSurface }]}>
                  {row.time}
                </Text>
                <Text
                  style={[styles.slotDays, { color: StitchCupertinoHome.onSurfaceVariant }]}>
                  {row.days}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={s.editSlotA11y}
                hitSlop={12}
                style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.65 : 1 }]}>
                <MaterialIcons name="edit-calendar" size={22} color={theme.accent} />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={s.addSlotA11y}
          onPress={onAddSlot}
          style={({ pressed }) => [styles.addRow, { opacity: pressed ? 0.75 : 1 }]}>
          <MaterialIcons name="add-circle" size={22} color={theme.accent} />
          <Text style={[styles.addLabel, { color: theme.accent }]}>{s.addAnother}</Text>
        </Pressable>

        <View
          style={[
            styles.reminderCard,
            {
              backgroundColor: StitchCupertinoHome.surfaceLowest,
              borderColor: CARD_BORDER,
            },
          ]}>
          <View style={[styles.reminderIconWell, { backgroundColor: theme.reminderWell }]}>
            <MaterialIcons
              name="notifications-active"
              size={22}
              color={theme.accent}
            />
          </View>
          <View style={styles.reminderText}>
            <Text style={[styles.reminderTitle, { color: StitchCupertinoHome.onSurface }]}>
              {s.remindersTitle}
            </Text>
            <Text
              style={[styles.reminderSub, { color: StitchCupertinoHome.onSurfaceVariant }]}>
              {s.remindersSubtitle}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={s.saveScheduleA11y}
          onPress={onSave}
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor: theme.saveBackground,
              opacity: pressed ? 0.92 : 1,
            },
          ]}>
          <Text style={styles.saveLabel}>{s.saveSchedule}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.two,
  },
  inner: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: Spacing.one,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginTop: -Spacing.one,
  },
  sectionTop: {
    marginTop: Spacing.two,
    gap: Spacing.half,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summary: {
    fontSize: 16,
    fontWeight: '600',
  },
  slotList: {
    gap: Spacing.two,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: StitchCupertinoHome.cardRadius,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  slotCardText: {
    flex: 1,
    gap: 4,
    paddingRight: Spacing.two,
  },
  slotTime: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  slotDays: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconBtn: {
    padding: Spacing.one,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  addLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth * 2,
    marginTop: Spacing.one,
  },
  reminderIconWell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderText: {
    flex: 1,
    gap: 4,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  reminderSub: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    marginTop: Spacing.two,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
