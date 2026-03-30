import { Platform } from 'react-native';

/**
 * Parses React Native's `Platform.Version` on iOS (string like `"17.2"` or occasionally a number).
 *
 * @returns Major version on iOS, or `0` when not running on iOS.
 */
export function getIosMajorVersion(): number {
  if (Platform.OS !== 'ios') return 0;
  const v = Platform.Version;
  if (typeof v === 'number') return v;
  const head = String(v).split(/[.-]/)[0] ?? '0';
  const n = Number.parseInt(head, 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * On iOS versions **below** this major, Expo Router `NativeTabs` often fails to show a tab bar
 * background (icons appear to float). Use {@link shouldForceOpaqueNativeTabBarOnIos} to apply
 * `disableTransparentOnScrollEdge` + `blurEffect: 'none'` so `backgroundColor` is visible.
 *
 * Raise this if a newer iOS regresses; lower it if an older release already looks correct.
 */
export const IOS_MAJOR_NATIVE_TAB_BAR_DEFAULT_APPEARANCE = 18;

/**
 * When `true`, pass `disableTransparentOnScrollEdge` and `blurEffect="none"` to `NativeTabs`
 * so the bar gets a solid fill from `backgroundColor`.
 */
export function shouldForceOpaqueNativeTabBarOnIos(): boolean {
  return (
    Platform.OS === 'ios' &&
    getIosMajorVersion() < IOS_MAJOR_NATIVE_TAB_BAR_DEFAULT_APPEARANCE
  );
}
