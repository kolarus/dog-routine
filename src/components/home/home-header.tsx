import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

export type HomeHeaderProps = {
  brand: string;
  titleColor: string;
  headerBackgroundColor: string;
};

export function HomeHeader({ brand, titleColor, headerBackgroundColor }: HomeHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
      <View style={styles.headerLeft}>
        <MaterialIcons name="pets" size={26} color={StitchCupertinoHome.primary} />
        <Text style={[styles.brand, { color: titleColor }]}>{brand}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.three,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
