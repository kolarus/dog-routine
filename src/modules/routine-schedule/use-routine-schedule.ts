import { useCallback, useEffect, useRef, useState } from 'react';

import type { RoutineScheduleKind } from '@/components/routine/types';

import { generateSlotId } from './format';
import { syncAllRoutineScheduleNotifications } from './notifications';
import { notifyScheduleDiskChanged, subscribeScheduleDiskChanged } from './schedule-disk-events';
import { loadSchedule, saveSchedule } from './storage';
import type { PersistedScheduleSlot } from './types';

export type UseRoutineScheduleResult = {
  slots: PersistedScheduleSlot[];
  remindersEnabled: boolean;
  ready: boolean;
  addSlot: (hour: number, minute: number) => Promise<void>;
  updateSlot: (id: string, hour: number, minute: number) => Promise<void>;
  removeSlot: (id: string) => Promise<void>;
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
};

function sortByTime(a: PersistedScheduleSlot, b: PersistedScheduleSlot): number {
  return a.hour * 60 + a.minute - (b.hour * 60 + b.minute);
}

export function useRoutineSchedule(kind: RoutineScheduleKind): UseRoutineScheduleResult {
  const [slots, setSlots] = useState<PersistedScheduleSlot[]>([]);
  const [remindersEnabled, setRemindersEnabledState] = useState(true);
  const [ready, setReady] = useState(false);
  const slotsRef = useRef(slots);
  const remindersRef = useRef(remindersEnabled);
  slotsRef.current = slots;
  remindersRef.current = remindersEnabled;

  const refresh = useCallback(async () => {
    const schedule = await loadSchedule(kind);
    const loaded = (schedule?.slots ?? []).sort(sortByTime);
    slotsRef.current = loaded;
    setSlots(loaded);
    setRemindersEnabledState(schedule?.remindersEnabled ?? true);
    setReady(true);
  }, [kind]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => subscribeScheduleDiskChanged(kind, () => void refresh()), [kind, refresh]);

  const persist = useCallback(
    async (updated: PersistedScheduleSlot[], reminders?: boolean) => {
      const sorted = [...updated].sort(sortByTime);
      const r = reminders ?? remindersRef.current;
      slotsRef.current = sorted;
      setSlots(sorted);
      if (reminders !== undefined) {
        remindersRef.current = r;
        setRemindersEnabledState(r);
      }
      await saveSchedule(kind, sorted, r);
      await syncAllRoutineScheduleNotifications();
      notifyScheduleDiskChanged(kind);
    },
    [kind],
  );

  const addSlot = useCallback(
    async (hour: number, minute: number) => {
      const newSlot: PersistedScheduleSlot = { id: generateSlotId(), hour, minute };
      await persist([...slotsRef.current, newSlot]);
    },
    [persist],
  );

  const updateSlot = useCallback(
    async (id: string, hour: number, minute: number) => {
      const updated = slotsRef.current.map((s) =>
        s.id === id ? { ...s, hour, minute } : s,
      );
      await persist(updated);
    },
    [persist],
  );

  const removeSlot = useCallback(
    async (id: string) => {
      await persist(slotsRef.current.filter((s) => s.id !== id));
    },
    [persist],
  );

  const setRemindersEnabled = useCallback(
    async (enabled: boolean) => {
      await persist(slotsRef.current, enabled);
    },
    [persist],
  );

  return { slots, remindersEnabled, ready, addSlot, updateSlot, removeSlot, setRemindersEnabled };
}
