import { createBottomTabNavigator as createRNBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ParamListBase } from '@react-navigation/native';

export function createBottomTabNavigator<T extends ParamListBase>() {
	return createRNBottomTabNavigator<T>();
}

export const Tab = createBottomTabNavigator();

