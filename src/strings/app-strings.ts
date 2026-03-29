/**
 * Single source of user-visible copy. Swap this object (or load by locale) for localization.
 */
export const appStrings = {
  tabs: {
    start: 'Start',
    home: 'Home',
    capuch: 'Capuch',
    settings: 'Settings',
  },

  settings: {
    title: 'Settings',
    clearData: 'Clear all dog data',
    clearDataHint: 'Removes the saved profile and profile photo from this device.',
    clearConfirmTitle: 'Clear all dog data?',
    clearConfirmMessage:
      'This deletes your saved name, date of birth, and profile photo. You can set them up again on Start.',
    cancel: 'Cancel',
    clearedTitle: 'Data cleared',
    clearedMessage: 'Your profile and photo were removed from this device.',
  },

  home: {
    brand: 'DogRoutine',
    /** When no saved profile yet */
    heroTitleFallback: "Your dog's day",
    heroSubtitleFallback: 'Save a profile on Start to show name, age & photo here',
    /** When profile exists but DOB could not be parsed */
    ageUnknown: 'Age — add date of birth on Start',
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
      subtitle: 'Heartworm pill',
    },
  },
} as const;

export type AppStrings = typeof appStrings;
