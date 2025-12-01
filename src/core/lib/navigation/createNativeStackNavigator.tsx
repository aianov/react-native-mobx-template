import type { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator as createRNNativeStackNavigator } from '@react-navigation/native-stack';

const DEFAULT_SCREEN_OPTIONS = {
	animation: 'slide_from_right' as const,
	animationDuration: 300,
	gestureEnabled: true,
	fullScreenGestureEnabled: true,
	gestureDirection: 'horizontal' as const,
	headerShown: false,
	freezeOnBlur: true,
	contentStyle: {
		backgroundColor: 'transparent',
	},
	presentation: 'card' as const,
};

export function createNativeStackNavigator<T extends ParamListBase>() {
	return createRNNativeStackNavigator<T>();
}

export const Stack = createNativeStackNavigator();

