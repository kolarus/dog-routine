import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { RoutineScheduleKind } from '@/components/routine/types';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { formatSlotTimeParts, useRoutineSchedule } from '@/modules/routine-schedule';
import { appStrings } from '@/strings';

import { AddSlotButton } from './add-slot-button';
import { SchedulePageLayout } from './schedule-page-layout';
import { ScheduleReminderCard } from './schedule-reminder-card';
import { ScheduleSlotCard } from './schedule-slot-card';
import { TimePickerSheet } from './time-picker-sheet';
import { useScheduleTimePicker } from './use-schedule-time-picker';
import { useSwipeableGroup } from './use-swipeable-group';

export type ScheduleScreenProps = {
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
    };
  }
  return {
    accent: StitchCupertinoHome.secondary,
    reminderWell: StitchCupertinoHome.feedIconWell,
  };
}

function summaryLabel(kind: RoutineScheduleKind, count: number): string {
  if (kind === 'walk') {
    return count === 1 ? '1 walk daily' : `${count} walks daily`;
  }
  return count === 1 ? '1 meal daily' : `${count} meals daily`;
}

export function ScheduleScreen({ kind }: ScheduleScreenProps) {
  const s = copyFor(kind);
  const theme = useMemo(() => themeFor(kind), [kind]);
  const schedule = useRoutineSchedule(kind);
  const swipeGroup = useSwipeableGroup();
  const picker = useScheduleTimePicker(kind, schedule, swipeGroup.closeOpen);

  return (
    <View style={styles.shell}>
      <SchedulePageLayout
        title={s.dailyTitle}
        subtitle={s.dailySubtitle}
        sectionHeading={s.timesHeading}
        summary={schedule.ready ? summaryLabel(kind, schedule.slots.length) : null}>

        <View>
          {schedule.slots.map((slot) => {
            const { time, period } = formatSlotTimeParts(slot.hour, slot.minute);

            return (
              <ScheduleSlotCard
                key={slot.id}
                time={time}
                period={period}
                accentColor={theme.accent}
                highlighted={picker.isEditing(slot.id)}
                editA11yLabel={s.editSlotA11y}
                swipeableRef={swipeGroup.getRef(slot.id)}
                onEdit={() => picker.openForEdit(slot.id, slot.hour, slot.minute)}
                onRemove={() => {
                  swipeGroup.remove(slot.id);
                  void schedule.removeSlot(slot.id);
                }}
                onSwipeOpen={() => swipeGroup.onOpen(slot.id)}
                onSwipeClose={() => swipeGroup.onClose(slot.id)}
              />
            );
          })}
        </View>

        <AddSlotButton
          label={s.addAnother}
          a11yLabel={s.addSlotA11y}
          accentColor={theme.accent}
          onPress={picker.openForAdd}
        />

        <ScheduleReminderCard
          title={s.remindersTitle}
          subtitle={s.remindersSubtitle}
          accentColor={theme.accent}
          wellColor={theme.reminderWell}
          enabled={schedule.remindersEnabled}
          onToggle={(v) => void schedule.setRemindersEnabled(v)}
        />
      </SchedulePageLayout>

      <TimePickerSheet
        visible={picker.visible}
        value={picker.date}
        title={picker.title}
        accentColor={theme.accent}
        onChange={picker.onChange}
        onDone={picker.onDone}
        onCancel={picker.onCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
