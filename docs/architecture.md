# Architecture

## Stack

| Layer | Tech |
|-------|------|
| Framework | Expo SDK 55 (canary), React Native 0.83, React 19 |
| Navigation | Expo Router with `NativeTabs` (unstable API) |
| Language | TypeScript 5.9, strict mode |
| Styling | `StyleSheet.create` + design-token constants |
| Local storage | `expo-file-system/legacy` (JSON + images in `documentDirectory`) |
| Image display | `expo-image` with explicit `cacheKey` for cache busting |
| Image picking | `expo-image-picker` |

Path alias: `@/*` → `./src/*`, `@/assets/*` → `./assets/*` (configured in `tsconfig.json`).

## Source layout

```
src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout — wraps AppTabs in ThemeProvider
│   ├── index.tsx           # Home tab
│   ├── onboarding.tsx      # "Start" tab — create/edit dog profile
│   ├── settings.tsx        # Settings tab — clear data
│   └── capuch.tsx          # Static image tab (placeholder)
│
├── components/
│   ├── app-tabs.tsx        # NativeTabs configuration (tab order, icons, labels)
│   ├── home/               # Home screen primitives
│   │   ├── home-header.tsx
│   │   └── home-dog-hero.tsx
│   ├── onboarding/         # Onboarding screen primitives
│   │   ├── onboarding-focused-layout.tsx
│   │   ├── onboarding-momentum-header.tsx
│   │   ├── onboarding-photo-slot.tsx
│   │   ├── onboarding-underline-field.tsx
│   │   ├── onboarding-dob-row.tsx
│   │   └── onboarding-primary-cta.tsx
│   └── routine/            # Routine cards (bento grid on home)
│       ├── routine-pill.tsx
│       ├── home-bento-section.tsx
│       ├── definitions.ts
│       └── types.ts
│
├── modules/                # Self-contained logic units with barrel exports
│   ├── dog-profile/        # Profile persistence, age calculation, events
│   └── local-photo/        # File I/O, avatar file management, image picker hook
│
├── hooks/                  # Shared React hooks
│   ├── use-home-dog-profile.ts
│   ├── use-theme.ts
│   └── use-color-scheme.ts (+ .web.ts)
│
├── constants/              # Design tokens and layout values
│   ├── theme.ts            # Colors, Fonts, Spacing, BottomTabInset
│   ├── stitch-cupertino-home.ts
│   └── onboarding-focused.ts
│
└── strings/                # All user-visible copy (single locale for now)
    └── app-strings.ts
```

## Key conventions

- **Barrel files only.** Every module and component folder has an `index.ts`. Consumers import from the barrel, never from internal files.
- **Components expose content/behavior props only.** No `style` overrides, no `fontSize` props. Visual design is fixed inside the component.
- **Modules own logic; screens compose.** Screens import hooks and components, wire them together, and handle navigation. They don't contain business logic or storage calls.
- **Strings are centralized.** All user-visible text lives in `src/strings/app-strings.ts`. Components reference `appStrings.*`, never hardcoded copy.
- **Design tokens from Stitch exports.** Colors and layout values come from `constants/` files that mirror the Stitch design tool output.

## Tab structure

| Tab order | Route file | Tab label | Purpose |
|-----------|-----------|-----------|---------|
| 1 | `onboarding.tsx` | Start | Create / edit dog profile |
| 2 | `index.tsx` | Home | Dashboard with hero + routine cards |
| 3 | `capuch.tsx` | Capuch | Static image placeholder |
| 4 | `settings.tsx` | Settings | Clear saved data |

Configured in `src/components/app-tabs.tsx`.
