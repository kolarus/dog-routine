# Data flow

## Persistence model

All user data lives as files in the app's `documentDirectory` (Expo FileSystem). There is no database, no AsyncStorage, no remote backend.

| File | Format | Content |
|------|--------|---------|
| `onboarding-profile.json` | JSON | `{ dogName, dob: { month, day, year }, savedAt }` |
| `dog-avatar.jpg` | JPEG | Single dog profile photo, overwritten on each save |

Both files are managed through the `dog-profile` and `local-photo` modules. Direct `expo-file-system` calls should not appear in screens or components.

## Write path (Save Profile)

```
Onboarding screen
  └─ useOnboardingProfile.saveProfile()
       ├─ commitSourceToRelativePath() → copies picker temp URI to dog-avatar.jpg
       ├─ saveOnboardingProfile()     → writes JSON to onboarding-profile.json
       ├─ updates local React state (avatarDisplayToken, hasSavedProfile)
       └─ notifyProfileDiskChanged()  → fires global event
```

The hook holds form state in `useState`. Refs snapshot `dogName`, `dob`, and `pickUri` so `saveProfile` always reads the latest values regardless of closure timing.

## Read path (Home screen)

```
Home screen
  └─ useHomeDogProfile()
       ├─ useFocusEffect   → refresh() when tab gains focus
       ├─ subscribeProfileDiskChanged → refresh() when notified
       └─ refresh()
            ├─ loadOnboardingProfile()  → reads JSON
            ├─ dogAvatarFileExists()    → checks file
            └─ getDogAvatarFileUri()    → returns file:// URI
```

## Event bus

`profile-disk-events.ts` is a lightweight pub/sub (`Set<Listener>`).

- **Producer:** `useOnboardingProfile` (after save) and `clearAllPersistedDogData` (after clear)
- **Consumers:** `useHomeDogProfile` (refreshes home); `useOnboardingProfile` (re-syncs form + photo when data is cleared or changed elsewhere, e.g. Settings)

After save, the onboarding hook receives its own notification and reloads from disk once; that is redundant but keeps one code path for external clears.

## Image cache busting

`expo-image` aggressively caches by URI. When `dog-avatar.jpg` is overwritten at the same `file://` path, stale pixels would render without intervention. Every `<Image>` that displays the avatar includes a `cacheKey` derived from `savedAt` (the timestamp written into the profile JSON). When the timestamp changes, `expo-image` treats it as a new resource and re-reads from disk.

The token flows as:
- `useOnboardingProfile` → `avatarDisplayToken` (prop name: `imageDisplayToken` on photo slot)
- `useHomeDogProfile` → `profile.savedAt` (prop name: `avatarRevision` on header/hero)
