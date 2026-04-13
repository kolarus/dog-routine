import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useWalkCollapsedBarInset } from '@/context/walk-session-context';
import {
  formatActivityDistanceMeters,
  formatActivityStartDate,
  formatCaloriesValue,
  formatSessionDurationMs,
} from '@/lib/format-activity';
import type { ActivityLogEntry } from '@/modules/activities-log';
import { appStrings } from '@/strings';

const s = appStrings.routine.activityHistory;

export type ActivityHistoryListProps = {
  activities: ActivityLogEntry[];
};

function sortedActivities(activities: ActivityLogEntry[]): ActivityLogEntry[] {
  return [...activities].sort((a, b) => b.startTimeMs - a.startTimeMs);
}

export function ActivityHistoryList({ activities }: ActivityHistoryListProps) {
  const router = useRouter();
  const walkCollapsedInset = useWalkCollapsedBarInset();
  const data = sortedActivities(activities);

  if (data.length === 0) {
    return (
      <View style={[styles.emptyWrap, styles.emptyOuter]}>
        <Text style={[styles.emptyTitle, { color: StitchCupertinoHome.onSurface }]}>
          {s.emptyTitle}
        </Text>
        <Text style={[styles.emptySubtitle, { color: StitchCupertinoHome.onSurfaceVariant }]}>
          {s.emptySubtitle}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.listContent,
        { paddingBottom: Spacing.four * 2 + walkCollapsedInset },
      ]}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ActivityHistoryRow
          entry={item}
          onPressInProgress={
            item.status === 'in_progress'
              ? () => {
                  router.push('/walk-in-progress');
                }
              : undefined
          }
        />
      )}
    />
  );
}

function ActivityHistoryRow({
  entry,
  onPressInProgress,
}: {
  entry: ActivityLogEntry;
  onPressInProgress?: () => void;
}) {
  const isLive = entry.status === 'in_progress';
  const distance = formatActivityDistanceMeters(entry.meters);
  const showCalories = entry.caloriesSource === 'health';
  const started = formatActivityStartDate(entry.startTimeMs);

  let detailLine: string;
  if (isLive) {
    if (showCalories) {
      const kcal = formatCaloriesValue(entry.caloriesBurnt);
      detailLine = s.metricsInProgress
        .replace('{{distance}}', distance)
        .replace('{{kcal}}', kcal);
    } else {
      detailLine = s.metricsInProgressNoCal.replace('{{distance}}', distance);
    }
  } else if (entry.endTimeMs !== null) {
    const sessionMs = entry.endTimeMs - entry.startTimeMs;
    const duration = formatSessionDurationMs(sessionMs);
    if (showCalories) {
      const kcal = formatCaloriesValue(entry.caloriesBurnt);
      detailLine = s.metricsCompleted
        .replace('{{distance}}', distance)
        .replace('{{kcal}}', kcal)
        .replace('{{duration}}', duration);
    } else {
      detailLine = s.metricsCompletedNoCal
        .replace('{{distance}}', distance)
        .replace('{{duration}}', duration);
    }
  } else {
    detailLine = distance;
  }

  const inner = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: StitchCupertinoHome.surfaceLowest,
          borderColor: StitchCupertinoHome.outlineVariant,
        },
      ]}>
      <View style={styles.cardTop}>
        <Text style={[styles.kindLabel, { color: StitchCupertinoHome.onSurface }]}>
          {s.kindWalk}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isLive
                ? StitchCupertinoHome.walkIconWell
                : 'rgba(81, 69, 50, 0.08)',
            },
          ]}>
          <Text
            style={[
              styles.badgeText,
              { color: isLive ? StitchCupertinoHome.primary : StitchCupertinoHome.onSurfaceVariant },
            ]}>
            {isLive ? s.statusInProgress : s.statusCompleted}
          </Text>
        </View>
      </View>
      <Text style={[styles.dateLine, { color: StitchCupertinoHome.onSurfaceVariant }]}>
        {started}
      </Text>
      <Text style={[styles.detailLine, { color: StitchCupertinoHome.onSurface }]}>{detailLine}</Text>
    </View>
  );

  if (onPressInProgress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={s.openInProgressA11y}
        onPress={onPressInProgress}
        style={({ pressed }) => [styles.rowPress, pressed && styles.rowPressed]}>
        {inner}
      </Pressable>
    );
  }

  return <View style={styles.rowPress}>{inner}</View>;
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  rowPress: {
    borderRadius: StitchCupertinoHome.cardRadius,
  },
  rowPressed: {
    opacity: 0.92,
  },
  card: {
    borderRadius: StitchCupertinoHome.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  kindLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dateLine: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailLine: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: Spacing.half,
  },
  emptyOuter: {
    flex: 1,
  },
  emptyWrap: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.five * 2,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
});
