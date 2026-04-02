import { View } from 'react-native';

import { AppNavTopBar } from '@/components/navigation';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { appStrings } from '@/strings';

/**
 * Placeholder for Stitch “Walking History & Stats”. Entry from the home walking-history pill.
 */
export default function WalkingHistoryScreen() {
  const title = appStrings.routine.walkingHistory.navTitle;

  return (
    <View style={{ flex: 1, backgroundColor: StitchCupertinoHome.canvas }}>
      <AppNavTopBar title={title} />
    </View>
  );
}
