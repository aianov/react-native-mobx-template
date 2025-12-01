import { authStore } from '@auth/stores';
import { AuthGuardWrapper, ThemeInitWrapper } from '@auth/widgets/wrappers';
import { DebuggerUi } from '@lib/debuggerUi/DebuggerUi';
import '@lib/global/array-extensions';
import { NavigationContainerWithRef } from '@lib/navigation';
import { Notifier, NotifierWrapper } from '@lib/notifier';
import { globalInteractionsStore } from '@stores/global-interactions';
import { registerForPushNotificationsAsync } from '@utils/notifications';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './router/RootNavigator';
import type { RootStackParamList } from './router/navigation.types';

Notifier.setDefaultImage(require('../../assets/icon.png'));

const tabScreens: string[] = [];

const AppContent = observer(() => {
  const { initializeApp } = globalInteractionsStore;
  const {
    appReady: { appReady },
    initialScreen: { initialScreen },
  } = authStore;

  useEffect(() => {
    registerForPushNotificationsAsync();
    initializeApp();
  }, []);

  if (!appReady) return null;

  const mappedInitialRoute = tabScreens.includes(initialScreen) ? 'MainTabs' : initialScreen;

  return (
    <>
      <RootNavigator initialRouteName={mappedInitialRoute as keyof RootStackParamList} />
      <StatusBar style="light" />
      {__DEV__ && <DebuggerUi />}
    </>
  );
});

export const App = () => {
  return (
    <NavigationContainerWithRef>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeInitWrapper>
            <NotifierWrapper>
              <AuthGuardWrapper>
                <AppContent />
              </AuthGuardWrapper>
            </NotifierWrapper>
          </ThemeInitWrapper>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </NavigationContainerWithRef>
  );
};

registerRootComponent(App);
