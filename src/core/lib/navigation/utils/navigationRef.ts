import type { ParamListBase } from '@react-navigation/native';
import { CommonActions, StackActions, createNavigationContainerRef } from '@react-navigation/native';
import { routeInteractions } from '@stores/global-interactions';

export const navigationRef = createNavigationContainerRef<ParamListBase>();

export function navigate(name: string, params?: any) {
	routeInteractions.pushRoute({ name, params });

	if (navigationRef.isReady()) {
		// @ts-ignore
		navigationRef.navigate(name as never, params as never);
	}
}

export function push(name: string, params?: any) {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(StackActions.push(name, params));
	}
}

export function goBack() {
	routeInteractions.popRoute();

	if (navigationRef.isReady() && navigationRef.canGoBack()) {
		navigationRef.goBack();
	}
}

export function pop(count: number = 1) {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(StackActions.pop(count));
	}
}

export function popToTop() {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(StackActions.popToTop());
	}
}

export function replace(name: string, params?: any) {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(StackActions.replace(name, params));
	}
}

export function reset(state: any) {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(CommonActions.reset(state));
	}
}

export function canGoBack(): boolean {
	return navigationRef.isReady() ? navigationRef.canGoBack() : false;
}

export function getCurrentRoute() {
	if (navigationRef.isReady()) {
		return navigationRef.getCurrentRoute();
	}
	return null;
}

export function getCurrentRouteName(): string | null {
	const route = getCurrentRoute();
	return route?.name ?? null;
}

export function getState() {
	if (navigationRef.isReady()) {
		return navigationRef.getState();
	}
	return null;
}

export function setParams(params: any) {
	if (navigationRef.isReady()) {
		navigationRef.setParams(params);
	}
}

export const navigationService = {
	navigate,
	push,
	goBack,
	pop,
	popToTop,
	replace,
	reset,
	canGoBack,
	getCurrentRoute,
	getCurrentRouteName,
	getState,
	setParams,
	isReady: () => navigationRef.isReady(),
};

