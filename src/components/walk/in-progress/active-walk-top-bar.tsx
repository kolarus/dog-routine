import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassView } from 'expo-glass-effect';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

export type ActiveWalkTopBarProps = {
  paddingTop: number;
  useGlass: boolean;
  title: string;
  collapseA11y: string;
  onCollapse: () => void;
};

export function ActiveWalkTopBar({
  paddingTop,
  useGlass,
  title,
  collapseA11y,
  onCollapse,
}: ActiveWalkTopBarProps) {
  const row = (
    <View style={styles.headerRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={collapseA11y}
        hitSlop={12}
        onPress={onCollapse}
        style={({ pressed }) => [styles.iconSlot, pressed && styles.iconPressed]}>
        <MaterialIcons name="expand-more" size={22} color={StitchCupertinoHome.onSurface} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.iconSlot} />
    </View>
  );

  return (
    <View style={[styles.wrap, { paddingTop }]} pointerEvents="box-none">
      {useGlass ? (
        <GlassView
          glassEffectStyle="regular"
          tintColor="rgba(255,255,255,0.72)"
          style={styles.glass}>
          {row}
        </GlassView>
      ) : (
        <View style={styles.fallback}>{row}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: Spacing.three,
    zIndex: 200,
  },
  glass: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  fallback: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.two + 2,
  },
  iconSlot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: {
    opacity: 0.75,
    backgroundColor: StitchCupertinoHome.surfaceLow,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: StitchCupertinoHome.onSurface,
  },
});
