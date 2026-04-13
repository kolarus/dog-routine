import { StyleSheet, View } from 'react-native';

import { ActivityHistoryList } from '@/components/activity-history';
import { AppNavTopBar } from '@/components/navigation';
import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { useWalkSession } from '@/context/walk-session-context';
import { appStrings } from '@/strings';

export default function ActivityHistoryScreen() {
  const title = appStrings.routine.activityHistory.navTitle;
  const { activitiesLog } = useWalkSession();

  return (
    <View style={styles.root}>
      <AppNavTopBar title={title} />
      <View style={styles.body}>
        <ActivityHistoryList activities={activitiesLog} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: StitchCupertinoHome.canvas,
  },
  body: {
    flex: 1,
  },
});
