import type { RoutineScheduleKind } from '@/components/routine/types';

type Listener = () => void;

const listenersMap = new Map<RoutineScheduleKind, Set<Listener>>();

function listenersFor(kind: RoutineScheduleKind): Set<Listener> {
  let set = listenersMap.get(kind);
  if (!set) {
    set = new Set();
    listenersMap.set(kind, set);
  }
  return set;
}

export function subscribeScheduleDiskChanged(
  kind: RoutineScheduleKind,
  listener: Listener,
): () => void {
  const set = listenersFor(kind);
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

export function notifyScheduleDiskChanged(kind: RoutineScheduleKind): void {
  const set = listenersMap.get(kind);
  if (!set) return;
  for (const l of set) l();
}
