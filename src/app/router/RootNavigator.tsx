import { SignIn, SignUp } from '@auth/pages/Sign';
import { Onboarding } from '@onboarding/pages';

import { createNativeStackNavigator } from '@lib/navigation';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './navigation.types';


const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps { initialRouteName?: keyof RootStackParamList; }

export function RootNavigator({ initialRouteName = "Onboarding" }: RootNavigatorProps) {
	return (
		<Stack.Navigator
			initialRouteName={initialRouteName}
			screenOptions={{
				headerShown: false,
				animation: 'slide_from_right',
				animationDuration: 300,
				gestureEnabled: true,
				fullScreenGestureEnabled: true,
				freezeOnBlur: true,
			}}
		>
			<Stack.Screen name="Onboarding" component={Onboarding} />
			<Stack.Screen name="SignIn" component={SignIn} />
			<Stack.Screen name="SignUp" component={SignUp} />
			<Stack.Screen name="MainTabs" component={MainTabNavigator} />
		</Stack.Navigator>
	);
}

