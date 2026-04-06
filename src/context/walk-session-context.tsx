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
import { metersBetweenLatLng } from '@/lib/geo';
import {
  appendWalkRouteSamples,
  loadWalkRoutePoints,
  saveWalkRoutePoints,
  type WalkRoutePoint,
} from '@/lib/walk-route-storage';
import { WALK_ROUTE_LOCATION_TASK } from '@/modules/walk-route-background';

/** Skip GPS samples closer than this to the last stored point (meters). */
const WALK_ROUTE_MIN_SEGMENT_M = 4;

type WalkSessionContextValue = {
  isActive: boolean;
  isCollapsed: boolean;
  /** Lat/lng samples for the current walk, kept across navigation while the walk is active. */
  routePoints: WalkRoutePoint[];
  beginWalk: () => void;
  collapseWalkUi: () => void;
  expandWalkUi: () => void;
  endWalk: () => void;
  /** Merge disk route into state when reopening the walk screen (e.g. after fast refresh). */
  reconcileRouteFromStorage: () => Promise<void>;
};

const WalkSessionContext = createContext<WalkSessionContextValue | null>(null);

export function WalkSessionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [routePoints, setRoutePoints] = useState<WalkRoutePoint[]>([]);
  const isActiveRef = useRef(false);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const appendRoutePoint = useCallback((latitude: number, longitude: number) => {
    const pt: WalkRoutePoint = { latitude, longitude };
    setRoutePoints((prev) => {
      const last = prev[prev.length - 1];
      if (last && metersBetweenLatLng(last, pt) < WALK_ROUTE_MIN_SEGMENT_M) {
        return prev;
      }
      return [...prev, pt];
    });
    void appendWalkRouteSamples([pt], WALK_ROUTE_MIN_SEGMENT_M);
  }, []);

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
    void Location.stopLocationUpdatesAsync(WALK_ROUTE_LOCATION_TASK).catch(() => {});
    setRoutePoints([]);
    void saveWalkRoutePoints([]);
    setIsActive(true);
    setIsCollapsed(false);
  }, []);

  const collapseWalkUi = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expandWalkUi = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const endWalk = useCallback(() => {
    void Location.stopLocationUpdatesAsync(WALK_ROUTE_LOCATION_TASK).catch(() => {});
    setRoutePoints([]);
    void saveWalkRoutePoints([]);
    setIsActive(false);
    setIsCollapsed(false);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !isActiveRef.current) {
        return;
      }
      void loadWalkRoutePoints().then((loaded) => {
        setRoutePoints((curr) => (loaded.length > curr.length ? loaded : curr));
      });
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!isActive) {
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
            appendRoutePoint(loc.coords.latitude, loc.coords.longitude);
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
  }, [isActive, appendRoutePoint]);

  const value = useMemo(
    () => ({
      isActive,
      isCollapsed,
      routePoints,
      beginWalk,
      collapseWalkUi,
      expandWalkUi,
      endWalk,
      reconcileRouteFromStorage,
    }),
    [
      isActive,
      isCollapsed,
      routePoints,
      beginWalk,
      collapseWalkUi,
      expandWalkUi,
      endWalk,
      reconcileRouteFromStorage,
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
