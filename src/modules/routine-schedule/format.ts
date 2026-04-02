import type { PersistedScheduleSlot } from './types';

/** Format hour (0–23) + minute (0–59) into a display string like "7:30 AM". */
export function formatSlotTime(hour: number, minute: number): string {
  const { time, period } = formatSlotTimeParts(hour, minute);
  return `${time} ${period}`;
}

/** Split time + period so UI can style/align them independently. */
export function formatSlotTimeParts(
  hour: number,
  minute: number,
): { time: string; period: string } {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return { time: `${displayHour}:${displayMinute}`, period };
}

/** Build a Date object with today's date but with the given hour & minute. */
export function slotToDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

let _counter = 0;
/** Simple unique ID for schedule slots (not crypto-grade, just local uniqueness). */
export function generateSlotId(): string {
  return `${Date.now()}-${++_counter}`;
}

function sortSlotsByTime(slots: PersistedScheduleSlot[]): PersistedScheduleSlot[] {
  return [...slots].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
}

/**
 * Home routine card (walk / feed): next daily slot after `now` today, or first slot tomorrow if none left.
 */
export function formatNextRoutineSlotCardSubtitle(
  slots: PersistedScheduleSlot[],
  emptyMessage: string,
  now: Date = new Date(),
): string {
  if (slots.length === 0) return emptyMessage;
  const sorted = sortSlotsByTime(slots);
  const nowMs = now.getTime();
  for (const s of sorted) {
    const at = slotToDate(s.hour, s.minute);
    if (at.getTime() > nowMs) return `Next: ${formatSlotTime(s.hour, s.minute)}`;
  }
  const first = sorted[0];
  return `Next: ${formatSlotTime(first.hour, first.minute)}`;
}
