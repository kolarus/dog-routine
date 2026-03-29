# Modules

Modules live in `src/modules/`. Each is a self-contained unit with a barrel `index.ts` that is the only public API. Internal files must not be imported directly.

---

## dog-profile

Profile persistence, age calculation, cross-screen events, and the onboarding form hook.

### Public exports

| Export | Kind | Purpose |
|--------|------|---------|
| `useOnboardingProfile` | hook | Full onboarding form state + `saveProfile()` |
| `loadOnboardingProfile` | async fn | Read profile JSON from disk |
| `saveOnboardingProfile` | async fn | Write profile JSON to disk |
| `deleteOnboardingProfileFile` | async fn | Delete profile JSON |
| `isOnboardingProfileComplete` | fn | `true` if `dogName` is non-empty |
| `hasStoredOnboardingProfile` | async fn | Load + check completeness |
| `clearAllPersistedDogData` | async fn | Delete profile JSON + avatar + notify |
| `formatDogAgeLabelFromDob` | fn | `OnboardingDobState` → `"2 years, 3 months old"` or `null` |
| `formatDogAgeFromBirthDate` | fn | `Date` → age string |
| `parseOnboardingDobToDate` | fn | `OnboardingDobState` → `Date` or `null` |
| `parseOnboardingMonthIndex` | fn | Month string → 0-based index |
| `subscribeProfileDiskChanged` | fn | Register listener, returns unsubscribe |
| `notifyProfileDiskChanged` | fn | Fire all listeners |
| `OnboardingDobState` | type | `{ month, day, year }` (all strings) |
| `OnboardingProfilePersisted` | type | `{ dogName, dob, savedAt }` |

### Internal files

| File | Responsibility |
|------|---------------|
| `storage.ts` | JSON file I/O and parsing with validation |
| `use-onboarding-profile.ts` | React hook — form state, save orchestration |
| `dog-age.ts` | Pure date parsing and age formatting |
| `profile-disk-events.ts` | Pub/sub event emitter |
| `clear-persisted-dog-data.ts` | Orchestrates full data wipe |
| `types.ts` | Shared TypeScript types |

---

## local-photo

Low-level file operations in `documentDirectory` and the image picker hook.

### Public exports

| Export | Kind | Purpose |
|--------|------|---------|
| `useLocalPhotoPicker` | hook | Pick image → temp URI in state, `commitSourceToRelativePath()` to persist |
| `DOG_AVATAR_RELATIVE_PATH` | const | `'dog-avatar.jpg'` |
| `getDogAvatarFileUri` | fn | Returns `file://` URI for the avatar |
| `dogAvatarFileExists` | async fn | Check if avatar is on disk |
| `deleteDogAvatarFile` | async fn | Remove avatar from disk |
| `resolveDocumentFileUri` | fn | Relative path → absolute `file://` URI |
| `documentFileExists` | async fn | Check any relative path |
| `deleteDocumentFile` | async fn | Delete any relative path |
| `replaceDocumentFileFromSource` | async fn | Copy source URI to a relative path (delete-then-copy) |
| `normalizeDocumentRelativePath` | fn | Validate + sanitize relative paths (prevents `..` escapes) |
| `UseLocalPhotoPickerOptions` | type | `{ onPermissionDenied? }` |

### Internal files

| File | Responsibility |
|------|---------------|
| `document-file.ts` | Generic file utilities (path validation, exists, copy, delete) |
| `dog-avatar-file.ts` | Thin wrappers binding `DOG_AVATAR_RELATIVE_PATH` to generic fns |
| `use-local-photo-picker.ts` | React hook — permission request, image picker, commit |
| `types.ts` | Hook options type |
