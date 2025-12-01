import { createBottomTabNavigator } from '@lib/navigation';
import type { MainTabParamList } from './navigation.types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				lazy: true,
			}}
			// tabBar={(props: any) => <MainBottomNavigation {...props} />}
			initialRouteName=""
		>
			{/* <Tab.Screen name="" component={} /> */}
		</Tab.Navigator>
	);
}

