export { NavigationContainer } from './NavigationContainer';
export { NavigationContainerWithRef } from './NavigationContainerWithRef';

export { Tab, createBottomTabNavigator } from './createBottomTabNavigator';
export { MaterialTopTab, createMaterialTopTabNavigator } from './createMaterialTopTabNavigator';
export { Stack, createNativeStackNavigator } from './createNativeStackNavigator';

export { useFocusEffect, useFocusEffectOptimized } from './hooks/useFocusEffect';
export { useIsFocused } from './hooks/useIsFocused';
export { useNavigation } from './hooks/useNavigation';
export { useNavigationState } from './hooks/useNavigationState';
export { useRoute } from './hooks/useRoute';

export {
	canGoBack,
	getCurrentRoute,
	getCurrentRouteName,
	getState, goBack, navigate, navigationRef, navigationService, pop,
	popToTop, push, replace,
	reset, setParams
} from './utils/navigationRef';

export { navigation, navigationInstance, setNavigationInstance } from './globalNavigation';

export type {
	BottomTabNavigationOptions, BottomTabNavigationProp, MaterialTopTabNavigationOptions, NativeStackNavigationOptions, NativeStackNavigationProp, NavigationContainerProps, NavigationProp, NavigationState, NavigatorProps, Route, RouteProp, ScreenConfig, ScreenProps, StackNavigationOptions,
	TabNavigationOptions
} from './types';

export {
	CommonActions, DrawerActions, StackActions,
	TabActions, useLinkProps, useLinkTo, useScrollToTop
} from '@react-navigation/native';

export type { ParamListBase } from '@react-navigation/native';

export { useIsFocused as useIsScreenFocused } from './hooks/useIsFocused';
export { useNavigation as useNavigationStable } from './hooks/useNavigation';
export { useRoute as useRouteStable } from './hooks/useRoute';

export type { ScreenProps as Screen } from './types';

