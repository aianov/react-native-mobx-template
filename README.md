# The Best React-native + Mobx architecture template 👑

---

# 🏁 Quick Start

1. git clone https://github.com/aianov/react-native-mobx-template
2. `bun i` (or `yarn` or `npm i`) [bun prefered]
3. `npx expo start`

---

# About architecture:

## Well... There is too much to explain and talk about

---

<div align="center">
  <table>
    <tr>
      <td>
        <img width="350" height="500" src="https://github.com/user-attachments/assets/7095f16c-7061-45b1-b570-bd8acdbe9e42" />
      </td>
      <td>
        <img width="350" height="500" src="https://github.com/user-attachments/assets/9c470fdc-f607-4712-9c0f-850b83b7cefd" />
      </td>
    </tr>
    <tr>
      <td>
        <img width="350" height="500" src="https://github.com/user-attachments/assets/9dd739ea-a6d5-40d1-b192-0d5d8b855615" />
      </td>
      <td>
        <img width="350" height="500" src="https://github.com/user-attachments/assets/4c26fb80-619d-427a-9be2-b69d88ed7e62" />
      </td>
    </tr>
  </table>
</div>

---

# First thing, let's talk about architecture.

---

# 📁 Architecture

<img width="300" height="550" alt="Снимок экрана 2025-12-01 в 23 22 21" src="https://github.com/user-attachments/assets/a2fa7346-9831-4137-ae44-c18fa8113286" />


## Pretty empty right?
## We have `app`, `assets`, `core` and `modules` folders inside `src` folder.

---

# 📂 `SRC` folders explain:

```
src/
├── __tests__/     # For components, functions, screenshot and etc all type of tests [I use Jest btw]
├── app/        # Have `main.tsx`, and `App.tsx`. Also folders like `layouts` and `router`.
├── assets/         # Inside this folder we have 6 folders with animations, fonts, icons, images, sounds, and global styles from StyleSheet
├── core/           # One of the important folder here. Inside we have folders like: api, config, hooks, lib, locales and etc We will talk about this folder later.
├── modules/       # Now I'll start to show you unique architecture.
```

Some kind of folders are too easy and small to explain, so I will skip folders sometime

---

# 🔥 Now Let's dive deeper into each folder!

---

# ⚙️ `core/` folder - THE BRAIN 🧠

<img width="350" height="650" alt="Снимок экрана 2025-12-01 в 22 04 03" src="https://github.com/user-attachments/assets/c4304a95-223b-465b-a3ab-65a1df15ff15" />

This is where magic happens. Let me show you structure first:

```
core/
├── api/              # API configuration
├── config/           # App constants, types, regex, functions
├── hooks/            # Custom React hooks (global)
├── lib/              # 🔥 The most important - all utilities
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

```
api/
└── api.ts            # HTTP instance configuration
```

Here we configure our HTTP client. Base URL, interceptors, headers - everything. Using our own axios like function, which helps us to use mobxSaiFetch function with DebuggerUi [We'll talk about this later]

---

## ⚙️ `core/config/`

```
config/
├── constants.ts      # App-wide constants
├── functions.ts      # Helper functions
├── regex.ts          # Regex patterns
└── types.ts          # Global TypeScript types
```

All your app configuration in one place. Constants like API endpoints, regex for validation, global types. Base show, u can do whatever you want here

---

## 📚 `core/lib/` - THE LIBRARY'S 📖

<img width="400" height="750" alt="Снимок экрана 2025-12-01 в 22 08 20" src="https://github.com/user-attachments/assets/7bfef751-2732-4acd-99cb-b17c874e0648" />

This is where all the magic utilities live:

```
lib/
├── arr/              # Array utilities (empty, ready for use)
├── date/             # Date formatting functions
├── debuggerUi/       # 🔥 Built-in debugger UI component
├── global/           # Global extensions (Array.prototype, etc.)
├── helpers/          # General helper functions
├── mobx-toolbox/     # 🔥 MobX utilities (THE CORE)
│   ├── mobxDebouncer/    # I think the best Debouncer ever written on MobX to any actions
│   ├── mobxSaiFetch/     # HTTP requests with MobX (like React Query but much better)
│   ├── mobxState/        # Easy state creation
│   ├── mobxValidator/    # Form validation
│   ├── useMobxForm/      # Form management
│   └── useMobxUpdate/    # State updates helper [U'll never will use it because its in mobxSaiFetch function inside]
├── navigation/       # Navigation utilities and hooks
├── notifier/         # Toast notifications system
├── numbers/          # Number formatting
├── obj/              # Object utilities
├── performance/      # Performance hooks (debounce, optimized callbacks)
├── string/           # String utilities
├── text/             # Text formatting and components
└── theme/            # Theme utilities (colors, gradients)
```

### Most important here is 🔥  `mobx-toolbox/` 🔥 :
- `mobxSaiFetch` - like React Query but for MobX. Caching, optimistic updates, infinite scroll - everything!
- `mobxState` - create MobX state in one line
- `mobxValidator` - validation schemas like Zod but simpler
- `useMobxForm` - form management with validation
- `useMobxUpdate` - update nested state easily

---

## 🌍 `core/locales/`

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

<img width="400" height="800" alt="Снимок экрана 2025-12-01 в 22 12 42" src="https://github.com/user-attachments/assets/474574ec-bb0b-4320-a731-1adca998b186" />

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

Every component you need is here. All themed, all customizable from src/modules/theme/stores/theme-interactions.

---

## 🛠️ `core/utils/`

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

```
widgets/
└── wrappers/
    └── MainWrapper/  # Main app wrapper
```

Complex reusable widgets. Wrappers, compound components, etc.

---

# 📦 `modules/` folder - FEATURE MODULES

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
- `stores/` - MobX stores for this module in S.A.I Architecture
- `widgets/` - complex widgets for this module

This is **Feature-Sliced Design** but simpler. Each feature is isolated. Easy to understand, easy to maintain.

---

# `stores/` folders - S.A.I Architecture

## S - Services
## A- Actions
## I - Interactions

# All logic of all features, need to be separated to this 3 main stores

auth/
├── stores/             # Authentication module
│   ├── auth-actions/        # Actions store - only requests function and response states [mobxSaiFetch function here]
│   ├── auth-interactions/       # Interactions store - All interaction logic with JSX
│   ├── auth-service/       # Services store - Boilerplate from interactions and actions, etc: success & error handlers for action store
│	 │
│   └── index.ts/      # Re-export for best path-alias experience and clean code

# That's it for architecture!

---

# 🔥 `DebuggerUi` - Built-in Debug Panel

This is probably one of the coolest features you've ever seen. A **floating draggable debug panel** that shows everything happening in your app in real-time.

## What it looks like:

<img width="200" height="200" alt="Снимок экрана 2025-12-01 в 21 21 43" src="https://github.com/user-attachments/assets/175aec69-35cf-4810-b3ab-e174612dc3d7" />

## A small floating React icon button that you can drag anywhere on screen. Tap it to open the full this debug panel:

<img width="400" height="500" alt="Снимок экрана 2025-12-01 в 21 28 15" src="https://github.com/user-attachments/assets/c10b0f72-5dce-4431-8209-ff1b8753d791" />

# Features:

<img width="400" height="400" alt="Снимок экрана 2025-12-01 в 21 28 54" src="https://github.com/user-attachments/assets/ecb4776a-4493-44a5-b0af-b4e237485773" />

### 📡 **Requests Tab**
Shows all HTTP requests with:
- Request/Response data with syntax highlighting
- **CACHED** tag (yellow border) - data from local memory cache
- **LOCAL-CACHED** tag (purple border) - data from localStorage
- **NO-PENDING** tag - request made without loading state
- **FORCE-FETCH** tag - forced fresh request
- Repeat count (×3 means same request was made 3 times)
- Copy button for each request

<img width="400" height="400" alt="Снимок экрана 2025-12-01 в 21 29 19" src="https://github.com/user-attachments/assets/632ccd06-afd3-4017-a06c-5b1d2347b47c" />

### 📦 **Cache Tab**
Shows current in-memory cache:
- All cached entries with their keys
- Data preview
- Delete individual cache items
- Clear all cache

<img width="400" height="400" alt="Снимок экрана 2025-12-01 в 21 29 28" src="https://github.com/user-attachments/assets/12db7603-1b43-4b63-8608-a2688ecfc926" />

### 📝 **Logger Tab**
Real-time logs with colors:
- Info (blue)
- Success (green)
- Warning (orange)
- Error (red)
- Copy last 100 logs button
- Auto-scroll to bottom

<img width="400" height="400" alt="Снимок экрана 2025-12-01 в 21 29 42" src="https://github.com/user-attachments/assets/e0b6a817-dabd-4d23-b988-3fa68fa53cf0" />

### 💾 **LocalStorage Tab**
Shows all AsyncStorage data:
- Key-value pairs
- Array length indicators
- Delete individual items

### 🖼️ **Images Tab**
Shows cached images from storage

### 🔄 **Cache Updates Tab**
Shows history of all cache mutations:
- `saiUpdater` - in-memory updates
- `saiLocalCacheUpdater` - local cache updates
- `saiLocalStorageUpdater` - localStorage updates
- Shows what changed (added/removed items, changed keys)

### 🔍 **Global Search**
Search across ALL tabs at once! Find any string in:
- Request URLs
- Request/Response bodies
- Cache data
- LocalStorage
- Navigate between matches

### Font Size Controls
Each tab has +/- buttons to adjust font size. Saved to localStorage! [Press DEFF to return default font size]

## How to use:

```tsx
// In your App.tsx or root component
import { DebuggerUi } from '@lib/debuggerUi/DebuggerUi';

export const App = () => {
  return (
    <>
      <YourApp />
      {__DEV__ && <DebuggerUi />}  {/* Only show in development */}
    </>
  );
};
```

That's it! Now you have full visibility into your app's HTTP layer 🔥

---

# 🔥 `mobxSaiFetch` - HTTP Requests with Superpowers

This is the heart of the template. Like React Query, but for MobX. Actually, I think it's even better.

## Basic Usage:

```tsx
// In your store
class UserActionsStore {
	constructor() { makeAutoObservable(this); }

	profile: MobxSaiFetchInstance<GetProfileResponse> = {}

	getProfileAction = () => {
		profile = mobxSaiFetch(
    		`/user/profile/${userId}`,     // URL
    		null,                // Body {} (null for GET)
    		{
      		id: 'getUserProfile',                // Cache key
      		storageCache: true,                  // Save to AsyncStorage
      		onSuccess: getProfileSuccessHandler, // Success callback
				onError: getProfileErrorHandler      // Error callback
    		}
		);
	}
}
```

## In your component:

```tsx
import { observer } from 'mobx-react-lite';
import { AsyncDataRender } from '@core/ui';

export const ProfileScreen = observer(() => {
  	const {
		profile: { status, data }
	} = userStore;

  	return (
		<AsyncDataRender
			status={status}
			data={data}
			emptyComponent={<ProfileEmpty />} // U can customize or make by default in AsyncDataRender core/ui
			errorComponent={<ProfileError />} // On error component fallback
			refreshControllCallback={onRefresh}
			renderContent={() => {
				return <ProfileCard data={profile.data} />
			}
		/>
  	);
});
```

## All Status Fields:

```tsx
interface MobxSaiFetchInstance<T> {
  // Data
  data: T | null;
  error: Error | null;
  body: any;
  
  // Main status
  status: "pending" | "fulfilled" | "rejected";
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
  
  // Scope status (for infinite scroll)
  scopeStatus: "pending" | "fulfilled" | "rejected" | "";
  isScopePending: boolean;
  isScopeFulfilled: boolean;
  isScopeRejected: boolean;
  
  // Top/Bottom loading (infinite scroll)
  isTopPending: boolean;
  isBotPending: boolean;
  isHaveMoreTop: { isHaveMoreTop: boolean };
  isHaveMoreBot: { isHaveMoreBot: boolean };
  
  // Methods
  fetch: (promise) => this;
  reset: () => this;
  saiUpdater: (...) => void; // useMobxUpdater (Can update cache too, for sync with local data)
}
```

## Options:

```tsx
mobxSaiFetch(url, body, {
  // Required
  id: 'uniqueCacheKey',              // Cache identifier
  
  // HTTP
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  headers: { 'X-Custom': 'value' },
  timeout: 5000,
  
  // Caching
  storageCache: true,                // Persist to AsyncStorage
  takeCachePriority: 'localStorage', // 'localStorage' | 'localCache'
  
  // Behavior
  fetchIfPending: false,             // Skip if already loading
  fetchIfHaveData: true,             // Re-fetch even if data exists
  needPending: true,                 // Show loading state
  shadowFirstRequest: true,          // First request updates cache silently
  
  // Data extraction
  takePath: 'data.user',             // Extract nested data
  pathToArray: 'items',              // Path to array for updates
  
  // Callbacks
  onSuccess: (data, body) => {},
  onError: (error) => {},
  onCacheUsed: (data, body, priority) => {},
  
  // Infinite Scroll
  dataScope: {
    scrollRef: flatListRef,          // For React Native
    topPercentage: 20,               // Trigger top fetch at 20%
    botPercentage: 80,               // Trigger bottom fetch at 80%
    startFrom: 'top' | 'bot',        // Initial position
    relativeParamsKey: 'cursor',     // Param for pagination
    isHaveMoreResKey: 'hasMore',     // Response field for more data
    setParams: setParams,            // State setter for params
    scopeLimit: 100,                 // Max items in memory
  },
  
  // Add fetched data to array
  fetchAddTo: {
    path: 'messages',                // Array path
    addTo: 'start' | 'end',          // Where to add new data
  },
  
  // Optimistic Updates
  optimisticUpdate: {
    enabled: true,
    createTempData: (body) => ({
      id: `temp_${Date.now()}`,
      ...body,
      isTemp: true,
    }),
    targetCacheId: 'getMessages',
  }
});
```

## Updating Cached Data:

### Method 1: `saiUpdater` (on instance)

```tsx
// Update single item in array
const { messages } = messageActionsStore

messages.saiUpdater(
  'message-123',              // ID of item to update
  'isRead',                   // Field to update [TYPE SAFE]
  true,                       // New value
  'id',                       // ID field name
  'getMessages',              // Cache ID
  'both'                      // Update both caches
);

// Update with function
messagesStore.messages.saiUpdater(
  'message-123',
  'likes',
  (prev) => prev + 1,
  'id',
  'getMessages',
  'localStorage'
);

// Update entire array
messagesStore.messages.saiUpdater(
  null,                       // null = update array
  null,
  (prevArray) => prevArray.filter(m => !m.isDeleted),
  'id',
  'getMessages',
  'both'
);
```

### Method 2: Global cache updaters

```tsx
import { 
  saiLocalCacheUpdater,
  saiLocalStorageUpdater,
  saiCacheUpdater 
} from '@lib/mobx-toolbox';

// Update in-memory cache
await saiLocalCacheUpdater('getMessages', (currentData) => {
  return {
    ...currentData,
    messages: currentData.messages.filter(m => m.id !== deletedId)
  };
});

// Update localStorage
await saiLocalStorageUpdater('getMessages', (currentData) => {
  return { ...currentData, unreadCount: 0 };
});

// Update both at once
await saiCacheUpdater('getMessages', (currentData) => {
  return { ...currentData, lastSeen: Date.now() };
});
```

## Infinite Scroll Example:

```tsx
// In getMessagesAction function:

const MESSAGES_LIMIT = 50

params = mobxState({
	chat_id: "...",
	relative_id: null,
	up: true,
	limit: MESSAGES_LIMIT
})("params")
  
messages = mobxSaiFetch(
   '/chat/messages',
   params.params,
   {
      id: 'getChatMessages',
      pathToArray: 'messages',
		takeCachePriority: "localStorage",
		method: 'GET',
      needPending,
		fetchIfPending: false,
      fetchIfHaveData: false,
      fetchIfHaveLocalStorage: false,
      storageCache: true,
      onSuccess: getMessagesSuccessHandler,
      onError: getMessagesErrorHandler,
		maxCacheData: 10,
      dataScope: {
         startFrom: "bot", // Start from bottom (newest)
         scrollRef: messagesScrollRef,
         topPercentage: 80, // Load older when scroll 15% from top
         botPercentage: 20, // Load newer when scroll 85% from top
         setParams: params.setParams,
         relativeParamsKey: "relative_id", // path to "relative_id" key from params to auto-reload for auto fetches in virtual list
         upOrDownParamsKey: "up", // path to "up" key from params
         isHaveMoreResKey: "is_have_more", // path to "is_have_more" key from backend response
         howMuchGettedToTop: 2, // How many pages can load up before scopeLimit start works
         upStrategy: "reversed",
         scopeLimit: MESSAGES_LIMIT * 2 // Keep max 100 messages in memory
      },
      cacheSystem: {
         limit: MESSAGES_LIMIT
      },
      fetchAddTo: {
         path: "messages",
         addTo: "start"
      },
    }
  );
```

```tsx
import { LegendList, LegendListRef } from '@legendapp/list';

export const ChatScreen = observer(() => {
	const { messages } = messageActionsStore;
	const { messagesScrollRef: { setMessagesScrollRef } } = messageInteractionsStore;

	const scrollRef = useRef<LegendListRef | null>(null);

	useEffect(() => {
		if (!scrollRef.current) return
		setMessagesScrollRef(scrollRef as any);
	}, [scrollRef.current]);

  	return (
		<LegendList
			ref={scrollRef}
			data={processedMessages}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			contentContainerStyle={contentContainerStyle}
			maintainVisibleContentPosition={true}
			recycleItems={false}
			drawDistance={500}
			estimatedItemSize={100}
			getEstimatedItemSize={getEstimatedItemSize}
			stickyIndices={Platform.OS === 'ios' ? stickyHeaderIndices : undefined}
			viewabilityConfig={viewabilityConfig}
			onScroll={handleScrollInternal}
			onMomentumScrollBegin={handleMomentumScrollBegin}
			scrollEventThrottle={16}
			keyboardShouldPersistTaps='handled'
			keyboardDismissMode='interactive'
			bounces={true}
		/>
  	);
});
```

## Check Cache Existence:

```tsx
import { hasSaiCache } from '@lib/mobx-toolbox';

// Check if data exists in any cache
const hasCache = await hasSaiCache('all', 'getUserProfile'); // Usefull for needPending option

// Check specific cache types
const hasLocalCache = await hasSaiCache(['localCache'], 'getUserProfile');
const hasStorage = await hasSaiCache(['localStorage'], 'getUserProfile');
const hasData = await hasSaiCache(['data'], userStore.profile);
```

---

# 🎨 Theming System

Full theming support with MobX reactivity. Change theme - UI updates instantly.

## Theme Structure:

```tsx
// All available theme tokens
interface ThemeT {
  // Backgrounds
  bg_000: string;  // Lightest
  bg_100: string;
  bg_200: string;
  bg_300: string;
  bg_400: string;
  bg_500: string;
  bg_600: string;  // Darkest
  
  // Borders (converted from CSS to RN format)
  border_100: string;
  border_200: string;
  // ...
  
  // Border radius (numbers for RN)
  radius_100: number;  // 20
  radius_200: number;  // 15
  // ...
  
  // Button backgrounds
  btn_bg_000: string;
  btn_bg_100: string;
  // ...
  
  // Button heights (numbers)
  btn_height_100: number;  // 55
  btn_height_200: number;  // 50
  // ...
  
  // Colors
  primary_100: string;   // Blue shades
  primary_200: string;
  primary_300: string;
  
  success_100: string;   // Green shades
  success_200: string;
  success_300: string;
  
  error_100: string;     // Red shades
  error_200: string;
  error_300: string;
  
  // Text
  text_100: string;      // Main text color
  secondary_100: string; // Secondary text
  
  // Inputs
  input_bg_100: string;
  input_border_300: string;
  input_height_300: number;
  input_radius_300: number;
  
  // Gradient
  mainGradientColor: {
    background: string;  // CSS gradient
  };
}
```

## Using Theme in Components:

```tsx
import { Box, MainText } from "@core/ui";
import { observer } from 'mobx-react-lite';
import { themeStore } from '@modules/theme/stores';

export const MyComponent = observer(() => {
  const { currentTheme } = themeStore;
  
  	return (
    	<Box
			bRad={currentTheme.radius_300} // Here
			bgColor={currentTheme.bg_100} // Here
		>
			// Text components from @core/ui already connected to currentTheme ;)
      	<MainText>
        		Hello World! MainText using currentTheme.text_100!
      	</MainText>
    	</Box>
  );
});
```

## Changing Theme:

```tsx
// Change entire theme
themeStore.changeTheme({
  bg_000: "rgba(18, 18, 18, 1)",
  bg_100: "rgba(24, 24, 24, 1)",
  text_100: "rgba(255, 255, 255, 1)",
  // ... dark theme values
});

// Change single value
themeStore.setThemeValue('primary_100', 'rgba(255, 0, 0, 1)');

// Set complete theme object
themeStore.setCurrentTheme(darkTheme);
```

## Creating Dark Theme:

```tsx
const darkTheme: ThemeT = {
  bg_000: "rgba(0, 0, 0, 1)",
  bg_100: "rgba(18, 18, 18, 1)",
  bg_200: "rgba(28, 28, 28, 1)",
  bg_300: "rgba(38, 38, 38, 1)",
  // ...
  
  text_100: "rgba(255, 255, 255, 1)",
  secondary_100: "rgba(156, 156, 156, 1)",
  
  border_100: "rgba(48, 48, 48, 1)",
  // ...
};

// Apply it
themeStore.changeTheme(darkTheme);
```

## Theme in UI Components:

All `core/ui` components automatically use theme:

```tsx
// ButtonUi uses theme colors
<ButtonUi 
  text="Click me" 
  onPress={handlePress}
  // Uses theme.primary_100 by default
/>

// InputUi uses theme
<InputUi
  placeholder="Enter text"
  // Uses theme.input_bg_100, theme.input_border_300, etc.
/>
```

---

# 🔧 Other Utilities

## `logger` - Colored Logging

## !!! [All logs appear in DebuggerUi, in "Logger" tab] !!!

```tsx
import { logger } from '@lib/helpers';

logger.info('Component', 'User clicked button');
logger.success('API', 'Data loaded successfully');
logger.warning('Cache', 'Cache miss, fetching...');
logger.error('Network', 'Request failed');
```

## Navigation Hooks

```tsx
import { navigate } from '@lib/navigation';

class SomeClass {
	constructor() { makeAutoObservable(this) };

	someFunction = () => {
		navigate("SignIn") // Use navigate in MobX

		// Yes, you can use navigate function from .ts files
		// Outside components. Everywhere!
	}
}
```

---

Create your first module:

```
modules/your-feature/
├── pages/
│   └── YourPage/
│       └── YourPage.tsx
├── stores/
│   ├── your-actions/
│   │   └── your-actions.ts    # HTTP requests
│   ├── your-interactions/
│   │   └── your-interactions.ts  # UI logic
│   ├── your-service/
│   │   └── your-service.ts    # Business logic
│   └── index.ts # Re-exports
├── widgets/
│   └── YourWidget/
├── shared/
│	 └── config/
│	 └── schemas/
│	 └── idk/
├── hooks/
├── components/
├── etc.../
```

# And remember. It's all `CUSTOMIZIBLE`.

## You can change whatever you want, lib, ui, or something else.

--- 

# That's the architecture! Simple, scalable, maintainable and very satisfying.
# Just-Perfect 💎

---

# 📞 Contact

Telegram: [@nics51](https://t.me/nics51)

Questions? Issues? Feature requests? Hit me up!
[Or create an issue]

---

Made with ❤️ and lots of 🧃

From Kazakhstan 🇰🇿
