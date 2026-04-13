import { AppleMaps } from 'expo-maps';
import Constants, { AppOwnership } from 'expo-constants';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import {
  ACTIVE_WALK_MAP_FOLLOW_DISTANCE_INTERVAL_COLLAPSED_M,
  ACTIVE_WALK_MAP_FOLLOW_DISTANCE_INTERVAL_EXPANDED_M,
  ACTIVE_WALK_MAP_FOLLOW_LOCATION_INTERVAL_COLLAPSED_MS,
  ACTIVE_WALK_MAP_FOLLOW_LOCATION_INTERVAL_EXPANDED_MS,
  ACTIVE_WALK_MAP_INITIAL_CAMERA,
  ACTIVE_WALK_MAP_USER_ZOOM,
  ACTIVE_WALK_ROUTE_POLYLINE_MAX_GAP_MS,
} from '@/constants/active-walk-map';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { metersBetweenLatLng } from '@/lib/geo';
import { splitWalkRoutePointsByTimeGap } from '@/lib/walk-route-polyline';
import type { WalkRoutePoint } from '@/lib/walk-route-storage';

export type ActiveWalkMapHeroProps = {
  mapImageUri: string;
  mapImageA11y: string;
  mapTapA11y: string;
  onMapPress: () => void;
  /**
   * Bottom sheet height as % of the window (same convention as `ACTIVE_WALK_SHEET_SNAP_HEIGHT_PCTS`).
   * Used to bias the camera so your position sits in the visible map above the sheet.
   */
  sheetSnapHeightPct: number;
  /** When true (sheet expanded), the map always follows the user; recenter control is hidden. */
  sheetExpanded: boolean;
  /** Recorded path for the active walk (Apple Maps polyline). */
  routeCoordinates?: WalkRoutePoint[];
};

export type ActiveWalkMapHeroRef = {
  /** Re-enable heading-up follow and center on the latest GPS fix. */
  recenterOnUserLocation: () => Promise<void>;
};

const nativeMapStyle = StyleSheet.absoluteFillObject;

/**
 * If the map center drifts this far from the user's true GPS while follow-mode is on, treat it as a manual pan.
 * Must be well above sheet-offset / GPS noise; do not use biased camera coordinates here — MapKit tracks raw user location.
 */
const NAV_DRIFT_EXIT_M = 220;

/** While browsing (follow off), only reset auto-resume idle if the camera center moves at least this far (meters). */
const BROWSE_IDLE_MIN_CENTER_MOVE_M = 14;

/** While browsing, zoom change larger than this resets idle (MapKit zoom levels). */
const BROWSE_IDLE_MIN_ZOOM_DELTA = 0.45;

const readOnlyMapProperties = {
  /** MapKit user puck + heading wedge (arrow-like); expo-maps markers cannot rotate with course. */
  isMyLocationEnabled: true,
  selectionEnabled: false,
} as const;

const readOnlyAppleMapProperties: AppleMaps.MapProperties = {
  ...readOnlyMapProperties,
  pointsOfInterest: { including: [] },
};

const readOnlyUiSettings = {
  compassEnabled: false,
  myLocationButtonEnabled: false,
  scaleBarEnabled: false,
  togglePitchEnabled: false,
} as const;

/**
 * Shifts the camera target slightly south (NH) so the user dot sits above the sheet without
 * crowding the top. Uses half of the “center in visible band” correction so the marker is not
 * pushed too high.
 */
function offsetCameraForBottomSheet(
  latitude: number,
  longitude: number,
  zoom: number,
  windowHeightPx: number,
  sheetHeightFromBottomPct: number,
): { latitude: number; longitude: number } {
  const visibleFraction = 1 - sheetHeightFromBottomPct / 100;
  const deltaYPx = (windowHeightPx * (visibleFraction - 1)) / 4;
  const metersPerPx =
    (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
  const southMeters = -deltaYPx * metersPerPx;
  const deltaLat = -southMeters / 111_320;
  return { latitude: latitude + deltaLat, longitude };
}

function StaticWalkMapHero({
  mapImageUri,
  mapImageA11y,
  mapTapA11y,
  onMapPress,
  sheetSnapHeightPct: _sheetSnapHeightPct,
  sheetExpanded: _sheetExpanded,
  routeCoordinates: _routeCoordinates,
}: ActiveWalkMapHeroProps) {
  return (
    <View style={styles.section}>
      <Image
        accessible={false}
        source={{ uri: mapImageUri }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(250,249,254,0.35)', 'transparent', 'rgba(250,249,254,0.92)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={mapTapA11y}
        accessibilityHint={mapImageA11y}
        onPress={onMapPress}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

type Cam = { coordinates: { latitude: number; longitude: number }; zoom: number };

function safeAppleSetCamera(
  view: AppleMaps.MapView | null | undefined,
  config: Cam | undefined,
): void {
  if (!view) {
    return;
  }
  void Promise.resolve(view.setCameraPosition(config)).catch(() => {
    // Native view may be unmounted (remount, navigation away, Strict Mode) — avoid noisy rejections.
  });
}

/** Live Apple Maps (dev / release iOS builds only). */
const NativeWalkMap = forwardRef<ActiveWalkMapHeroRef, ActiveWalkMapHeroProps>(
  function NativeWalkMap(
    { mapImageA11y, mapTapA11y, sheetSnapHeightPct, sheetExpanded, routeCoordinates },
    ref,
  ) {
    const { height: windowHeight } = useWindowDimensions();
    const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [navigationFollow, setNavigationFollow] = useState(true);
    const [iosStableCam, setIosStableCam] = useState<Cam | null>(null);

    const appleRef = useRef<AppleMaps.MapView>(null);
    const lastBrowseCameraMoveAtRef = useRef(0);
    const lastBrowseSampleCenterRef = useRef<{ latitude: number; longitude: number } | null>(null);
    const lastBrowseSampleZoomRef = useRef<number | null>(null);
    const resumeHeadingNavigationRef = useRef<() => Promise<void>>(async () => {});
    const latestCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
    const lastZoomRef = useRef(ACTIVE_WALK_MAP_USER_ZOOM);
    /** Keep in sync with useState(true) so first camera events are not misclassified as “browsing”. */
    const navigationFollowRef = useRef(true);
    const iosUserModeAppliedRef = useRef(false);
    const lastAppliedSheetKeyRef = useRef<string | null>(null);
    const sheetSnapHeightPctRef = useRef(sheetSnapHeightPct);
    const sheetExpandedRef = useRef(sheetExpanded);
    /** Bumped on effect cleanup / unmount so pending rAF chains skip native calls after the view is torn down. */
    const cameraApplyEpochRef = useRef(0);

    sheetSnapHeightPctRef.current = sheetSnapHeightPct;
    sheetExpandedRef.current = sheetExpanded;

    const biasedCoords = useCallback(
      (lat: number, lng: number, zoom: number) =>
        offsetCameraForBottomSheet(lat, lng, zoom, windowHeight, sheetSnapHeightPct),
      [windowHeight, sheetSnapHeightPct],
    );

    useEffect(() => {
      navigationFollowRef.current = navigationFollow;
    }, [navigationFollow]);

    useEffect(() => {
      if (!sheetExpanded) {
        return;
      }
      setNavigationFollow(true);
      iosUserModeAppliedRef.current = false;
      lastAppliedSheetKeyRef.current = null;
    }, [sheetExpanded]);

    const exitNavigationMode = useCallback(() => {
      if (sheetExpandedRef.current) {
        return;
      }
      lastBrowseCameraMoveAtRef.current = Date.now();
      lastBrowseSampleCenterRef.current = null;
      lastBrowseSampleZoomRef.current = null;
      setNavigationFollow(false);
      setIosStableCam(null);
      iosUserModeAppliedRef.current = false;
    }, []);

    const resumeHeadingNavigation = useCallback(async () => {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }
      if (status !== Location.PermissionStatus.GRANTED) {
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserCoords(coordinates);
        latestCoordsRef.current = coordinates;
      } catch {
        return;
      }

      lastZoomRef.current = ACTIVE_WALK_MAP_USER_ZOOM;
      iosUserModeAppliedRef.current = false;
      lastAppliedSheetKeyRef.current = null;
      setIosStableCam(null);
      setNavigationFollow(true);
    }, []);

    resumeHeadingNavigationRef.current = resumeHeadingNavigation;

    useImperativeHandle(
      ref,
      () => ({
        recenterOnUserLocation: () => resumeHeadingNavigation(),
      }),
      [resumeHeadingNavigation],
    );

    useEffect(() => {
      let cancelled = false;
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled || status !== Location.PermissionStatus.GRANTED) {
          return;
        }
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (cancelled) {
            return;
          }
          const coordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setUserCoords(coordinates);
          latestCoordsRef.current = coordinates;
          setNavigationFollow(true);
        } catch {
          // Keep fallback camera.
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []);

    useEffect(() => {
      if (!navigationFollow) {
        return undefined;
      }
      let posSub: Location.LocationSubscription | undefined;
      void (async () => {
        try {
          const timeInterval = sheetExpanded
            ? ACTIVE_WALK_MAP_FOLLOW_LOCATION_INTERVAL_EXPANDED_MS
            : ACTIVE_WALK_MAP_FOLLOW_LOCATION_INTERVAL_COLLAPSED_MS;
          const distanceInterval = sheetExpanded
            ? ACTIVE_WALK_MAP_FOLLOW_DISTANCE_INTERVAL_EXPANDED_M
            : ACTIVE_WALK_MAP_FOLLOW_DISTANCE_INTERVAL_COLLAPSED_M;
          posSub = await Location.watchPositionAsync(
            {
              accuracy: sheetExpanded
                ? Location.Accuracy.High
                : Location.Accuracy.Balanced,
              timeInterval,
              distanceInterval,
            },
            (loc) => {
              const c = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              };
              setUserCoords(c);
              latestCoordsRef.current = c;
            },
          );
        } catch {
          // Keep last known position.
        }
      })();
      return () => {
        posSub?.remove();
      };
    }, [navigationFollow, sheetExpanded]);

    useLayoutEffect(() => {
      if (!navigationFollow || !userCoords) {
        return;
      }
      const zoom = lastZoomRef.current;
      const coordinates = biasedCoords(userCoords.latitude, userCoords.longitude, zoom);
      setIosStableCam({ coordinates, zoom });
    }, [navigationFollow, userCoords, sheetSnapHeightPct, windowHeight, biasedCoords]);

    useEffect(() => {
      return () => {
        cameraApplyEpochRef.current++;
      };
    }, []);

    useEffect(() => {
      let outerRaf: number | null = null;
      let innerRaf: number | null = null;

      if (!navigationFollow || !userCoords) {
        iosUserModeAppliedRef.current = false;
        lastAppliedSheetKeyRef.current = null;
        return;
      }
      const sheetKey = `${sheetSnapHeightPct}|${windowHeight}`;
      const needInitial = !iosUserModeAppliedRef.current;
      const sheetChanged = lastAppliedSheetKeyRef.current !== sheetKey;
      if (!needInitial && !sheetChanged) {
        return;
      }
      iosUserModeAppliedRef.current = true;
      lastAppliedSheetKeyRef.current = sheetKey;
      const zoom = lastZoomRef.current;
      const coordinates = biasedCoords(userCoords.latitude, userCoords.longitude, zoom);
      const epoch = ++cameraApplyEpochRef.current;
      outerRaf = requestAnimationFrame(() => {
        outerRaf = null;
        if (epoch !== cameraApplyEpochRef.current) {
          return;
        }
        safeAppleSetCamera(appleRef.current, { coordinates, zoom });
        innerRaf = requestAnimationFrame(() => {
          innerRaf = null;
          if (epoch !== cameraApplyEpochRef.current) {
            return;
          }
          safeAppleSetCamera(appleRef.current, undefined);
        });
      });
      return () => {
        const hadPending = outerRaf != null || innerRaf != null;
        if (outerRaf != null) {
          cancelAnimationFrame(outerRaf);
          outerRaf = null;
        }
        if (innerRaf != null) {
          cancelAnimationFrame(innerRaf);
          innerRaf = null;
        }
        if (hadPending) {
          cameraApplyEpochRef.current++;
          iosUserModeAppliedRef.current = false;
          lastAppliedSheetKeyRef.current = null;
        }
      };
    }, [navigationFollow, userCoords, sheetSnapHeightPct, windowHeight, biasedCoords]);

    const fallbackCam: Cam = userCoords
      ? {
          coordinates: biasedCoords(
            userCoords.latitude,
            userCoords.longitude,
            ACTIVE_WALK_MAP_USER_ZOOM,
          ),
          zoom: ACTIVE_WALK_MAP_USER_ZOOM,
        }
      : {
          coordinates: { ...ACTIVE_WALK_MAP_INITIAL_CAMERA.coordinates },
          zoom: ACTIVE_WALK_MAP_INITIAL_CAMERA.zoom,
        };

    const cameraPosition: Cam =
      navigationFollow && iosStableCam ? iosStableCam : fallbackCam;

    const routePolylines = useMemo(() => {
      if (!routeCoordinates || routeCoordinates.length < 2) {
        return [];
      }
      const segments = splitWalkRoutePointsByTimeGap(
        routeCoordinates,
        ACTIVE_WALK_ROUTE_POLYLINE_MAX_GAP_MS,
      );
      return segments.map((coordinates, index) => ({
        id: `active-walk-route-${index}`,
        coordinates,
        color: StitchCupertinoHome.primaryContainer,
        width: 8,
        contourStyle: AppleMaps.ContourStyle.GEODESIC,
      }));
    }, [routeCoordinates]);

    const onCameraMove = useCallback(
      (e: {
        coordinates?: { latitude?: number; longitude?: number };
        zoom?: number;
      }) => {
        if (typeof e.zoom === 'number' && Number.isFinite(e.zoom)) {
          lastZoomRef.current = e.zoom;
        }
        if (sheetExpandedRef.current) {
          return;
        }
        if (!navigationFollowRef.current) {
          const lat = e.coordinates?.latitude;
          const lng = e.coordinates?.longitude;
          if (lat != null && lng != null) {
            const prev = lastBrowseSampleCenterRef.current;
            const pt = { latitude: lat, longitude: lng };
            if (
              !prev ||
              metersBetweenLatLng(prev, pt) >= BROWSE_IDLE_MIN_CENTER_MOVE_M
            ) {
              lastBrowseSampleCenterRef.current = pt;
              lastBrowseCameraMoveAtRef.current = Date.now();
            }
          }
          if (typeof e.zoom === 'number' && Number.isFinite(e.zoom)) {
            const pz = lastBrowseSampleZoomRef.current;
            lastBrowseSampleZoomRef.current = e.zoom;
            if (pz != null && Math.abs(e.zoom - pz) >= BROWSE_IDLE_MIN_ZOOM_DELTA) {
              lastBrowseCameraMoveAtRef.current = Date.now();
            }
          }
          return;
        }
        const lat = e.coordinates?.latitude;
        const lng = e.coordinates?.longitude;
        if (lat == null || lng == null) {
          return;
        }
        const refC = latestCoordsRef.current;
        if (!refC) {
          return;
        }
        if (
          metersBetweenLatLng({ latitude: lat, longitude: lng }, refC) >
          NAV_DRIFT_EXIT_M
        ) {
          exitNavigationMode();
        }
      },
      [exitNavigationMode],
    );

    return (
      <View
        style={styles.section}
        pointerEvents="box-none"
        accessibilityLabel={mapTapA11y}
        accessibilityHint={mapImageA11y}
        accessible>
        <AppleMaps.View
          ref={appleRef}
          style={nativeMapStyle}
          cameraPosition={cameraPosition}
          properties={readOnlyAppleMapProperties}
          uiSettings={readOnlyUiSettings}
          polylines={routePolylines}
          onCameraMove={onCameraMove}
          colorScheme={AppleMaps.MapColorScheme.AUTOMATIC}
        />
      </View>
    );
  },
);

const shouldUseStaticWalkMap =
  Platform.OS === 'web' ||
  Platform.OS === 'android' ||
  Constants.appOwnership === AppOwnership.Expo;

export const ActiveWalkMapHero = forwardRef<ActiveWalkMapHeroRef, ActiveWalkMapHeroProps>(
  function ActiveWalkMapHero(props, ref) {
    const nativeRef = useRef<ActiveWalkMapHeroRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        recenterOnUserLocation: async () => {
          await nativeRef.current?.recenterOnUserLocation();
        },
      }),
      [],
    );

    if (shouldUseStaticWalkMap) {
      return <StaticWalkMapHero {...props} />;
    }

    return <NativeWalkMap ref={nativeRef} {...props} />;
  },
);

const styles = StyleSheet.create({
  section: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: StitchCupertinoHome.surfaceLow,
  },
});
