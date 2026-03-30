import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { appStrings } from '@/strings';

/**
 * Placeholder for Stitch “Walking History & Stats”. Entry from the home walking-history pill.
 */
export default function WalkingHistoryScreen() {
  const navigation = useNavigation();
  const title = appStrings.routine.walkingHistory.navTitle;

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  return <View style={{ flex: 1, backgroundColor: StitchCupertinoHome.canvas }} />;
}
