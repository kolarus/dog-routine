import { Platform } from 'react-native';

const BODY_MASS_QUANTITY_TYPE = 'HKQuantityTypeIdentifierBodyMass' as const;

const MIN_REASONABLE_KG = 22;
const MAX_REASONABLE_KG = 300;

function quantityToKg(quantity: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u === 'kg') {
    return quantity;
  }
  if (u === 'g') {
    return quantity / 1000;
  }
  if (u === 'lb' || u === 'lbs') {
    return quantity * 0.45359237;
  }
  if (u === 'st' || u === 'stone') {
    return quantity * 6.35029;
  }
  return quantity;
}

function isPlausibleBodyMassKg(kg: number): boolean {
  return Number.isFinite(kg) && kg >= MIN_REASONABLE_KG && kg <= MAX_REASONABLE_KG;
}

/**
 * Latest body mass from Apple Health (iOS), in kilograms, after requesting read access.
 * Returns `null` on Android, web, Expo Go, denied permission, missing data, or errors.
 */
export async function fetchBodyMassKgFromHealth(): Promise<number | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }
  try {
    const hk = await import('@kingstinct/react-native-healthkit');
    const available = await hk.isHealthDataAvailableAsync();
    if (!available) {
      return null;
    }
    await hk.requestAuthorization({
      toRead: [BODY_MASS_QUANTITY_TYPE],
    });
    const sample = await hk.getMostRecentQuantitySample(BODY_MASS_QUANTITY_TYPE);
    if (!sample) {
      return null;
    }
    const kg = quantityToKg(sample.quantity, sample.unit);
    if (!isPlausibleBodyMassKg(kg)) {
      return null;
    }
    return kg;
  } catch {
    return null;
  }
}
