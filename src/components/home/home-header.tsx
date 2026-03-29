import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

export type HomeHeaderProps = {
  brand: string;
  titleColor: string;
  headerBackgroundColor: string;
  /** Remote or file URI; falls back to `placeholder` when null */
  avatarUri: string | null;
  /** `require(...)` asset when no saved photo */
  placeholder: number;
  /** Bust cache when profile is re-saved */
  avatarRevision?: number;
};

export function HomeHeader({
  brand,
  titleColor,
  headerBackgroundColor,
  avatarUri,
  placeholder,
  avatarRevision = 0,
}: HomeHeaderProps) {
  const source = avatarUri
    ? { uri: avatarUri, cacheKey: `home-header-avatar-${avatarRevision}` }
    : placeholder;

  return (
    <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
      <View style={styles.headerLeft}>
        <MaterialIcons name="pets" size={26} color={StitchCupertinoHome.primary} />
        <Text style={[styles.brand, { color: titleColor }]}>{brand}</Text>
      </View>
      <View style={styles.avatarRing}>
        <Image source={source} style={styles.avatar} contentFit="cover" transition={120} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 179, 0, 0.25)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
