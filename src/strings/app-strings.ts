/**
 * Single source of user-visible copy. Swap this object (or load by locale) for localization.
 */
export const appStrings = {
  tabs: {
    start: 'Dog Profile',
    home: 'Home',
    settings: 'Settings',
  },

  settings: {
    title: 'Settings',
    clearData: 'Clear all dog data',
    clearDataHint: 'Removes the saved profile and profile photo from this device.',
    clearConfirmTitle: 'Clear all dog data?',
    clearConfirmMessage:
      'This deletes your saved name, date of birth, and profile photo. You can set them up again on Dog Profile.',
    cancel: 'Cancel',
    clearedTitle: 'Data cleared',
    clearedMessage: 'Your profile and photo were removed from this device.',
  },

  home: {
    brand: 'DogRoutine',
    /** When no saved profile yet */
    heroTitleFallback: "Your dog's day",
    heroSubtitleFallback: 'Save a profile on Dog Profile to show name, age & photo here',
    /** When profile exists but DOB could not be parsed */
    ageUnknown: 'Age — add date of birth on Dog Profile',
  },

  onboarding: {
    headerTitle: "Create your dog's profile",
    headerSubtitle:
      "Let's start the routine for your best friend.",
    addPhoto: 'Add Photo',
    /** Accessibility when a photo is already selected */
    changePhoto: 'Change photo',
    dogNameLabel: "Dog's Name",
    dogNamePlaceholder: 'e.g. Luna',
    dobLabel: 'Date of Birth',
    /** Initial DOB row placeholders */
    dobInitialMonth: 'Month',
    dobInitialDay: '01',
    dobInitialYear: '2023',
    dobTapToChoose: 'Tap to choose date of birth',
    dobDone: 'Done',
    /** Web-only: ISO date hint */
    dobWebPlaceholder: 'YYYY-MM-DD',
    dobWebApply: 'Apply',
    saveProfile: 'Save Profile',
  },

  routine: {
    dueBadge: 'DUE',
    walkingHistory: {
      label: 'Walking history',
      subtitle: 'View logs and stats',
      navTitle: 'Walking history',
    },
    walkSchedule: {
      navTitle: 'Walk schedule',
      /** Shown under the stack header; paired with {@link appStrings.home.brand} in UI */
      brandKicker: 'Schedule walk',
      dailyTitle: 'Daily routine',
      dailySubtitle: 'Manage multiple walks for your dog.',
      timesHeading: 'Walk times',
      timesSummary: '3 walks daily',
      addAnother: 'Add another walk',
      remindersTitle: 'Reminders',
      remindersSubtitle: 'Notify me 15 minutes before',
      saveSchedule: 'Save schedule',
      savedTitle: 'Saved',
      savedMessage: 'Your walk schedule was updated.',
      editSlotA11y: 'Edit walk time',
      addSlotA11y: 'Add another walk',
      saveScheduleA11y: 'Save walk schedule',
      /** Demo rows aligned with Stitch “Refined Walk Schedule” */
      demoSlots: [
        { time: '7:30 AM', days: 'Mon, Tue, Wed, Thu, Fri' },
        { time: '12:30 PM', days: 'Daily' },
        { time: '6:00 PM', days: 'Mon, Wed, Fri' },
      ],
    },
    feedSchedule: {
      navTitle: 'Feeding schedule',
      brandKicker: 'Schedule meals',
      dailyTitle: 'Daily routine',
      dailySubtitle: 'Manage meal times for your dog.',
      timesHeading: 'Meal times',
      timesSummary: '2 meals daily',
      addAnother: 'Add another meal',
      remindersTitle: 'Reminders',
      remindersSubtitle: 'Notify me 15 minutes before each meal',
      saveSchedule: 'Save schedule',
      savedTitle: 'Saved',
      savedMessage: 'Your feeding schedule was updated.',
      editSlotA11y: 'Edit meal time',
      addSlotA11y: 'Add another meal',
      saveScheduleA11y: 'Save feeding schedule',
      demoSlots: [
        { time: '7:00 AM', days: 'Daily' },
        { time: '6:00 PM', days: 'Daily' },
      ],
    },
    walking: {
      label: 'Walking',
      subtitle: 'Next: 4:30 PM',
    },
    feeding: {
      label: 'Feeding',
      subtitle: 'Done at 8:00 AM',
    },
    medicine: {
      label: 'Medicine',
      subtitle: 'Coming in a future update',
    },
  },
} as const;

export type AppStrings = typeof appStrings;
