import { Stack } from 'expo-router';

/** Native-stack fade duration (ms); iOS uses this for `animation: 'fade'`. */
const ONBOARDING_FADE_MS = 280;

/**
 * Main app shell (home, dog profile, settings) — stack only, no tab bar.
 */
export default function AppShellLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="onboarding"
        options={{
          animation: 'fade',
          animationDuration: ONBOARDING_FADE_MS,
        }}
      />
    </Stack>
  );
}
