import { createMaterialTopTabNavigator as createRNMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { ParamListBase } from '@react-navigation/native';
import React, { memo, useMemo } from 'react';
import type { MaterialTopTabNavigationOptions, NavigatorProps, ScreenProps } from './types';

/**
 * Optimized Material Top Tab Navigator
 * 
 * Features:
 * - Swipeable tabs
 * - Lazy loading
 * - Smooth animations
 * - Material design
 */

const DEFAULT_SCREEN_OPTIONS: MaterialTopTabNavigationOptions = {
	// Performance optimizations
	lazy: true,
	lazyPreloadDistance: 1,

	// Swipe
	swipeEnabled: true,

	// Animation
	animationEnabled: true,

	// Tab bar styling
	tabBarScrollEnabled: false,
	tabBarIndicatorStyle: {
		height: 2,
	},
	tabBarStyle: {
		elevation: 0,
		shadowOpacity: 0,
	},
};

export function createMaterialTopTabNavigator<T extends ParamListBase>() {
	const TopTab = createRNMaterialTopTabNavigator<T>();

	const Navigator = memo<NavigatorProps<T>>(({ children, screenOptions, initialRouteName }) => {
		const mergedScreenOptions = useMemo(() => ({
			...DEFAULT_SCREEN_OPTIONS,
			...screenOptions,
		}), [screenOptions]);

		return (
			<TopTab.Navigator
				screenOptions={mergedScreenOptions}
				initialRouteName={initialRouteName as string}
			>
				{children}
			</TopTab.Navigator>
		);
	});

	Navigator.displayName = 'MaterialTopTabNavigator';

	const Screen = memo<ScreenProps<T>>(({ name, component, children, options, initialParams }) => {
		const screenOptions = useMemo(() => {
			if (typeof options === 'function') {
				return options;
			}
			return {
				...DEFAULT_SCREEN_OPTIONS,
				...options,
			};
		}, [options]);

		return (
			<TopTab.Screen
				name={name as string}
				component={component}
				options={screenOptions}
				initialParams={initialParams}
			>
				{children}
			</TopTab.Screen>
		);
	});

	Screen.displayName = 'MaterialTopTabScreen';

	return {
		Navigator,
		Screen,
	};
}

// Default export for convenience
export const MaterialTopTab = createMaterialTopTabNavigator();

