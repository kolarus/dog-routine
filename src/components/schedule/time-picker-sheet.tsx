import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { Spacing } from '@/constants/theme';

export type TimePickerSheetProps = {
  visible: boolean;
  value: Date;
  title: string;
  accentColor: string;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  onDone: () => void;
  onCancel: () => void;
};

export function TimePickerSheet({
  visible,
  value,
  title,
  accentColor,
  onChange,
  onDone,
  onCancel,
}: TimePickerSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View
          style={[
            styles.container,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.three),
              backgroundColor: StitchCupertinoHome.surfaceLowest,
            },
          ]}>
          <View style={styles.header}>
            <Pressable onPress={onCancel} hitSlop={12} style={styles.headerBtn}>
              <Text
                style={[
                  styles.headerText,
                  { color: StitchCupertinoHome.onSurfaceVariant },
                ]}>
                Cancel
              </Text>
            </Pressable>
            <Text style={[styles.title, { color: StitchCupertinoHome.onSurface }]}>
              {title}
            </Text>
            <Pressable onPress={onDone} hitSlop={12} style={styles.headerBtn}>
              <Text style={[styles.headerText, { color: accentColor }]}>Done</Text>
            </Pressable>
          </View>

          <DateTimePicker
            value={value}
            mode="time"
            display="spinner"
            is24Hour={false}
            locale="en"
            onChange={onChange}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  headerBtn: {
    minWidth: 60,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
