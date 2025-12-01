# Optimized React Navigation Library

Оптимизированная навигационная библиотека на базе React Navigation с максимальной производительностью и лучшими практиками.

## Особенности

- ✨ **Анимации слева направо** - плавные iOS-стиль переходы
- 🚀 **Оптимизация производительности** - ленивая загрузка, freezeOnBlur
- 🎯 **Type-safe навигация** - полная типизация TypeScript
- 🔄 **Обратная совместимость** - API совместим с navigationv2
- 📱 **Жесты** - полная поддержка свайпов и жестов
- 🎨 **Гибкая настройка** - легко кастомизируется

## Установка

Библиотека уже установлена и настроена! Просто импортируй и используй.

## Быстрый старт

### 1. Настройка NavigationContainer

```tsx
import { NavigationContainerWithRef } from '@/shared/lib/navigation';

export default function App() {
  return (
    <NavigationContainerWithRef onReady={() => console.log('Navigation ready')}>
      {/* Твои навигаторы */}
    </NavigationContainerWithRef>
  );
}
```

### 2. Создание Stack Navigator

```tsx
import { createNativeStackNavigator } from '@/shared/lib/navigation';

type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ headerShown: true, title: 'Профиль' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
```

### 3. Создание Tab Navigator

```tsx
import { createBottomTabNavigator } from '@/shared/lib/navigation';

type TabParamList = {
  Feed: undefined;
  Search: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

## Использование хуков

### useNavigation

```tsx
import { useNavigation } from '@/shared/lib/navigation';
import type { NativeStackNavigationProp } from '@/shared/lib/navigation';

type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function MyComponent() {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('Profile', { userId: '123' });
  };

  return <Button onPress={handlePress} title="Go to Profile" />;
}
```

### useRoute

```tsx
import { useRoute } from '@/shared/lib/navigation';
import type { RouteProp } from '@/shared/lib/navigation';

type RootStackParamList = {
  Profile: { userId: string; name?: string };
};

type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

function ProfileScreen() {
  const route = useRoute<ProfileRouteProp>();
  const { userId, name } = route.params;

  return <Text>User ID: {userId}</Text>;
}
```

### useFocusEffect

```tsx
import { useFocusEffect } from '@/shared/lib/navigation';
import { useCallback } from 'react';

function MyScreen() {
  useFocusEffect(
    useCallback(() => {
      // Выполняется когда экран получает фокус
      console.log('Screen focused');

      return () => {
        // Cleanup когда экран теряет фокус
        console.log('Screen unfocused');
      };
    }, [])
  );

  return <View>...</View>;
}
```

### useIsFocused

```tsx
import { useIsFocused } from '@/shared/lib/navigation';

function MyScreen() {
  const isFocused = useIsFocused();

  return (
    <View>
      <Text>Screen is {isFocused ? 'focused' : 'unfocused'}</Text>
    </View>
  );
}
```

## Императивная навигация (вне компонентов)

```tsx
import { navigate, goBack, push, pop } from '@/shared/lib/navigation';

// Navigate to screen
navigate('Profile', { userId: '123' });

// Push new screen
push('Settings');

// Go back
goBack();

// Pop multiple screens
pop(2);

// Get current route
import { getCurrentRoute, getCurrentRouteName } from '@/shared/lib/navigation';

const route = getCurrentRoute();
const routeName = getCurrentRouteName();
```

## Настройка анимаций

По умолчанию настроены анимации слева направо с длительностью 300ms. Можно переопределить:

```tsx
<Stack.Navigator
  screenOptions={{
    animation: 'slide_from_right', // default
    animationDuration: 300,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
  }}
>
  {/* screens */}
</Stack.Navigator>
```

Доступные анимации:
- `slide_from_right` (default) - слева направо
- `slide_from_left` - справа налево
- `slide_from_bottom` - снизу вверх
- `fade` - затухание
- `fade_from_bottom` - затухание снизу
- `flip` - переворот
- `simple_push` - простой push
- `none` - без анимации

## Оптимизации

### Freeze on Blur
Экраны автоматически замораживаются когда не в фокусе (настроено по умолчанию):

```tsx
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{ freezeOnBlur: true }} // enabled by default
/>
```

### Lazy Loading для Tabs
Табы загружаются лениво:

```tsx
<Tab.Navigator
  screenOptions={{
    lazy: true, // enabled by default
    unmountOnBlur: false, // keep mounted for better UX
  }}
>
  {/* tabs */}
</Tab.Navigator>
```

## Миграция с navigationv2

Библиотека полностью совместима с navigationv2. Просто замени импорты:

```tsx
// Было
import { useNavigation, NavigationContainer } from '@/shared/lib/navigationv2';

// Стало
import { useNavigation, NavigationContainerWithRef as NavigationContainer } from '@/shared/lib/navigation';
```

Все методы навигации работают так же:
- `navigate()`
- `push()`
- `goBack()`
- `pop()`
- `replace()`
- `reset()`

## Примеры использования

### Nested Navigation

```tsx
function App() {
  return (
    <NavigationContainerWithRef>
      <RootStack />
    </NavigationContainerWithRef>
  );
}

function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Modal" component={ModalScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}
```

### Custom Transitions

```tsx
<Stack.Screen
  name="Modal"
  component={ModalScreen}
  options={{
    presentation: 'modal',
    animation: 'slide_from_bottom',
    gestureDirection: 'vertical',
  }}
/>
```

### Navigation Events

```tsx
import { useFocusEffect, useIsFocused } from '@/shared/lib/navigation';

function MyScreen({ navigation }) {
  // Listen to focus events
  useFocusEffect(
    useCallback(() => {
      // Refresh data
      fetchData();
    }, [])
  );

  // Or use isFocused state
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);
}
```

## Производительность

Библиотека оптимизирована для максимальной производительности:

1. **Lazy Loading** - экраны загружаются только когда нужны
2. **Freeze on Blur** - неактивные экраны замораживаются
3. **Memoization** - компоненты мемоизированы
4. **Native Animations** - использует нативные анимации
5. **Gesture Handler** - оптимизированная обработка жестов

## Troubleshooting

### Навигация не работает вне компонента

Используй `NavigationContainerWithRef` вместо `NavigationContainer`:

```tsx
import { NavigationContainerWithRef } from '@/shared/lib/navigation';
```

### TypeScript ошибки

Убедись что типы правильно определены:

```tsx
type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
```

## Дополнительные ресурсы

- [React Navigation Docs](https://reactnavigation.org/)
- [TypeScript Guide](https://reactnavigation.org/docs/typescript/)
- [Performance Best Practices](https://reactnavigation.org/docs/performance/)

