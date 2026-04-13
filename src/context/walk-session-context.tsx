import * as Location from 'expo-location';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { formatCaloriesValue } from '@/lib/format-activity';
import { metersBetweenLatLng, totalRouteLengthMeters } from '@/lib/geo';
import { fetchBodyMassKgFromHealth } from '@/modules/health-profile';
import {
  loadActivitiesLogAfterPendingWrites,
  mutateActivitiesLog,
  walkCaloriesFromHealthProfile,
  type ActivityCaloriesSource,
  type ActivityLogEntry,
} from '@/modules/activities-log';
import {
  appendWalkRouteSamples,
  loadWalkRoutePoints,
  saveWalkRoutePoints,
  type WalkRoutePoint,
} from '@/lib/walk-route-storage';
import { clearPersistedActivityFiles } from '@/modules/activity-data';
import { WALK_ROUTE_LOCATION_TASK } from '@/modules/walk-route-background';

/** Skip GPS samples closer than this to the last stored point (meters). */
const WALK_ROUTE_MIN_SEGMENT_M = 4;

const ROUTE_METRICS_PERSIST_DEBOUNCE_MS = 650;
const TIMER_PERSIST_INTERVAL_MS = 4000;

function newActivityId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function currentActiveDurationSec(
  carrySec: number,
  segmentStartMs: number,
  isPaused: boolean,
): number {
  if (isPaused) {
    return carrySec;
  }
  return carrySec + Math.floor((Date.now() - segmentStartMs) / 1000);
}

function caloriesPayloadForPersist(
  weightKg: number | null,
  activeDurationSec: number,
): { caloriesBurnt: number; caloriesSource: ActivityCaloriesSource } {
  const kcal = walkCaloriesFromHealthProfile(weightKg, activeDurationSec);
  if (kcal === null) {
    return { caloriesBurnt: 0, caloriesSource: 'none' };
  }
  return { caloriesBurnt: kcal, caloriesSource: 'health' };
}

type WalkSessionContextValue = {
  isActive: boolean;
  isCollapsed: boolean;
  /** Local activity log (newest last). */
  activitiesLog: ActivityLogEntry[];
  /** Lat/lng samples for the current walk, kept across navigation while the walk is active. */
  routePoints: WalkRoutePoint[];
  /** Moving-time seconds for the in-progress walk UI (excludes pause). */
  elapsedSec: number;
  paused: boolean;
  togglePause: () => void;
  beginWalk: () => void;
  collapseWalkUi: () => void;
  expandWalkUi: () => void;
  endWalk: () => void;
  /** Merge disk route into state when reopening the walk screen (e.g. after fast refresh). */
  reconcileRouteFromStorage: () => Promise<void>;
  /** Apple Health body mass available — show calories in the active walk UI. */
  showWalkCalories: boolean;
  /** Formatted kcal for the metrics pill while a walk is active (empty if not showing). */
  walkCaloriesDisplayValue: string;
  /**
   * Deletes activity-only files and resets session state (e.g. Settings).
   * Does not clear dog profile or schedules.
   */
  clearAllActivityData: () => Promise<void>;
};

const WalkSessionContext = createContext<WalkSessionContextValue | null>(null);

export function WalkSessionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [routePoints, setRoutePoints] = useState<WalkRoutePoint[]>([]);
  const [activitiesLog, setActivitiesLog] = useState<ActivityLogEntry[]>([]);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bodyMassKg, setBodyMassKg] = useState<number | null>(null);

  const isActiveRef = useRef(false);
  const carrySecRef = useRef(0);
  const segmentStartMsRef = useRef(Date.now());
  const pausedRef = useRef(false);
  /** Next GPS sample after resume is tagged so the map starts a new polyline segment. */
  const stampNextRoutePointAfterResumeRef = useRef(false);
  const bodyMassKgRef = useRef<number | null>(null);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    bodyMassKgRef.current = bodyMassKg;
  }, [bodyMassKg]);

  const persistInProgressTimer = useCallback(
    (carry: number, segmentStart: number, isPausedNow: boolean) => {
      const activeDurationSec = currentActiveDurationSec(carry, segmentStart, isPausedNow);
      const { caloriesBurnt, caloriesSource } = caloriesPayloadForPersist(
        bodyMassKgRef.current,
        activeDurationSec,
      );
      void mutateActivitiesLog((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.status !== 'in_progress') {
          return prev;
        }
        if (
          last.activeDurationSec === activeDurationSec &&
          last.isPaused === isPausedNow &&
          last.caloriesBurnt === caloriesBurnt &&
          last.caloriesSource === caloriesSource
        ) {
          return prev;
        }
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            activeDurationSec,
            isPaused: isPausedNow,
            caloriesBurnt,
            caloriesSource,
          },
        ];
      }).then(setActivitiesLog);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const log = await loadActivitiesLogAfterPendingWrites();
      if (cancelled) {
        return;
      }
      setActivitiesLog(log);
      const last = log[log.length - 1];
      if (last?.status === 'in_progress') {
        const route = await loadWalkRoutePoints();
        if (cancelled) {
          return;
        }
        isActiveRef.current = true;
        setRoutePoints(route);
        setIsActive(true);
        setIsCollapsed(true);
        carrySecRef.current = last.activeDurationSec;
        pausedRef.current = last.isPaused;
        setPaused(last.isPaused);
        segmentStartMsRef.current = Date.now();
        setElapsedSec(currentActiveDurationSec(carrySecRef.current, segmentStartMsRef.current, last.isPaused));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      setBodyMassKg(null);
      return undefined;
    }
    let cancelled = false;
    void (async () => {
      const kg = await fetchBodyMassKgFromHealth();
      if (!cancelled && kg != null) {
        setBodyMassKg(kg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isActive]);

  const appendRoutePoint = useCallback(
    (latitude: number, longitude: number, recordedAt?: number) => {
      if (pausedRef.current) {
        return;
      }
      const pt: WalkRoutePoint = {
        latitude,
        longitude,
        recordedAt: recordedAt ?? Date.now(),
      };
      if (stampNextRoutePointAfterResumeRef.current) {
        pt.resumeAfterPause = true;
        stampNextRoutePointAfterResumeRef.current = false;
      }
      setRoutePoints((prev) => {
        const last = prev[prev.length - 1];
        if (
          last &&
          !pt.resumeAfterPause &&
          metersBetweenLatLng(last, pt) < WALK_ROUTE_MIN_SEGMENT_M
        ) {
          return prev;
        }
        return [...prev, pt];
      });
      void appendWalkRouteSamples([pt], WALK_ROUTE_MIN_SEGMENT_M);
    },
    [],
  );

  const reconcileRouteFromStorage = useCallback(async () => {
    const loaded = await loadWalkRoutePoints();
    setRoutePoints((current) => {
      if (loaded.length > current.length) {
        return loaded;
      }
      return current;
    });
  }, []);

  const beginWalk = useCallback(() => {
    if (isActiveRef.current) {
      return;
    }
    isActiveRef.current = true;
    void Location.stopLocationUpdatesAsync(WALK_ROUTE_LOCATION_TASK).catch(() => {});
    const startTimeMs = Date.now();
    const entry: ActivityLogEntry = {
      id: newActivityId(),
      kind: 'walk',
      status: 'in_progress',
      startTimeMs,
      endTimeMs: null,
      meters: 0,
      caloriesBurnt: 0,
      caloriesSource: 'none',
      activeDurationSec: 0,
      isPaused: false,
    };
    void (async () => {
      try {
        const next = await mutateActivitiesLog((prev) => {
          const last = prev[prev.length - 1];
          if (last?.status === 'in_progress') {
            return prev;
          }
          return [...prev, entry];
        });
        if (next[next.length - 1]?.id !== entry.id) {
          isActiveRef.current = false;
          return;
        }
        setActivitiesLog(next);
        setRoutePoints([]);
        await saveWalkRoutePoints([]);
        carrySecRef.current = 0;
        segmentStartMsRef.current = startTimeMs;
        pausedRef.current = false;
        stampNextRoutePointAfterResumeRef.current = false;
        setPaused(false);
        setElapsedSec(0);
        setIsActive(true);
        setIsCollapsed(false);
      } catch {
        isActiveRef.current = false;
      }
    })();
  }, []);

  const collapseWalkUi = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expandWalkUi = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const endWalk = useCallback(() => {
    void Location.stopLocationUpdatesAsync(WALK_ROUTE_LOCATION_TASK).catch(() => {});
    const meters = totalRouteLengthMeters(routePoints);
    const activeDurationSec = currentActiveDurationSec(
      carrySecRef.current,
      segmentStartMsRef.current,
      pausedRef.current,
    );
    const { caloriesBurnt, caloriesSource } = caloriesPayloadForPersist(
      bodyMassKgRef.current,
      activeDurationSec,
    );
    const endTimeMs = Date.now();
    void (async () => {
      let next: ActivityLogEntry[];
      try {
        next = await mutateActivitiesLog((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.status !== 'in_progress') {
            return prev;
          }
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              status: 'done',
              endTimeMs,
              meters,
              caloriesBurnt,
              caloriesSource,
              activeDurationSec,
              isPaused: false,
            },
          ];
        });
      } catch {
        return;
      }
      const sealed = next[next.length - 1];
      if (sealed?.status !== 'done' || sealed.endTimeMs !== endTimeMs) {
        return;
      }
      isActiveRef.current = false;
      setActivitiesLog(next);
      setRoutePoints([]);
      await saveWalkRoutePoints([]);
      setIsActive(false);
      setIsCollapsed(false);
      carrySecRef.current = 0;
      segmentStartMsRef.current = Date.now();
      pausedRef.current = false;
      stampNextRoutePointAfterResumeRef.current = false;
      setPaused(false);
      setElapsedSec(0);
      setBodyMassKg(null);
    })();
  }, [routePoints]);

  const togglePause = useCallback(() => {
    if (pausedRef.current) {
      segmentStartMsRef.current = Date.now();
      pausedRef.current = false;
      setPaused(false);
      stampNextRoutePointAfterResumeRef.current = true;
      persistInProgressTimer(carrySecRef.current, segmentStartMsRef.current, false);
    } else {
      carrySecRef.current += Math.floor(
        (Date.now() - segmentStartMsRef.current) / 1000,
      );
      pausedRef.current = true;
      setPaused(true);
      setElapsedSec(carrySecRef.current);
      persistInProgressTimer(carrySecRef.current, segmentStartMsRef.current, true);
    }
  }, [persistInProgressTimer]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !isActiveRef.current) {
        return;
      }
      void loadWalkRoutePoints().then((loaded) => {
        setRoutePoints((curr) => (loaded.length > curr.length ? loaded : curr));
      });
      void (async () => {
        const kg = await fetchBodyMassKgFromHealth();
        if (kg != null) {
          setBodyMassKg(kg);
        }
      })();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (paused) {
      return undefined;
    }
    const tick = () => {
      const sec = currentActiveDurationSec(
        carrySecRef.current,
        segmentStartMsRef.current,
        false,
      );
      setElapsedSec(sec);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isActive, paused]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const id = setInterval(() => {
      persistInProgressTimer(
        carrySecRef.current,
        segmentStartMsRef.current,
        pausedRef.current,
      );
    }, TIMER_PERSIST_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isActive, persistInProgressTimer]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const t = setTimeout(() => {
      const meters = totalRouteLengthMeters(routePoints);
      const activeDurationSec = currentActiveDurationSec(
        carrySecRef.current,
        segmentStartMsRef.current,
        pausedRef.current,
      );
      const { caloriesBurnt, caloriesSource } = caloriesPayloadForPersist(
        bodyMassKgRef.current,
        activeDurationSec,
      );
      void mutateActivitiesLog((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.status !== 'in_progress') {
          return prev;
        }
        if (
          last.meters === meters &&
          last.caloriesBurnt === caloriesBurnt &&
          last.caloriesSource === caloriesSource
        ) {
          return prev;
        }
        return [
          ...prev.slice(0, -1),
          { ...last, meters, caloriesBurnt, caloriesSource },
        ];
      }).then(setActivitiesLog);
    }, ROUTE_METRICS_PERSIST_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [isActive, routePoints, bodyMassKg]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        persistInProgressTimer(
          carrySecRef.current,
          segmentStartMsRef.current,
          pausedRef.current,
        );
      }
    });
    return () => sub.remove();
  }, [isActive, persistInProgressTimer]);

  useEffect(() => {
    if (!isActive || paused) {
      return undefined;
    }
    let cancelled = false;
    let posSub: Location.LocationSubscription | undefined;
    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled || status !== Location.PermissionStatus.GRANTED) {
        return;
      }
      void Location.requestBackgroundPermissionsAsync().catch(() => {});
      try {
        const started = await Location.hasStartedLocationUpdatesAsync(
          WALK_ROUTE_LOCATION_TASK,
        );
        if (!started) {
          await Location.startLocationUpdatesAsync(WALK_ROUTE_LOCATION_TASK, {
            accuracy: Location.Accuracy.High,
            distanceInterval: WALK_ROUTE_MIN_SEGMENT_M,
            timeInterval: 1000,
            activityType: Location.ActivityType.Fitness,
            showsBackgroundLocationIndicator: true,
            pausesUpdatesAutomatically: false,
            foregroundService:
              Platform.OS === 'android'
                ? {
                    notificationTitle: 'Walk in progress',
                    notificationBody: 'Recording your route',
                  }
                : undefined,
          });
        }
      } catch {
        // Background updates are optional if permission or config fails.
      }
      if (cancelled) {
        return;
      }
      try {
        posSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: WALK_ROUTE_MIN_SEGMENT_M,
          },
          (loc) => {
            appendRoutePoint(loc.coords.latitude, loc.coords.longitude, loc.timestamp);
          },
        );
      } catch {
        // Foreground watch is best-effort.
      }
    })();
    return () => {
      cancelled = true;
      posSub?.remove();
      void Location.stopLocationUpdatesAsync(WALK_ROUTE_LOCATION_TASK).catch(() => {});
    };
  }, [isActive, paused, appendRoutePoint]);

  const { showWalkCalories, walkCaloriesDisplayValue } = useMemo(() => {
    const kcal = walkCaloriesFromHealthProfile(bodyMassKg, elapsedSec);
    if (kcal === null) {
      return { showWalkCalories: false, walkCaloriesDisplayValue: '' };
    }
    return {
      showWalkCalories: true,
      walkCaloriesDisplayValue: formatCaloriesValue(kcal),
    };
  }, [bodyMassKg, elapsedSec]);

  const clearAllActivityData = useCallback(async () => {
    await clearPersistedActivityFiles();
    void Location.stopLocationUpdatesAsync(WALK_ROUTE_LOCATION_TASK).catch(() => {});
    isActiveRef.current = false;
    setIsActive(false);
    setIsCollapsed(false);
    setRoutePoints([]);
    setActivitiesLog([]);
    setElapsedSec(0);
    setPaused(false);
    carrySecRef.current = 0;
    segmentStartMsRef.current = Date.now();
    pausedRef.current = false;
    stampNextRoutePointAfterResumeRef.current = false;
    setBodyMassKg(null);
  }, []);

  const value = useMemo(
    () => ({
      isActive,
      isCollapsed,
      activitiesLog,
      routePoints,
      elapsedSec,
      paused,
      togglePause,
      beginWalk,
      collapseWalkUi,
      expandWalkUi,
      endWalk,
      reconcileRouteFromStorage,
      showWalkCalories,
      walkCaloriesDisplayValue,
      clearAllActivityData,
    }),
    [
      isActive,
      isCollapsed,
      activitiesLog,
      routePoints,
      elapsedSec,
      paused,
      togglePause,
      beginWalk,
      collapseWalkUi,
      expandWalkUi,
      endWalk,
      reconcileRouteFromStorage,
      showWalkCalories,
      walkCaloriesDisplayValue,
      clearAllActivityData,
    ],
  );

  return (
    <WalkSessionContext.Provider value={value}>{children}</WalkSessionContext.Provider>
  );
}

export function useWalkSession() {
  const ctx = useContext(WalkSessionContext);
  if (!ctx) {
    throw new Error('useWalkSession must be used within WalkSessionProvider');
  }
  return ctx;
}

/** Extra bottom inset for scroll/content when the minimized walk bar is visible. */
const WALK_COLLAPSED_BAR_BLOCK = 72;

export function useWalkCollapsedBarInset(): number {
  const { isActive, isCollapsed } = useWalkSession();
  const insets = useSafeAreaInsets();
  if (!isActive || !isCollapsed) {
    return 0;
  }
  return WALK_COLLAPSED_BAR_BLOCK + Math.max(insets.bottom, Spacing.two);
}
