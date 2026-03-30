import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="routine/[kind]"
          options={{
            headerShown: true,
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen
          name="routine/history"
          options={{
            headerShown: true,
            headerBackTitle: 'Home',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
