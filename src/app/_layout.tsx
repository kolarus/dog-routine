import '@/modules/walk-route-background';

import { useEffect } from 'react';
import { View } from 'react-native';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { WalkCollapsedBarPortal } from '@/components/walk/walk-collapsed-bar';
import { WalkSessionProvider } from '@/context/walk-session-context';
import { syncAllRoutineScheduleNotifications } from '@/modules/routine-schedule';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    void syncAllRoutineScheduleNotifications({ requestPermissions: false });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WalkSessionProvider>
        <ThemeProvider value={DefaultTheme}>
          <View style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="routine/[kind]" options={{ headerShown: false }} />
              <Stack.Screen name="routine/history" options={{ headerShown: false }} />
              <Stack.Screen
                name="walk-in-progress"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                  gestureEnabled: false,
                }}
              />
            </Stack>
            <WalkCollapsedBarPortal />
          </View>
        </ThemeProvider>
      </WalkSessionProvider>
    </GestureHandlerRootView>
  );
}
