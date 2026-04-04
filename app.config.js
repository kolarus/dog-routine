/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
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
