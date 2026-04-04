import { View } from 'react-native';

import { AppNavTopBar } from '@/components/navigation';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { appStrings } from '@/strings';

/**
 * Placeholder for Stitch “Activity History & Stats”. Entry from the home activity-history pill.
 */
export default function ActivityHistoryScreen() {
  const title = appStrings.routine.activityHistory.navTitle;

  return (
    <View style={{ flex: 1, backgroundColor: StitchCupertinoHome.canvas }}>
      <AppNavTopBar title={title} />
    </View>
  );
}
