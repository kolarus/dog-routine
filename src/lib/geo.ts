/** Great-circle distance between two WGS84 points (meters). */
export function metersBetweenLatLng(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371e3;
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Sum of geodesic segment lengths along a polyline (meters). */
export function totalRouteLengthMeters(
  points: { latitude: number; longitude: number }[],
): number {
  if (points.length < 2) {
    return 0;
  }
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    sum += metersBetweenLatLng(points[i - 1], points[i]);
  }
  return sum;
}
