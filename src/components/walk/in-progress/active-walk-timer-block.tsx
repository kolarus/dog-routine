import { StyleSheet, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

export type ActiveWalkTimerBlockProps = {
  elapsedLabel: string;
  caption: string;
};

export function ActiveWalkTimerBlock({ elapsedLabel, caption }: ActiveWalkTimerBlockProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.digits}>{elapsedLabel}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
  },
  digits: {
    fontSize: 58,
    fontWeight: '800',
    letterSpacing: -2.5,
    fontVariant: ['tabular-nums'],
    color: StitchCupertinoHome.onSurface,
  },
  caption: {
    marginTop: Spacing.half + 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: StitchCupertinoHome.onSurfaceVariant,
    textTransform: 'uppercase',
  },
});
