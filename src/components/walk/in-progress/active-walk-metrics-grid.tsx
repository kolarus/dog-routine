import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

export type ActiveWalkMetricsGridProps = {
  distanceValue: string;
  distanceUnit: string;
  stepsValue: string;
  stepsUnit: string;
  caloriesValue: string;
  caloriesUnit: string;
};

export function ActiveWalkMetricsGrid({
  distanceValue,
  distanceUnit,
  stepsValue,
  stepsUnit,
  caloriesValue,
  caloriesUnit,
}: ActiveWalkMetricsGridProps) {
  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.value}>{distanceValue}</Text>
          <Text style={styles.unit}>{distanceUnit}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.value}>{stepsValue}</Text>
          <Text style={styles.unit}>{stepsUnit}</Text>
        </View>
      </View>
      <View style={styles.caloriesPill}>
        <MaterialIcons
          name="local-fire-department"
          size={17}
          color={StitchCupertinoHome.primaryContainer}
        />
        <Text style={styles.caloriesValue}>{caloriesValue}</Text>
        <Text style={styles.caloriesUnit}>{caloriesUnit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: Spacing.three + 4,
    gap: Spacing.two + 4,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two + 4,
  },
  cell: {
    flex: 1,
    backgroundColor: StitchCupertinoHome.surfaceLow,
    borderRadius: StitchCupertinoHome.cardRadius,
    paddingVertical: Spacing.three + 4,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 92,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: StitchCupertinoHome.onSurface,
  },
  unit: {
    marginTop: Spacing.one + 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: StitchCupertinoHome.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  caloriesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.one + 2,
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three + 2,
    borderRadius: 999,
    backgroundColor: 'rgba(227,226,231,0.45)',
  },
  caloriesValue: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    color: StitchCupertinoHome.onSurface,
  },
  caloriesUnit: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: StitchCupertinoHome.onSurfaceVariant,
    textTransform: 'uppercase',
  },
});
