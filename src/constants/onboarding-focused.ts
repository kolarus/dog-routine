import { Platform } from 'react-native';

/**
 * Design tokens from Stitch screen "Onboarding - Focused" (PawRoutine - Create Profile).
 */

export const OnboardingFocusedColors = {
  canvas: '#faf9fe',
  onSurface: '#1a1b1f',
  onSurfaceVariant: '#514532',
  surfaceContainerHigh: '#e9e7ed',
  surfaceContainerLow: '#f4f3f8',
  outlineVariant: '#d6c4ac',
  primary: '#7e5700',
  primaryContainer: '#ffb300',
  onPrimaryContainer: '#6b4900',
  onPrimary: '#ffffff',
  ctaShadow: 'rgba(126, 87, 0, 0.15)',
} as const;

/**
 * Layout defaults tuned for iPhone SE → Pro Max: max readable width, scalable padding.
 */
export const OnboardingFocusedLayout = {
  /** Tailwind max-w-md */
  maxCanvasWidth: 448,
  /** Base horizontal padding (px-8); can be overridden or scaled via props. */
  horizontalPadding: 32,
  /** Minimum horizontal padding on very narrow devices */
  horizontalPaddingMin: 20,
  /** Scale padding as fraction of screen width when `scalePaddingToWidth` is true */
  horizontalPaddingWidthFraction: 0.06,
  contentTopPadding: 48,
  /** Space below scroll content so it clears the floating CTA */
  scrollBottomGutter: 120,
  headerBottomMargin: 40,
  photoSectionBottomMargin: 48,
  fieldStackGap: 32,
  photoDiameter: 128,
  editBadgePadding: 8,
  ctaVerticalPadding: 20,
  ctaBorderRadius: 16,
  ctaFontSize: 18,
  /** KeyboardAvoidingView offset on iOS (tab bar / typical chrome). */
  keyboardVerticalOffset: Platform.OS === 'ios' ? 64 : 0,
} as const;
