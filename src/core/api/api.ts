import { createMobxSaiHttpInstance } from '@lib/mobx-toolbox';
import { Platform } from 'react-native';

export const createInstance = () => {
	let baseURL = "";

	if (__DEV__) {
		baseURL = ``;
	} else {
		baseURL = "";
	}

	if (baseURL?.split(":")[0] === "http") {
		if (Platform.OS === 'ios') {
			baseURL = ``;
		} else if (Platform.OS === 'android') {
			baseURL = ``;
		}
	}

	const mobxHttpInstance = createMobxSaiHttpInstance({
		baseURL,
		withCredentials: true,
		headers: {
			'Content-Type': 'application/json'
		}
	});

	mobxHttpInstance.defaults.withCredentials = true;

	mobxHttpInstance.interceptors.request.use(
		async (config) => {
			config.withCredentials = true;

			// TODO: Add authentication headers
			// const tokens = authServiceStore.getTokensAndOtherData();

			// if (tokens?.access_token) {
			// 	config.headers = config.headers || {};
			// 	config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
			// 	console.log('[Interceptor Request] Added Authorization header');
			// }

			return config;
		},
		(error: any) => {
			console.log('[Interceptor Request Error]:', error);
			return Promise.reject(error);
		}
	);

	mobxHttpInstance.interceptors.response.use(
		async (response) => {
			console.log('[Interceptor Response Success]:', response.config.url, response.status);
			return response;
		},
		(error: any) => {
			console.log('[Interceptor Response Error]:', error.config?.url, error.response?.status);
			console.log('[Interceptor Response Error] Error details:', error.response?.data);
			// if (false) {
			// 	authServiceStore.fullClear();
			// 	try {
			// 		// clearCookies().catch(err => console.log('Error clearing cookies on auth error:', err));
			// 	} catch (err) {
			// 		console.log('Error clearing cookies on auth error:', err);
			// 	}
			// }
			return Promise.reject(error);
		}
	);

	return mobxHttpInstance;
};

export const api = createInstance();