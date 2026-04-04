/**
 * Single source of user-visible copy. Swap this object (or load by locale) for localization.
 */
export const appStrings = {
  settings: {
    title: 'Settings',
    /** Stack back affordance (same wording as routine screens’ `headerBackTitle`) */
    backToHome: 'Home',
    backToHomeA11y: 'Back to home',
    clearData: 'Clear all dog data',
    clearDataHint:
      'Removes the saved profile, profile photo, routines, and home profile choices (including skip) from this device.',
    clearConfirmTitle: 'Clear all dog data?',
    clearConfirmMessage:
      'This deletes your saved name, date of birth, profile photo, schedules, and any “skip profile” choice. You can set them up again from Home or Dog Profile.',
    cancel: 'Cancel',
    clearedTitle: 'Data cleared',
    clearedMessage: 'Your profile, photo, schedules, and profile setup choices were removed from this device.',
  },

  home: {
    brand: 'DogRoutine',
    /** Stitch “Home - No Dog Profile with Skip” */
    profileSetupBanner: {
      title: "Welcome! Let's get to know your pup",
      body:
        'Create a profile for your dog to track walks, feeding times, and health routines in one place.',
      /** Matches Stitch hero `data-alt` */
      heroImageA11y:
        'Illustration of a dog silhouette in a sunlit room with soft shadows and warm tones',
      addProfile: 'Add Dog Profile',
      addProfileA11y: 'Add dog profile',
      skipForNow: 'Skip for now',
      skipForNowA11y: 'Skip setting up dog profile for now',
    },
    /** Floating action button on home (walk schedule / start walk) */
    startWalkFabA11y: 'Start walk',
    /** Home hero → Dog Profile (onboarding) tab */
    heroNavigateA11y: 'Open Dog Profile',
    /** When no saved profile yet */
    heroTitleFallback: "Your dog's day",
    heroSubtitleFallback: 'Save a profile on Dog Profile to show name, age & photo here',
    /** When profile exists but DOB could not be parsed */
    ageUnknown: 'Age — add date of birth on Dog Profile',
    /** Home bento pill → Settings tab */
    settingsPill: {
      label: 'Settings',
      subtitle: 'Manage profile & app',
    },
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
    walkInProgress: {
      title: 'Activity in progress',
      collapseA11y: 'Minimize activity',
      collapsedBarA11y: 'Show activity in progress',
      mapImageA11y: 'Illustrative map of your activity route',
      timeElapsed: 'Time elapsed',
      km: 'KM',
      steps: 'Steps',
      calories: 'Calories',
      distancePlaceholder: '0.00',
      stepsPlaceholder: '0',
      caloriesPlaceholder: '0',
      finishActivityCaption: 'Finish activity',
      finishActivityA11y: 'Finish activity',
      finishConfirmTitle: 'Finish activity?',
      finishConfirmMessage: 'This will end your current activity.',
      finishConfirmAction: 'Finish',
      finishConfirmCancel: 'Cancel',
      pauseA11y: 'Pause activity',
      resumeA11y: 'Resume activity',
      photoA11y: 'Add activity photo',
      mapShowMoreA11y: 'Show more map',
      mapShowDetailsA11y: 'Show activity details',
      recenterMapA11y: 'Follow your direction on the map (heading up)',
    },
    activityHistory: {
      label: 'Activity history',
      subtitle: 'View logs and stats',
      navTitle: 'Activity history',
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
      /** Shown on home while walk schedule is still loading from disk */
      subtitleLoading: 'Walk schedule',
      /** Shown when schedule is loaded but has no walk times */
      subtitleNoSlots: 'Tap to add walk times',
    },
    feeding: {
      label: 'Feeding',
      /** Shown on home while feeding schedule is still loading from disk */
      subtitleLoading: 'Meal schedule',
      /** Shown when schedule is loaded but has no meal times */
      subtitleNoSlots: 'Tap to add meal times',
    },
    medicine: {
      label: 'Medicine',
      subtitle: 'Coming in a future update',
    },
  },
} as const;

export type AppStrings = typeof appStrings;
