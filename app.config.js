/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'DogRoutine uses your location for the walk map and to record your route while a walk is active.',
        locationAlwaysAndWhenInUsePermission:
          'DogRoutine can record your walk route in the background so the path stays accurate when the screen is off or you switch apps.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],
    [
      'expo-maps',
      {
        requestLocationPermission: true,
        locationPermission:
          'Allow DogRoutine to show your position on the walk map while a walk is active.',
      },
    ],
  ],
});
