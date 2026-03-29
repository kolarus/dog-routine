export type OnboardingDobState = {
  month: string;
  day: string;
  year: string;
};

/** Written only when the user taps Save (avatar bytes live in `dog-avatar.jpg` after save). */
export type OnboardingProfilePersisted = {
  dogName: string;
  dob: OnboardingDobState;
  savedAt: number;
};
