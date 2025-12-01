import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import type { ParamListBase, NavigationProp as RNNavigationProp, RouteProp as RNRouteProp } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';

export type { BottomTabNavigationOptions, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
export type { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
export type { NavigationState, Route } from '@react-navigation/native';
export type { NativeStackNavigationOptions, NativeStackNavigationProp } from '@react-navigation/native-stack';

export type NavigationProp<T extends ParamListBase = ParamListBase> = RNNavigationProp<T>;

export type RouteProp<
	T extends ParamListBase = ParamListBase,
	RouteName extends keyof T = keyof T
> = RNRouteProp<T, RouteName>;

export type StackNavigationOptions = NativeStackNavigationOptions;

export interface ScreenProps<T extends ParamListBase = ParamListBase, RouteName extends keyof T = keyof T> {
	name: RouteName extends string ? RouteName : string;
	component?: React.ComponentType<any>;
	children?: (props: any) => ReactNode;
	options?: StackNavigationOptions | BottomTabNavigationOptions | MaterialTopTabNavigationOptions | ((props: any) => StackNavigationOptions | BottomTabNavigationOptions | MaterialTopTabNavigationOptions);
	initialParams?: T[RouteName];
	getId?: (props: { params?: T[RouteName]; }) => string;
}

export interface NavigatorProps<T extends ParamListBase = ParamListBase> {
	children: ReactNode;
	screenOptions?: StackNavigationOptions | BottomTabNavigationOptions | MaterialTopTabNavigationOptions;
	initialRouteName?: keyof T extends string ? keyof T : string;
	tabBar?: (props: any) => ReactNode;
}

export type TabNavigationOptions = BottomTabNavigationOptions;

export interface NavigationContainerProps {
	children: ReactNode;
	onReady?: () => void;
}

export interface ScreenConfig<T extends ParamListBase = ParamListBase> {
	name: keyof T extends string ? keyof T : string;
	component: React.ComponentType<any>;
	options?: StackNavigationOptions | TabNavigationOptions;
	initialParams?: any;
}

