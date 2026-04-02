import {
  deleteAsync,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';

import type { RoutineScheduleKind } from '@/components/routine/types';
import { resolveDocumentFileUri } from '@/modules/local-photo';

import type { PersistedRoutineSchedule, PersistedScheduleSlot } from './types';

const FILE_NAME: Record<RoutineScheduleKind, string> = {
  walk: 'walk-schedule.json',
  feed: 'feed-schedule.json',
};

function scheduleFileUri(kind: RoutineScheduleKind): string | null {
  return resolveDocumentFileUri(FILE_NAME[kind]);
}

function isSlotArray(arr: unknown): arr is PersistedScheduleSlot[] {
  if (!Array.isArray(arr)) return false;
  return arr.every(
    (s) =>
      s &&
      typeof s === 'object' &&
      typeof (s as Record<string, unknown>).id === 'string' &&
      typeof (s as Record<string, unknown>).hour === 'number' &&
      typeof (s as Record<string, unknown>).minute === 'number',
  );
}

function parseSchedule(
  raw: string,
  kind: RoutineScheduleKind,
): PersistedRoutineSchedule | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const o = parsed as Record<string, unknown>;
    if (o.kind !== kind) return null;
    if (!isSlotArray(o.slots)) return null;
    const savedAt =
      typeof o.savedAt === 'number' && Number.isFinite(o.savedAt) ? o.savedAt : Date.now();
    const remindersEnabled = typeof o.remindersEnabled === 'boolean' ? o.remindersEnabled : true;
    return { kind, slots: o.slots, remindersEnabled, savedAt };
  } catch {
    return null;
  }
}

export async function loadSchedule(
  kind: RoutineScheduleKind,
): Promise<PersistedRoutineSchedule | null> {
  const uri = scheduleFileUri(kind);
  if (!uri) return null;
  const info = await getInfoAsync(uri);
  if (!info.exists || info.isDirectory) return null;
  const raw = await readAsStringAsync(uri);
  return parseSchedule(raw, kind);
}

export async function saveSchedule(
  kind: RoutineScheduleKind,
  slots: PersistedScheduleSlot[],
  remindersEnabled: boolean,
): Promise<void> {
  const uri = scheduleFileUri(kind);
  if (!uri) {
    throw new Error(`Cannot save ${kind} schedule: document directory is unavailable`);
  }
  const payload: PersistedRoutineSchedule = { kind, slots, remindersEnabled, savedAt: Date.now() };
  await writeAsStringAsync(uri, JSON.stringify(payload));
}

export async function deleteScheduleFile(kind: RoutineScheduleKind): Promise<void> {
  const uri = scheduleFileUri(kind);
  if (!uri) return;
  const info = await getInfoAsync(uri);
  if (info.exists) {
    await deleteAsync(uri, { idempotent: true });
  }
}

export async function deleteAllScheduleFiles(): Promise<void> {
  await deleteScheduleFile('walk');
  await deleteScheduleFile('feed');
}
