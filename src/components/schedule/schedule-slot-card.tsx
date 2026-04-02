import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

const CARD_BORDER = 'rgba(132, 117, 96, 0.12)';
const DELETE_BG = '#E53935';

export type ScheduleSlotCardProps = {
  time: string;
  period: string;
  accentColor: string;
  highlighted: boolean;
  editA11yLabel: string;
  swipeableRef: React.RefObject<SwipeableMethods | null>;
  onEdit: () => void;
  onRemove: () => void;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
};

export function ScheduleSlotCard({
  time,
  period,
  accentColor,
  highlighted,
  editA11yLabel,
  swipeableRef,
  onEdit,
  onRemove,
  onSwipeOpen,
  onSwipeClose,
}: ScheduleSlotCardProps) {
  return (
    <Swipeable
      renderRightActions={() => (
        <Pressable onPress={onRemove} style={styles.deleteAction}>
          <MaterialIcons name="delete-outline" size={22} color="#fff" />
          <Text style={styles.deleteLabel}>Delete</Text>
        </Pressable>
      )}
      rightThreshold={40}
      friction={2}
      overshootRight={false}
      onSwipeableWillOpen={onSwipeOpen}
      onSwipeableClose={onSwipeClose}
      ref={swipeableRef}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={editA11yLabel}
        onPress={onEdit}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: StitchCupertinoHome.surfaceLowest,
            borderColor: highlighted ? accentColor : CARD_BORDER,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <View style={styles.timeRow}>
          <Text style={[styles.time, { color: StitchCupertinoHome.onSurface }]}>{time}</Text>
          <Text style={[styles.period, { color: StitchCupertinoHome.onSurfaceVariant }]}>
            {period}
          </Text>
        </View>
        <MaterialIcons name="edit-calendar" size={22} color={accentColor} />
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: StitchCupertinoHome.cardRadius,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flex: 1,
  },
  time: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  period: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteAction: {
    backgroundColor: DELETE_BG,
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    borderRadius: StitchCupertinoHome.cardRadius,
    marginLeft: Spacing.one,
  },
  deleteLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
