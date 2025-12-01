# The Best React-native + Mobx Template

## Well... There is too much to explain and talk about

## First thing, let's talk about architecture.

---

# 📁 Architecture

# TODO: HERE PHOTO OF FOLDER "src"

## Pretty empty right?
## We have `app`, `assets`, `core` and `modules` folders inside `src` folder.

---

# 📂 `SRC` folders explain:

## 🧪 `__tests__/` 
For components, functions, screenshot and etc all type of tests [I use Jest btw]

## 📱 `app/` 
Have `main.tsx`, and `App.tsx`. Also folders like `layouts` and `router`.

## 🎨 `assets/` 
Inside this folder we have 6 folders with animations, fonts, icons, images, sounds, and global styles from StyleSheet

## ⚙️ `core/` 
One of the important folder here. Inside we have folders like: api, config, hooks, lib, locales (i18n), storage (AsyncStorage), stores (MobX global stores), ui, utils and widgets. We will talk about this folder later.

## 📦 `modules/` 
Now I'll start to show you unique architecture.

---

# 🔥 Let's dive deeper into each folder!

---

# 📱 `app/` folder

# TODO: HERE PHOTO OF FOLDER "app"

```
app/
├── App.tsx           # Main App component with providers
├── main.tsx          # Entry point
├── layouts/          # Layout components (tabs, stacks)
│   └── MainTabsLayout.tsx
└── router/           # All navigation stuff
    ├── index.ts
    ├── MainTabNavigator.tsx
    ├── RootNavigator.tsx
    └── navigation.types.ts
```

### What's inside?
- `App.tsx` - wraps everything with providers (theme, navigation, notifier, etc.)
- `main.tsx` - expo entry point, nothing special
- `layouts/` - here we keep layout components, like tab layouts
- `router/` - all navigation config lives here. Types, navigators, everything.

---

# 🎨 `assets/` folder

# TODO: HERE PHOTO OF FOLDER "assets"

```
assets/
├── animations/       # Lottie JSON files + wrapper components
│   ├── components/   # React components for animations
│   └── *.json        # Raw lottie files
├── fonts/            # Custom fonts (.ttf, .otf)
├── icons/            # SVG icons as React components
│   ├── SignPageIcons/
│   └── Ui/           # General UI icons
├── images/           # Static images (.jpg, .png)
├── sounds/           # Audio files (.mp3)
└── styles/           # Global StyleSheet styles
    └── global.ts
```

### What's inside?
- `animations/` - lottie animations. Each animation has its JSON file and React wrapper component
- `fonts/` - custom fonts, just drop .ttf or .otf here
- `icons/` - all icons are React components (SVG). Organized by feature
- `images/` - static images
- `sounds/` - notification sounds, etc.
- `styles/` - global styles that can be reused anywhere

---

# ⚙️ `core/` folder - THE BRAIN 🧠

# TODO: HERE PHOTO OF FOLDER "core"

This is where magic happens. Let me show you structure first:

```
core/
├── api/              # API configuration
├── config/           # App constants, types, regex, functions
├── hooks/            # Custom React hooks (global)
├── lib/              # 🔥 THE MOST IMPORTANT - all utilities
├── locales/          # i18n translations (en, ru)
├── storage/          # AsyncStorage wrappers
├── stores/           # MobX global stores
├── ui/               # 🎨 Reusable UI components
├── utils/            # Small utility functions
└── widgets/          # Complex reusable widgets
```

Let's go through each one...

---

## 📡 `core/api/`

# TODO: HERE PHOTO OF FOLDER "api"

```
api/
└── api.ts            # HTTP instance configuration
```

Here we configure our HTTP client. Base URL, interceptors, headers - everything.

---

## ⚙️ `core/config/`

# TODO: HERE PHOTO OF FOLDER "config"

```
config/
├── constants.ts      # App-wide constants
├── functions.ts      # Helper functions
├── regex.ts          # Regex patterns
└── types.ts          # Global TypeScript types
```

All your app configuration in one place. Constants like API endpoints, regex for validation, global types.

---

## 🪝 `core/hooks/`

# TODO: HERE PHOTO OF FOLDER "hooks"

```
hooks/
└── (empty for now, but ready for your custom hooks)
```

Place for global custom hooks. Like `useDebounce`, `useWindowSize`, etc.

---

## 📚 `core/lib/` - THE LIBRARY 📖

# TODO: HERE PHOTO OF FOLDER "lib"

This is where all the magic utilities live:

```
lib/
├── arr/              # Array utilities (empty, ready for use)
├── date/             # Date formatting functions
├── debuggerUi/       # 🔥 Built-in debugger UI component
├── global/           # Global extensions (Array.prototype, etc.)
├── helpers/          # General helper functions
├── mobx-toolbox/     # 🔥🔥🔥 MobX utilities (THE CORE)
│   ├── mobxDebouncer/    # Debounce for MobX actions
│   ├── mobxSaiFetch/     # HTTP requests with MobX (like React Query but better)
│   ├── mobxState/        # Easy state creation
│   ├── mobxValidator/    # Form validation
│   ├── useMobxForm/      # Form management
│   └── useMobxUpdate/    # State updates helper
├── navigation/       # Navigation utilities and hooks
├── notifier/         # Toast notifications system
├── numbers/          # Number formatting
├── obj/              # Object utilities
├── performance/      # Performance hooks (debounce, optimized callbacks)
├── string/           # String utilities
├── text/             # Text formatting and components
└── theme/            # Theme utilities (colors, gradients)
```

### 🔥 Most important here is `mobx-toolbox/`:
- `mobxSaiFetch` - like React Query but for MobX. Caching, optimistic updates, infinite scroll - everything!
- `mobxState` - create MobX state in one line
- `mobxValidator` - validation schemas like Zod but simpler
- `useMobxForm` - form management with validation
- `useMobxUpdate` - update nested state easily

---

## 🌍 `core/locales/`

# TODO: HERE PHOTO OF FOLDER "locales"

```
locales/
├── en/
│   └── translation.json
└── ru/
    └── translation.json
```

i18n translations. Just add new language folder and translation.json file.

---

## 💾 `core/storage/`

# TODO: HERE PHOTO OF FOLDER "storage"

```
storage/
├── AppStorage.ts     # App-specific storage
├── CacheManager.ts   # Cache management
├── index.ts          # Main export
└── types.ts          # Storage types
```

AsyncStorage wrappers. Easy to use, type-safe.

---

## 🏪 `core/stores/`

# TODO: HERE PHOTO OF FOLDER "stores"

```
stores/
├── global-interactions/    # Global app interactions
│   ├── global-interactions/
│   └── route-interactions/
└── memory/                 # Memory management
    ├── memory-interactions/
    └── memory-services/
```

Global MobX stores. Things that need to be accessed from anywhere.

---

## 🎨 `core/ui/` - UI COMPONENTS LIBRARY

# TODO: HERE PHOTO OF FOLDER "ui"

Holy... we have a lot here:

```
ui/
├── AnimatedTabs/         # Animated tab component
├── AnimatedTransition/   # Page transitions
├── AsyncDataRender/      # Render based on async state
├── BgWrapperUi/          # Background wrapper
├── BlurUi/               # Blur effect
├── BottomSheetUi/        # Bottom sheet modal
├── BoxUi/                # Flexbox wrapper (like Box in MUI)
├── ButtonUi/             # Button component
├── CheckboxUi/           # Checkbox
├── CleverImage/          # Smart image with caching
├── ContextMenuUi/        # Context menu
├── CustomRefreshControl/ # Pull to refresh
├── DatePickerUi/         # Date picker
├── ErrorTextUi/          # Error text display
├── FormattedText/        # Text with formatting
├── GridContentUi/        # Grid layout
├── GroupedBtns/          # Button group
├── HoldContextMenuUi/    # Long press context menu
├── ImageSwiper/          # Image carousel
├── InputUi/              # Text input
├── LiveTimeAgo/          # "5 min ago" component
├── LoaderUi/             # Loading spinner
├── MainText/             # Main text component
├── MediaPickerUi/        # Image/video picker
├── Modal/                # Modal component
├── ModalUi/              # Another modal variant
├── PageHeaderUi/         # Page header
├── PhoneInputUi/         # Phone number input
├── PressableUi/          # Pressable wrapper
├── RefreshControlUi/     # Refresh control
├── SecondaryText/        # Secondary text
├── SelectImageUi/        # Image selector
├── Separator/            # Divider line
├── SimpleButtonUi/       # Simple button
├── SimpleInputUi/        # Simple input
├── SimpleModalUi/        # Simple modal
├── SimpleTextAreaUi/     # Simple textarea
├── SkeletonUi/           # Skeleton loading
├── SwitchUi/             # Toggle switch
├── TextAreaUi/           # Textarea
├── index.ts              # All exports
└── types.ts              # UI types
```

Every component you need is here. All themed, all customizable.

---

## 🛠️ `core/utils/`

# TODO: HERE PHOTO OF FOLDER "utils"

```
utils/
├── device-info.ts    # Device information
├── haptics.ts        # Haptic feedback
├── jwt.ts            # JWT utilities
└── notifications.ts  # Push notifications
```

Small utility functions. Nothing fancy, just useful stuff.

---

## 🧩 `core/widgets/`

# TODO: HERE PHOTO OF FOLDER "widgets"

```
widgets/
└── wrappers/
    └── MainWrapper/  # Main app wrapper
```

Complex reusable widgets. Wrappers, compound components, etc.

---

# 📦 `modules/` folder - FEATURE MODULES

# TODO: HERE PHOTO OF FOLDER "modules"

```
modules/
├── auth/             # Authentication module
│   ├── pages/        # Auth screens
│   ├── shared/       # Shared auth components
│   ├── stores/       # Auth MobX stores
│   └── widgets/      # Auth widgets
├── onboarding/       # Onboarding module
│   ├── pages/
│   ├── shared/
│   └── stores/
└── theme/            # Theme module
    └── stores/       # Theme MobX store
```

### Each module has same structure:
- `pages/` - screens/pages
- `shared/` - shared components for this module
- `stores/` - MobX stores for this module
- `widgets/` - complex widgets for this module

This is **Feature-Sliced Design** but simpler. Each feature is isolated. Easy to understand, easy to maintain.

---

# 🎯 That's it for architecture!

## Next we'll dive into:
- How `mobxSaiFetch` works (it's really cool)
- How to create forms with validation
- How theming works
- And more...

Stay tuned! 🚀
