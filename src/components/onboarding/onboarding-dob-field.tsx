import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { OnboardingFocusedColors } from '@/constants/onboarding-focused';
import {
  birthDateToOnboardingDobState,
  defaultBirthPickerDate,
  formatOnboardingDobForDisplay,
  ONBOARDING_DOB_MIN_DATE,
  parseOnboardingDobToDate,
  type OnboardingDobState,
} from '@/modules/dog-profile';
import { appStrings } from '@/strings';

const SEGMENT_RADIUS = 12;
const SEGMENT_PAD_V = 16;
const SEGMENT_PAD_H = 16;
const LABEL_MARGIN = 8;
const CHEVRON_COLOR = 'rgba(81, 69, 50, 0.5)';

const s = appStrings.onboarding;

export type OnboardingDobFieldProps = {
  fieldLabel: string;
  dob: OnboardingDobState;
  onChangeDob: (next: OnboardingDobState) => void;
};

function iosMajorVersion(): number {
  if (Platform.OS !== 'ios') return 0;
  const v = Platform.Version;
  if (typeof v === 'number') return v;
  return Number.parseInt(String(v).split('.')[0] ?? '0', 10) || 0;
}

function clampDateToBounds(d: Date, min: Date, max: Date): Date {
  const t = d.getTime();
  if (t < min.getTime()) return new Date(min);
  if (t > max.getTime()) return new Date(max);
  return d;
}

function isoDateStringLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function tryParseIsoToDob(iso: string): OnboardingDobState | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  if (d < ONBOARDING_DOB_MIN_DATE || d > new Date()) return null;
  return birthDateToOnboardingDobState(d);
}

export function OnboardingDobField({ fieldLabel, dob, onChangeDob }: OnboardingDobFieldProps) {
  const maxDate = useMemo(() => new Date(), []);
  const displayLabel = formatOnboardingDobForDisplay(dob) ?? s.dobTapToChoose;
  const hasValidDob = formatOnboardingDobForDisplay(dob) !== null;

  const [iosOpen, setIosOpen] = useState(false);
  const [androidOpen, setAndroidOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState(() => defaultBirthPickerDate(maxDate));

  const [webModalOpen, setWebModalOpen] = useState(false);
  const [webDraft, setWebDraft] = useState('');

  const openPicker = useCallback(() => {
    const parsed = parseOnboardingDobToDate(dob);
    const base = parsed ?? defaultBirthPickerDate(maxDate);
    setPendingDate(clampDateToBounds(base, ONBOARDING_DOB_MIN_DATE, maxDate));

    if (Platform.OS === 'web') {
      setWebDraft(isoDateStringLocal(parsed ?? defaultBirthPickerDate(maxDate)));
      setWebModalOpen(true);
      return;
    }
    if (Platform.OS === 'ios') {
      setIosOpen(true);
      return;
    }
    setAndroidOpen(true);
  }, [dob, maxDate]);

  useEffect(() => {
    if (!webModalOpen) return;
    const parsed = parseOnboardingDobToDate(dob);
    setWebDraft(isoDateStringLocal(parsed ?? defaultBirthPickerDate(maxDate)));
  }, [webModalOpen, dob, maxDate]);

  const onAndroidChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      setAndroidOpen(false);
      if (event.type === 'set' && date) {
        onChangeDob(birthDateToOnboardingDobState(clampDateToBounds(date, ONBOARDING_DOB_MIN_DATE, maxDate)));
      }
    },
    [maxDate, onChangeDob],
  );

  const iosDisplay = iosMajorVersion() >= 14 ? 'inline' : 'spinner';

  const applyWeb = useCallback(() => {
    const next = tryParseIsoToDob(webDraft);
    if (next) {
      onChangeDob(next);
      setWebModalOpen(false);
    }
  }, [webDraft, onChangeDob]);

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.label,
          { color: OnboardingFocusedColors.onSurfaceVariant, marginBottom: LABEL_MARGIN },
        ]}>
        {fieldLabel}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${fieldLabel}: ${displayLabel}`}
        onPress={openPicker}
        style={({ pressed }) => [
          styles.segment,
          {
            backgroundColor: pressed
              ? OnboardingFocusedColors.surfaceContainerHigh
              : OnboardingFocusedColors.surfaceContainerLow,
            borderRadius: SEGMENT_RADIUS,
            paddingVertical: SEGMENT_PAD_V,
            paddingHorizontal: SEGMENT_PAD_H,
          },
        ]}>
        <Text
          style={[
            styles.segmentText,
            {
              color: hasValidDob
                ? OnboardingFocusedColors.onSurface
                : OnboardingFocusedColors.onSurfaceVariant,
            },
          ]}
          numberOfLines={1}>
          {displayLabel}
        </Text>
        <MaterialIcons name="expand-more" size={22} color={CHEVRON_COLOR} />
      </Pressable>

      {Platform.OS === 'ios' && iosOpen ? (
        <Modal animationType="slide" transparent visible onRequestClose={() => setIosOpen(false)}>
          <View style={styles.modalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setIosOpen(false)} />
            <View style={[styles.modalCard, { backgroundColor: OnboardingFocusedColors.canvas }]}>
              <View style={styles.modalToolbar}>
                <Pressable onPress={() => setIosOpen(false)} hitSlop={12}>
                  <Text style={styles.toolbarBtn}>{appStrings.settings.cancel}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onChangeDob(birthDateToOnboardingDobState(pendingDate));
                    setIosOpen(false);
                  }}
                  hitSlop={12}>
                  <Text style={[styles.toolbarBtn, styles.toolbarBtnPrimary]}>{s.dobDone}</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pendingDate}
                mode="date"
                display={iosDisplay}
                minimumDate={ONBOARDING_DOB_MIN_DATE}
                maximumDate={maxDate}
                onChange={(_, d) => {
                  if (d) setPendingDate(clampDateToBounds(d, ONBOARDING_DOB_MIN_DATE, maxDate));
                }}
                themeVariant="light"
                textColor={OnboardingFocusedColors.onSurface}
              />
            </View>
          </View>
        </Modal>
      ) : null}

      {Platform.OS === 'android' && androidOpen ? (
        <DateTimePicker
          value={pendingDate}
          mode="date"
          display="default"
          minimumDate={ONBOARDING_DOB_MIN_DATE}
          maximumDate={maxDate}
          onChange={onAndroidChange}
        />
      ) : null}

      {Platform.OS === 'web' && webModalOpen ? (
        <Modal animationType="fade" transparent visible onRequestClose={() => setWebModalOpen(false)}>
          <View style={styles.modalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setWebModalOpen(false)} />
            <View style={[styles.webCard, { backgroundColor: OnboardingFocusedColors.canvas }]}>
              <Text style={[styles.webTitle, { color: OnboardingFocusedColors.onSurface }]}>
                {fieldLabel}
              </Text>
              <TextInput
                value={webDraft}
                onChangeText={setWebDraft}
                placeholder={s.dobWebPlaceholder}
                placeholderTextColor={OnboardingFocusedColors.onSurfaceVariant}
                keyboardType="numbers-and-punctuation"
                autoComplete="off"
                style={[
                  styles.webInput,
                  {
                    borderColor: OnboardingFocusedColors.outlineVariant,
                    color: OnboardingFocusedColors.onSurface,
                  },
                ]}
              />
              <View style={styles.webActions}>
                <Pressable onPress={() => setWebModalOpen(false)} style={styles.webBtn}>
                  <Text style={{ color: OnboardingFocusedColors.primary }}>
                    {appStrings.settings.cancel}
                  </Text>
                </Pressable>
                <Pressable onPress={applyWeb} style={styles.webBtn}>
                  <Text style={{ color: OnboardingFocusedColors.primary, fontWeight: '700' }}>
                    {s.dobWebApply}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 4,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  toolbarBtn: {
    fontSize: 17,
    color: OnboardingFocusedColors.primary,
  },
  toolbarBtnPrimary: {
    fontWeight: '600',
  },
  webCard: {
    marginHorizontal: 24,
    marginBottom: 48,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  webTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  webInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  webActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  webBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
