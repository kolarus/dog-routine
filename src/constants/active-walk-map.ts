/**
 * Map art from Stitch “Active Walk - KM & Steps” (web / fallback).
 * Native uses Apple Maps (iOS) or Google Maps (Android) via expo-maps.
 */
export const ACTIVE_WALK_MAP_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC7c5Gx8-EMLcXURH27lXNy07XQ6FR0HsFSdAuzLZisrdYMfYK1q1_Tj8dVcVgB8XIdOG-8EK5a4HJj2SEetmB3-zxQvMM6Z-SXKA-vjwy-vV4FFHzxiggYxkf9USbUe-Mq75FE4Prl4__x6t93kpSxpfQ1cn7vo3an7_ZuBSLggHlEcWqBNY175jUqfhuEu73mCSyWT90rNn9pXK4Z6uU-ZKo0v8cOhxUukL4enp18V8fr5xmxGiOGFeLveKzKAa5PMOw376t_iNgq';

/** Fallback region when location permission is denied or unavailable. */
export const ACTIVE_WALK_MAP_INITIAL_CAMERA = {
  coordinates: { latitude: 50.4501, longitude: 30.5234 },
  zoom: 14,
} as const;

/** Zoom when framing the user’s current position. */
export const ACTIVE_WALK_MAP_USER_ZOOM = 16;

/**
 * When two stored samples are farther apart in time than this, render them as separate
 * polylines (no line across the gap — e.g. after long background).
 */
export const ACTIVE_WALK_ROUTE_POLYLINE_MAX_GAP_MS = 90_000;

/** Location stream while the walk sheet is expanded (smoother map follow). */
export const ACTIVE_WALK_MAP_FOLLOW_LOCATION_INTERVAL_EXPANDED_MS = 400;
export const ACTIVE_WALK_MAP_FOLLOW_DISTANCE_INTERVAL_EXPANDED_M = 2;

/** Location stream while the sheet is collapsed (lighter). */
export const ACTIVE_WALK_MAP_FOLLOW_LOCATION_INTERVAL_COLLAPSED_MS = 900;
export const ACTIVE_WALK_MAP_FOLLOW_DISTANCE_INTERVAL_COLLAPSED_M = 4;
