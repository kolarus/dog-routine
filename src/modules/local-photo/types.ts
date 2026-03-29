export type UseLocalPhotoPickerOptions = {
  /** Called when the user denies photo library access (iOS/Android). */
  onPermissionDenied?: () => void;
};
