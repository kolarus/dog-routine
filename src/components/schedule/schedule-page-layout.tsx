import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export type SchedulePageLayoutProps = {
  title: string;
  subtitle: string;
  sectionHeading: string;
  summary: string | null;
  children: React.ReactNode;
};

export function SchedulePageLayout({
  title,
  subtitle,
  sectionHeading,
  summary,
  children,
}: SchedulePageLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: StitchCupertinoHome.canvas }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, Spacing.four) + Spacing.four },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <Text style={[styles.title, { color: StitchCupertinoHome.onSurface }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: StitchCupertinoHome.onSurfaceVariant }]}>
          {subtitle}
        </Text>

        <View style={styles.sectionTop}>
          <Text
            style={[styles.sectionLabel, { color: StitchCupertinoHome.onSurfaceVariant }]}>
            {sectionHeading}
          </Text>
          {summary !== null && (
            <Text style={[styles.summary, { color: StitchCupertinoHome.onSurface }]}>
              {summary}
            </Text>
          )}
        </View>

        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.two,
  },
  inner: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: Spacing.one,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginTop: -Spacing.one,
  },
  sectionTop: {
    marginTop: Spacing.two,
    gap: Spacing.half,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summary: {
    fontSize: 16,
    fontWeight: '600',
  },
});
