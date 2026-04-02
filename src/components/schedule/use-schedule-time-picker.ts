import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useCallback, useState } from 'react';

import type { RoutineScheduleKind } from '@/components/routine/types';
import { slotToDate, type UseRoutineScheduleResult } from '@/modules/routine-schedule';

type PickerTarget =
  | { mode: 'add' }
  | { mode: 'edit'; slotId: string };

function defaultHour(kind: RoutineScheduleKind): number {
  return kind === 'walk' ? 9 : 12;
}

/**
 * Picker state machine for schedule slots.
 * Returns stable callbacks and derived state — no UI concerns.
 */
export function useScheduleTimePicker(
  kind: RoutineScheduleKind,
  schedule: UseRoutineScheduleResult,
  onBeforeOpen?: () => void,
) {
  const [target, setTarget] = useState<PickerTarget | null>(null);
  const [date, setDate] = useState(() => new Date());

  const visible = target !== null;
  const title = target?.mode === 'edit' ? 'Edit time' : 'Pick a time';

  const onChange = useCallback(
    (_event: DateTimePickerEvent, d?: Date) => {
      if (d) setDate(d);
    },
    [],
  );

  const onDone = useCallback(() => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (target?.mode === 'add') {
      void schedule.addSlot(hour, minute);
    } else if (target?.mode === 'edit') {
      void schedule.updateSlot(target.slotId, hour, minute);
    }
    setTarget(null);
  }, [date, target, schedule]);

  const onCancel = useCallback(() => {
    setTarget(null);
  }, []);

  const openForAdd = useCallback(() => {
    onBeforeOpen?.();
    const d = new Date();
    d.setHours(defaultHour(kind), 0, 0, 0);
    setDate(d);
    setTarget({ mode: 'add' });
  }, [kind, onBeforeOpen]);

  const openForEdit = useCallback(
    (slotId: string, hour: number, minute: number) => {
      onBeforeOpen?.();
      setDate(slotToDate(hour, minute));
      setTarget({ mode: 'edit', slotId });
    },
    [onBeforeOpen],
  );

  const isEditing = useCallback(
    (slotId: string) =>
      target?.mode === 'edit' && target.slotId === slotId,
    [target],
  );

  return { visible, date, title, onChange, onDone, onCancel, openForAdd, openForEdit, isEditing };
}
