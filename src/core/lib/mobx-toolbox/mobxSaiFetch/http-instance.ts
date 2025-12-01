import { makeAutoObservable } from 'mobx';

export interface HttpRequestConfig {
	url?: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
	baseURL?: string;
	headers?: Record<string, string>;
	params?: Record<string, any>;
	data?: any;
	timeout?: number;
	withCredentials?: boolean;
	responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
	onUploadProgress?: (progressEvent: any) => void;
	onDownloadProgress?: (progressEvent: any) => void;
	validateStatus?: (status: number) => boolean;
	maxRedirects?: number;
	signal?: AbortSignal;
}

export interface HttpResponse<T = any> {
	data: T;
	status: number;
	statusText: string;
	headers: Record<string, string>;
	config: HttpRequestConfig;
	request?: any;
}

export interface HttpError extends Error {
	config: HttpRequestConfig;
	code?: string;
	request?: any;
	response?: HttpResponse;
	isHttpError: boolean;
}

export type RequestInterceptor = (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;
export type RequestErrorInterceptor = (error: any) => any;
export type ResponseInterceptor = (response: HttpResponse) => HttpResponse | Promise<HttpResponse>;
export type ResponseErrorInterceptor = (error: HttpError) => any;

export interface InterceptorManager<T> {
	use(onFulfilled?: T, onRejected?: any): number;
	eject(id: number): void;
	clear(): void;
}

class InterceptorManagerImpl<T> implements InterceptorManager<T> {
	private interceptors: Map<number, { fulfilled?: T; rejected?: any; }> = new Map();
	private nextId = 0;

	constructor() {
		makeAutoObservable(this);
	}

	use(onFulfilled?: T, onRejected?: any): number {
		const id = this.nextId++;
		this.interceptors.set(id, { fulfilled: onFulfilled, rejected: onRejected });
		return id;
	}

	eject(id: number): void {
		this.interceptors.delete(id);
	}

	clear(): void {
		this.interceptors.clear();
	}

	forEach(fn: (interceptor: { fulfilled?: T; rejected?: any; }) => void): void {
		this.interceptors.forEach(fn);
	}
}

export class HttpInstance {
	public defaults: HttpRequestConfig;
	public interceptors: {
		request: InterceptorManager<RequestInterceptor>;
		response: InterceptorManager<ResponseInterceptor>;
	};

	constructor(config: HttpRequestConfig = {}) {
		this.defaults = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: 30000,
			validateStatus: (status: number) => status >= 200 && status < 300,
			...config
		};

		this.interceptors = {
			request: new InterceptorManagerImpl<RequestInterceptor>(),
			response: new InterceptorManagerImpl<ResponseInterceptor>()
		};

		makeAutoObservable(this);
	}

	private mergeConfig(config1: HttpRequestConfig, config2: HttpRequestConfig): HttpRequestConfig {
		return {
			...config1,
			...config2,
			headers: {
				...config1.headers,
				...config2.headers
			}
		};
	}

	private buildURL(baseURL: string | undefined, url: string, params?: Record<string, any>): string {
		let fullURL = url;

		if (baseURL && !url.startsWith('http')) {
			fullURL = `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
		}

		if (params && Object.keys(params).length > 0) {
			const queryString = Object.entries(params)
				.filter(([_, value]) => value !== undefined && value !== null)
				.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
				.join('&');

			if (queryString) {
				fullURL += (fullURL.includes('?') ? '&' : '?') + queryString;
			}
		}

		return fullURL;
	}

	private async executeRequest<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
		const {
			url = '',
			method = 'GET',
			baseURL,
			headers = {},
			params,
			data,
			timeout = 30000,
			withCredentials,
			responseType = 'json',
			validateStatus,
			signal
		} = config;

		const fullURL = this.buildURL(baseURL, url, params);

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const fetchOptions: RequestInit = {
			method,
			headers: headers as HeadersInit,
			signal: signal || controller.signal,
			credentials: withCredentials ? 'include' : 'same-origin'
		};

		if (data && !['GET', 'HEAD'].includes(method)) {
			if (headers['Content-Type'] === 'application/json') {
				fetchOptions.body = JSON.stringify(data);
			} else if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
				fetchOptions.body = new URLSearchParams(data).toString();
			} else if (data instanceof FormData) {
				fetchOptions.body = data;
				delete (fetchOptions.headers as any)['Content-Type'];
			} else {
				fetchOptions.body = data;
			}
		}

		try {
			const response = await fetch(fullURL, fetchOptions);
			clearTimeout(timeoutId);

			let responseData: any;

			switch (responseType) {
				case 'json':
					try {
						responseData = await response.json();
					} catch {
						responseData = await response.text();
					}
					break;
				case 'text':
					responseData = await response.text();
					break;
				case 'blob':
					responseData = await response.blob();
					break;
				case 'arraybuffer':
					responseData = await response.arrayBuffer();
					break;
				default:
					responseData = await response.json();
			}

			const httpResponse: HttpResponse<T> = {
				data: responseData,
				status: response.status,
				statusText: response.statusText,
				headers: this.parseHeaders(response.headers),
				config,
				request: { url: fullURL, ...fetchOptions }
			};

			const isValid = validateStatus ? validateStatus(response.status) : (response.status >= 200 && response.status < 300);

			if (!isValid) {
				const error: HttpError = Object.assign(
					new Error(`Request failed with status code ${response.status}`),
					{
						config,
						code: String(response.status),
						response: httpResponse,
						isHttpError: true
					}
				);
				throw error;
			}

			return httpResponse;
		} catch (error: any) {
			clearTimeout(timeoutId);

			if (error.isHttpError) {
				throw error;
			}

			const httpError: HttpError = Object.assign(
				error,
				{
					config,
					code: error.name === 'AbortError' ? 'ECONNABORTED' : 'ERR_NETWORK',
					isHttpError: true
				}
			);

			throw httpError;
		}
	}

	private parseHeaders(headers: Headers): Record<string, string> {
		const result: Record<string, string> = {};
		headers.forEach((value, key) => {
			result[key] = value;
		});
		return result;
	}

	async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
		let requestConfig = this.mergeConfig(this.defaults, config);

		const requestInterceptors = this.interceptors.request as InterceptorManagerImpl<RequestInterceptor>;
		for (const interceptor of Array.from((requestInterceptors as any).interceptors.values())) {
			if (interceptor.fulfilled) {
				try {
					requestConfig = await interceptor.fulfilled(requestConfig);
				} catch (error) {
					if (interceptor.rejected) {
						await interceptor.rejected(error);
					}
					throw error;
				}
			}
		}

		let response: HttpResponse<T>;
		try {
			response = await this.executeRequest<T>(requestConfig);
		} catch (error) {
			const responseInterceptors = this.interceptors.response as InterceptorManagerImpl<ResponseInterceptor>;
			for (const interceptor of Array.from((responseInterceptors as any).interceptors.values())) {
				if (interceptor.rejected) {
					try {
						return await interceptor.rejected(error);
					} catch (e) {
						error = e;
					}
				}
			}
			throw error;
		}

		const responseInterceptors = this.interceptors.response as InterceptorManagerImpl<ResponseInterceptor>;
		for (const interceptor of Array.from((responseInterceptors as any).interceptors.values())) {
			if (interceptor.fulfilled) {
				try {
					response = await interceptor.fulfilled(response);
				} catch (error) {
					if (interceptor.rejected) {
						return await interceptor.rejected(error);
					}
					throw error;
				}
			}
		}

		return response;
	}

	get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
		return this.request<T>({ ...config, method: 'GET', url });
	}

	post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
		return this.request<T>({ ...config, method: 'POST', url, data });
	}

	put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
		return this.request<T>({ ...config, method: 'PUT', url, data });
	}

	patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
		return this.request<T>({ ...config, method: 'PATCH', url, data });
	}

	delete<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
		return this.request<T>({ ...config, method: 'DELETE', url });
	}

	head<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
		return this.request<T>({ ...config, method: 'HEAD', url });
	}

	options<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
		return this.request<T>({ ...config, method: 'OPTIONS', url });
	}
}

/**
 * Creates new HTTP instance with settings
 * 
 * @example
 * const api = createMobxSaiHttpInstance({
 *   baseURL: 'https://api.example.com',
 *   timeout: 10000,
 *   headers: {
 *     'Authorization': 'Bearer token'
 *   }
 * });
 * 
 * // Add request interceptor
 * api.interceptors.request.use((config) => {
 *   config.headers['X-Custom-Header'] = 'value';
 *   return config;
 * });
 * 
 * // Add response interceptor
 * api.interceptors.response.use(
 *   (response) => response,
 *   (error) => {
 *     if (error.response?.status === 401) {
 *       // Handle unauthorized
 *     }
 *     return Promise.reject(error);
 *   }
 * );
 */
export function createMobxSaiHttpInstance(config?: HttpRequestConfig): HttpInstance {
	return new HttpInstance(config);
}

export const defaultHttpInstance = createMobxSaiHttpInstance();

