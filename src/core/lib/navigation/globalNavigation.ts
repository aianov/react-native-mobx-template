export let navigationInstance: any = null;

export function setNavigationInstance(nav: any) {
	navigationInstance = nav;
}

export const navigation = {
	navigate: (name: string, params?: any) => {
		if (navigationInstance) {
			navigationInstance.navigate(name, params);
		}
	},
	push: (name: string, params?: any) => {
		if (navigationInstance) {
			navigationInstance.dispatch({
				type: 'PUSH',
				payload: { name, params },
			});
		}
	},
	goBack: () => {
		if (navigationInstance && navigationInstance.canGoBack()) {
			navigationInstance.goBack();
		}
	},
	replace: (name: string, params?: any) => {
		if (navigationInstance) {
			navigationInstance.dispatch({
				type: 'REPLACE',
				payload: { name, params },
			});
		}
	},
	reset: (state: any) => {
		if (navigationInstance) {
			navigationInstance.reset(state);
		}
	},
};

