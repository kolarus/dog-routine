import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { RoutineScheduleKind } from '@/components/routine/types';

import { loadSchedule } from './storage';
import type { PersistedRoutineSchedule, PersistedScheduleSlot } from './types';

const ROUTINE_SCOPE = 'routine-schedule';
const ANDROID_CHANNEL_ID = 'routine-reminders';

type ScheduledNotification = {
  content: Notifications.NotificationContentInput;
  trigger: Notifications.CalendarTriggerInput;
};

function labelFor(kind: RoutineScheduleKind): string {
  return kind === 'walk' ? 'walk' : 'meal';
}

function mainNotificationFor(kind: RoutineScheduleKind, slot: PersistedScheduleSlot): ScheduledNotification {
  const label = labelFor(kind);
  return {
    content: {
      title: kind === 'walk' ? 'Walk time' : 'Feeding time',
      body: `It is time for your dog's ${label}.`,
      data: { scope: ROUTINE_SCOPE, kind, slotId: slot.id, type: 'main' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: slot.hour,
      minute: slot.minute,
      repeats: true,
    },
  };
}

function beforeNotificationFor(
  kind: RoutineScheduleKind,
  slot: PersistedScheduleSlot,
): ScheduledNotification {
  const total = slot.hour * 60 + slot.minute;
  const before = (total + 24 * 60 - 15) % (24 * 60);
  const beforeHour = Math.floor(before / 60);
  const beforeMinute = before % 60;
  const label = labelFor(kind);
  return {
    content: {
      title: kind === 'walk' ? 'Walk in 15 minutes' : 'Feeding in 15 minutes',
      body: `There is ${label} in 15 minutes.`,
      data: { scope: ROUTINE_SCOPE, kind, slotId: slot.id, type: 'before-15' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: beforeHour,
      minute: beforeMinute,
      repeats: true,
    },
  };
}

async function ensurePermissionAndChannel(shouldRequestPermission: boolean): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted;
  if (!granted && shouldRequestPermission) {
    const request = await Notifications.requestPermissionsAsync();
    granted = request.granted;
  }
  if (!granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Routine reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 200, 250],
    });
  }
  return true;
}

async function cancelRoutineNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const routine = scheduled.filter((n) => n.content.data?.scope === ROUTINE_SCOPE);
  await Promise.all(
    routine.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

function buildNotificationsForSchedule(
  schedule: PersistedRoutineSchedule | null,
): ScheduledNotification[] {
  if (!schedule) return [];
  return schedule.slots.flatMap((slot) => {
    const notifications: ScheduledNotification[] = [mainNotificationFor(schedule.kind, slot)];
    if (schedule.remindersEnabled) {
      notifications.push(beforeNotificationFor(schedule.kind, slot));
    }
    return notifications;
  });
}

export async function syncAllRoutineScheduleNotifications(options?: {
  requestPermissions?: boolean;
}): Promise<void> {
  await cancelRoutineNotifications();

  const granted = await ensurePermissionAndChannel(options?.requestPermissions ?? true);
  if (!granted) return;

  const [walk, feed] = await Promise.all([loadSchedule('walk'), loadSchedule('feed')]);
  const notifications = [...buildNotificationsForSchedule(walk), ...buildNotificationsForSchedule(feed)];
  await Promise.all(
    notifications.map((n) =>
      Notifications.scheduleNotificationAsync({
        content: n.content,
        trigger: n.trigger,
      }),
    ),
  );
}
