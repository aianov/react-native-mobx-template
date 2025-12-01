import { extractDataByPath } from '@lib/obj';
import { formatId } from '@lib/text';
import { localStorage } from '@storage/index';
import { makeAutoObservable, runInAction } from 'mobx';
import { CacheUpdateHistory } from './cache-update-history';
import { defaultFetchOptions } from './const';
import { DebugHistory } from './debug-history';
import { CacheEntry, MobxSaiFetchInstance, MobxSaiFetchOptions } from './types';

export class GlobalHttpManager {
	constructor() { makeAutoObservable(this); }

	public requestCache: Map<string, CacheEntry> = new Map();
	public localStorageCache: Map<string, { timestamp: number; data: any; }> = new Map();
	public requestToIdMap: Map<string, string> = new Map();
	public requestParamsMap: Map<string, any> = new Map();
	public pendingRequests = new Map<string, boolean>();
	public scrollFetchRequests = new Map<string, { fromWhere: 'fromScroll', fetchWhat: 'top' | 'bot'; }>();

	private requestQueue: Array<{
		promise: () => Promise<any>,
		data: Partial<MobxSaiFetchInstance<any>>,
		options: MobxSaiFetchOptions,
		resolve: (result: boolean | undefined) => void,
		requestId?: string;
		tempId?: string;
		retryCount?: number;
	}> = [];
	private isProcessingQueue = false;
	private processingRequestId: string | null = null;

	private tempDataMap = new Map<string, { tempId: string; tempData: any; options: MobxSaiFetchOptions; }>();
	private tempIdCounter = 0;

	private maxCacheSize = 100;
	private maxLocalStorageCacheSize = 100;

	// Debug history
	public debugHistory = new DebugHistory();
	public cacheUpdateHistory = new CacheUpdateHistory();

	public isFirstRequestInSession = true;
	public shadowRequestSent: Set<string> = new Set();
	private appStateListeners: Array<{ remove: () => void; }> = [];
	private visibilityChangeListener: (() => void) | null = null;

	private shadowRequestRegistry = new Map<string, {
		promiseOrFunction: (() => Promise<any>) | Promise<any>;
		data: Partial<MobxSaiFetchInstance<any>>;
		options: Partial<MobxSaiFetchOptions>;
	}>();

	// Base URL for all requests
	private baseURL = '';

	initialize(options: { baseURL?: string; maxCacheSize?: number; maxLocalStorageCacheSize?: number; }) {
		this.baseURL = options.baseURL || '';
		this.maxCacheSize = options.maxCacheSize || 100;
		this.maxLocalStorageCacheSize = options.maxLocalStorageCacheSize || 100;

		this.loadLocalStorageCache();
		this.setupAppStateTracking();
	}

	/**
	 * Sets up app state tracking
	 */
	private setupAppStateTracking(): void {
		if (typeof require !== 'undefined') {
			try {
				const { AppState } = require('react-native');
				let previousAppState = AppState.currentState;

				const subscription = AppState.addEventListener('change', (nextAppState: string) => {
					if (nextAppState === 'active' && (previousAppState === 'background' || previousAppState === 'inactive')) {
						console.log(`[GlobalHttpManager] App returned to active, resetting first request flag`);
						this.isFirstRequestInSession = true;
						const clearedCount = this.shadowRequestSent.size;
						this.shadowRequestSent.clear();
						console.log(`[GlobalHttpManager] Cleared shadowRequestSent set (${clearedCount} entries)`);
						this.resendShadowRequests();
					}
					previousAppState = nextAppState;
				});
				this.appStateListeners.push(subscription);
			} catch (e) {
				console.error(`[GlobalHttpManager] Error setting up app state tracking:`, e);
			}
		}

		// Web: track visibilitychange
		if (typeof document !== 'undefined') {
			let wasHidden = document.visibilityState === 'hidden';

			const handleVisibilityChange = () => {
				if (document.visibilityState === 'visible' && wasHidden) {
					console.log(`[GlobalHttpManager] Page became visible, resetting first request flag`);
					this.isFirstRequestInSession = true;
					const clearedCount = this.shadowRequestSent.size;
					this.shadowRequestSent.clear();
					console.log(`[GlobalHttpManager] Cleared shadowRequestSent set (${clearedCount} entries)`);
					this.resendShadowRequests();
				}
				wasHidden = document.visibilityState === 'hidden';
			};
			document.addEventListener('visibilitychange', handleVisibilityChange);
			this.visibilityChangeListener = () => {
				document.removeEventListener('visibilitychange', handleVisibilityChange);
			};
		}
	}

	/**
	 * Resends all registered shadow requests
	 */
	private resendShadowRequests(): void {
		const registrySize = this.shadowRequestRegistry.size;
		if (registrySize === 0) {
			console.log(`[resendShadowRequests] No shadow requests registered`);
			return;
		}

		console.log(`[resendShadowRequests] 🔄 Resending ${registrySize} shadow requests`);

		setTimeout(() => {
			let sentCount = 0;
			for (const [cacheId, requestInfo] of this.shadowRequestRegistry.entries()) {
				try {
					console.log(`[resendShadowRequests] 📤 Resending shadow request for: ${cacheId}`);
					this.sendRequest(
						requestInfo.promiseOrFunction,
						requestInfo.data,
						requestInfo.options,
						null,
						null
					);
					sentCount++;
				} catch (error) {
					console.error(`[resendShadowRequests] ❌ Error resending for ${cacheId}:`, error);
				}
			}
			console.log(`[resendShadowRequests] ✅ Resent ${sentCount}/${registrySize} requests`);
		}, 500);
	}

	/**
	 * Unregisters a shadow request
	 */
	unregisterShadowRequest = (cacheId: string | string[] | number): void => {
		const formattedId = formatId(cacheId);
		const deleted = this.shadowRequestRegistry.delete(formattedId);
		if (deleted) {
			console.log(`[unregisterShadowRequest] ✅ Unregistered ${formattedId} (remaining: ${this.shadowRequestRegistry.size})`);
		} else {
			console.log(`[unregisterShadowRequest] ⚠️ ${formattedId} was not registered`);
		}
	};

	/**
	 * Gets list of registered shadow requests
	 */
	getRegisteredShadowRequests = (): string[] => {
		return Array.from(this.shadowRequestRegistry.keys());
	};

	// ========== Optimistic Updates Methods ==========

	/**
	 * Generates a unique temporary ID
	 */
	private generateTempId(): string {
		return `temp_${Date.now()}_${++this.tempIdCounter}`;
	}

	/**
	 * Creates temporary (optimistic) data
	 */
	private createOptimisticData(
		body: any,
		options: MobxSaiFetchOptions,
		requestId: string
	): { tempId: string; tempData: any; } | null {
		const optimistic = options.optimisticUpdate;
		if (!optimistic?.enabled || !optimistic.createTempData) {
			return null;
		}

		try {
			const tempId = this.generateTempId();
			const tempIdKey = optimistic.tempIdKey || 'id';
			const tempFlag = optimistic.tempFlag || 'isTemp';

			const tempData = optimistic.createTempData(body, { tempId });

			tempData[tempIdKey] = tempId;
			tempData[tempFlag] = true;

			console.log(`[OptimisticUpdate] Created temp data:`, tempId);

			this.tempDataMap.set(requestId, { tempId, tempData, options });

			return { tempId, tempData };
		} catch (error) {
			console.error('[OptimisticUpdate] Failed to create temp data:', error);
			return null;
		}
	}

	/**
	 * Adds temporary data to UI
	 */
	private addOptimisticDataToUI(
		tempData: any,
		data: Partial<MobxSaiFetchInstance<any>>,
		options: MobxSaiFetchOptions
	) {
		if (!options.pathToArray) return;

		const optimistic = options.optimisticUpdate;
		const addStrategy = optimistic?.addStrategy || 'start';
		const insertAfterLastTemp = optimistic?.insertAfterLastTemp || false;
		const tempFlag = optimistic?.tempFlag || 'isTemp';
		const targetCacheId = optimistic?.targetCacheId;

		let targetData = data;

		if (targetCacheId) {
			const targetCacheEntry = this.requestCache.get(formatId(targetCacheId));
			if (targetCacheEntry?.data) {
				targetData = targetCacheEntry.data;
				console.log(`[OptimisticUpdate] Using target cache: ${targetCacheId}`);
			} else {
				console.warn(`[OptimisticUpdate] Target cache ${targetCacheId} not found`);
			}
		}

		if (!targetData) return;

		console.log(`[OptimisticUpdate] Adding temp data, strategy: ${addStrategy}, insertAfterLastTemp: ${insertAfterLastTemp}`);

		runInAction(() => {
			if (targetData.saiUpdater) {
				targetData.saiUpdater(null, null, (prev: any[]) => {
					let res: any[] = [];

					if (insertAfterLastTemp) {
						let lastTempIndex = -1;
						for (let i = 0; i < prev.length; i++) {
							if (prev[i][tempFlag]) {
								lastTempIndex = i;
							}
						}

						if (lastTempIndex !== -1) {
							const newArray = [...prev];
							newArray.splice(lastTempIndex + 1, 0, tempData);
							res = newArray;
						} else {
							res = addStrategy === 'start' ? [tempData, ...prev] : [...prev, tempData];
						}
					} else {
						res = addStrategy === 'start' ? [tempData, ...prev] : [...prev, tempData];
					}

					return res;
				}, 'id', targetCacheId || options.id, optimistic?.updateCache);
			}
		});
	}

	/**
	 * Replaces temporary data with real data
	 */
	private replaceOptimisticDataWithReal(
		tempId: string,
		realData: any,
		data: Partial<MobxSaiFetchInstance<any>>,
		options: MobxSaiFetchOptions
	) {
		if (!options.pathToArray) return;

		const tempInfo = this.tempDataMap.get(tempId);
		if (!tempInfo) return;

		const optimistic = options.optimisticUpdate;
		const tempIdKey = optimistic?.tempIdKey || 'id';
		const tempFlag = optimistic?.tempFlag || 'isTemp';
		const extractRealData = optimistic?.extractRealData || ((res: any) => res);
		const targetCacheId = optimistic?.targetCacheId;

		let targetData = data;

		if (targetCacheId) {
			const targetCacheEntry = this.requestCache.get(formatId(targetCacheId));
			if (targetCacheEntry?.data) {
				targetData = targetCacheEntry.data;
			}
		}

		if (!targetData || !targetData.saiUpdater) return;

		const extracted = extractRealData(realData);

		console.log(`[OptimisticUpdate] Replacing temp data ${tempId} with real data`);

		runInAction(() => {
			targetData.saiUpdater!(null, null, (prev: any[]) => {
				return prev.map(item => {
					if (item[tempIdKey] === tempId && item[tempFlag]) {
						const { [tempFlag]: _, ...itemWithoutFlag } = item;
						return { ...itemWithoutFlag, ...extracted };
					}
					return item;
				});
			}, 'id', targetCacheId || options.id, optimistic?.updateCache);
		});

		if (optimistic?.onSuccess) {
			try {
				optimistic.onSuccess(tempInfo.tempData, extracted);
			} catch (error) {
				console.error('[OptimisticUpdate] Error in onSuccess callback:', error);
			}
		}

		this.tempDataMap.delete(tempId);
	}

	/**
	 * Removes temporary data on error
	 */
	private removeOptimisticData(
		tempId: string,
		error: any,
		data: Partial<MobxSaiFetchInstance<any>>,
		options: MobxSaiFetchOptions
	) {
		const tempInfo = this.tempDataMap.get(tempId);
		if (!tempInfo) return;

		const optimistic = options.optimisticUpdate;
		const shouldKeep = optimistic?.onError ? optimistic.onError(tempInfo.tempData, error) : false;

		if (shouldKeep) {
			console.log(`[OptimisticUpdate] Keeping temp data ${tempId} for retry`);
			return;
		}

		if (!options.pathToArray) return;

		const tempIdKey = optimistic?.tempIdKey || 'id';
		const tempFlag = optimistic?.tempFlag || 'isTemp';
		const targetCacheId = optimistic?.targetCacheId;

		let targetData = data;

		if (targetCacheId) {
			const targetCacheEntry = this.requestCache.get(formatId(targetCacheId));
			if (targetCacheEntry?.data) {
				targetData = targetCacheEntry.data;
			}
		}

		if (!targetData || !targetData.saiUpdater) return;

		console.log(`[OptimisticUpdate] Removing temp data ${tempId} due to error`);

		runInAction(() => {
			targetData.saiUpdater!(null, null, (prev: any[]) => {
				return prev.filter(item => !(item[tempIdKey] === tempId && item[tempFlag]));
			}, 'id', targetCacheId || options.id, optimistic?.updateCache);
		});

		this.tempDataMap.delete(tempId);
	}

	// ========== Queue Methods ==========

	/**
	 * Adds request to queue
	 */
	private enqueueRequest(
		promiseFunction: () => Promise<any>,
		data: Partial<MobxSaiFetchInstance<any>>,
		options: MobxSaiFetchOptions,
		requestId?: string,
		tempId?: string
	): Promise<boolean | undefined> {
		return new Promise((resolve) => {
			this.requestQueue.push({
				promise: promiseFunction,
				data,
				options,
				resolve,
				requestId,
				tempId,
				retryCount: 0
			});

			console.log(`[Queue] Added request to queue, total: ${this.requestQueue.length}`);

			if (!this.isProcessingQueue) {
				this.processQueue();
			}
		});
	}

	/**
	 * Processes request queue
	 */
	private async processQueue() {
		if (this.isProcessingQueue || this.requestQueue.length === 0) {
			return;
		}

		this.isProcessingQueue = true;

		while (this.requestQueue.length > 0) {
			const request = this.requestQueue[0];
			const { promise, data, options, resolve, requestId, tempId, retryCount = 0 } = request;

			this.processingRequestId = requestId || null;

			console.log(`[Queue] Processing request ${requestId}, queue length: ${this.requestQueue.length}`);

			try {
				const result = await promise();

				if (tempId) {
					this.replaceOptimisticDataWithReal(tempId, result, data, options);
				}

				const delay = options.queueStrategy?.delay || 0;
				if (delay > 0 && this.requestQueue.length > 1) {
					await new Promise(res => setTimeout(res, delay));
				}

				resolve(true);
				this.requestQueue.shift();
			} catch (error) {
				console.error(`[Queue] Request error:`, error);

				const retry = options.queueStrategy?.retry;
				const shouldRetry = retry && retryCount < retry.maxAttempts;
				const retryOnResult = retry?.retryOn ? retry.retryOn(error) : true;

				if (shouldRetry && retryOnResult) {
					const backoff = retry.backoff || 'linear';
					const baseDelay = retry.baseDelay || 1000;
					const delayMs = backoff === 'exponential'
						? baseDelay * Math.pow(2, retryCount)
						: baseDelay * (retryCount + 1);

					console.log(`[Queue] Retrying request (${retryCount + 1}/${retry.maxAttempts}) after ${delayMs}ms`);

					request.retryCount = retryCount + 1;
					await new Promise(res => setTimeout(res, delayMs));
				} else {
					if (tempId) {
						this.removeOptimisticData(tempId, error, data, options);
					}

					resolve(false);
					this.requestQueue.shift();
				}
			}
		}

		this.isProcessingQueue = false;
		this.processingRequestId = null;
	}

	// ========== LocalStorage Methods ==========

	/**
	 * Loads cache from localStorage on initialization
	 */
	private async loadLocalStorageCache() {
		try {
			const keys = await localStorage.getAllKeys();
			const cacheKeys = keys.filter((key: string) => key.startsWith('sai_http_cache_'));

			for (const key of cacheKeys) {
				const value = await localStorage.get(key);
				if (value) {
					try {
						const parsed = typeof value === 'string' ? JSON.parse(value) : value;
						this.localStorageCache.set(key.replace('sai_http_cache_', ''), {
							timestamp: parsed.timestamp || Date.now(),
							data: parsed.data
						});
					} catch (e) {
						console.warn(`[GlobalHttpManager] Failed to parse localStorage item: ${key}`);
					}
				}
			}

			console.log(`[GlobalHttpManager] Loaded ${this.localStorageCache.size} items from localStorage`);
		} catch (error) {
			console.error('[GlobalHttpManager] Error loading localStorage cache:', error);
		}
	}

	/**
	 * Saves data to localStorage
	 */
	private async saveToLocalStorage(id: string, data: any) {
		try {
			const key = `sai_http_cache_${id}`;
			const value = {
				timestamp: Date.now(),
				data
			};
			await localStorage.set(key, value);

			this.localStorageCache.set(id, { timestamp: Date.now(), data });

			if (this.localStorageCache.size > this.maxLocalStorageCacheSize) {
				const entries = Array.from(this.localStorageCache.entries());
				entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
				const toDelete = entries.slice(0, entries.length - this.maxLocalStorageCacheSize);

				for (const [id] of toDelete) {
					await localStorage.remove(`sai_http_cache_${id}`);
					this.localStorageCache.delete(id);
				}
			}
		} catch (error) {
			console.error(`[GlobalHttpManager] Error saving to localStorage: ${id}`, error);
		}
	}

	/**
	 * Gets data from localStorage
	 */
	async getFromLocalStorage(id: string): Promise<any> {
		try {
			const cached = this.localStorageCache.get(id);
			if (cached) {
				return cached.data;
			}

			const key = `sai_http_cache_${id}`;
			const value = await localStorage.get(key);
			if (value) {
				const parsed = typeof value === 'string' ? JSON.parse(value) : value;
				this.localStorageCache.set(id, {
					timestamp: parsed.timestamp || Date.now(),
					data: parsed.data
				});
				return parsed.data;
			}
		} catch (error) {
			console.error(`[GlobalHttpManager] Error getting from localStorage: ${id}`, error);
		}
		return null;
	}

	/**
	 * Removes data from localStorage
	 */
	async removeFromLocalStorage(id: string) {
		try {
			const key = `sai_http_cache_${id}`;
			await localStorage.remove(key);
			this.localStorageCache.delete(id);
		} catch (error) {
			console.error(`[GlobalHttpManager] Error removing from localStorage: ${id}`, error);
		}
	}

	// ========== Main Request Method ==========

	/**
	 * Sends HTTP request
	 */
	async sendRequest(
		promiseOrFunction: Promise<any> | (() => Promise<any>),
		data: Partial<MobxSaiFetchInstance<any>>,
		options: Partial<MobxSaiFetchOptions> = {},
		fromWhere: 'fromScroll' | null = null,
		fetchWhat: 'top' | 'bot' | null = null
	): Promise<boolean | undefined> {
		const mergedOptions: MobxSaiFetchOptions = {
			...defaultFetchOptions,
			...options
		};

		const { id, queueStrategy, optimisticUpdate, storageCache, isSetData } = mergedOptions;
		const requestId = id ? `req_${formatId(id)}_${Date.now()}` : `req_${Date.now()}`;

		this.requestToIdMap.set(requestId, id ? formatId(id) : requestId);

		const promiseFunction = promiseOrFunction instanceof Promise
			? () => promiseOrFunction
			: promiseOrFunction;

		let tempId: string | undefined;
		if (optimisticUpdate?.enabled && !fromWhere && data.body) {
			const optimisticData = this.createOptimisticData(data.body, mergedOptions, requestId);
			if (optimisticData) {
				tempId = optimisticData.tempId;
				this.addOptimisticDataToUI(optimisticData.tempData, data, mergedOptions);
			}
		}

		if (queueStrategy?.enabled && !fromWhere) {
			return this.enqueueRequest(promiseFunction, data, mergedOptions, requestId, tempId);
		}

		try {
			this.pendingRequests.set(requestId, true);

			if (fromWhere === 'fromScroll') {
				this.scrollFetchRequests.set(requestId, { fromWhere, fetchWhat: fetchWhat! });
			}

			// Log request to debug history
			const url = mergedOptions.url || '';
			const method = mergedOptions.method || 'GET';
			this.debugHistory.addRequest(
				url,
				method,
				data.body,
				false,
				id ? formatId(id) : undefined,
				requestId,
				mergedOptions.fetchIfHaveData,
				mergedOptions.needPending,
				mergedOptions.takePath
			);

			const result = await promiseFunction();

			this.pendingRequests.delete(requestId);

			if (fromWhere === 'fromScroll') {
				this.scrollFetchRequests.delete(requestId);
			}

			let processedData = result;
			if (mergedOptions.takePath) {
				processedData = extractDataByPath(result, mergedOptions.takePath);
			}

			if (isSetData) {
				runInAction(() => {
					if (data) {
						this.updateInstanceData(data, processedData, mergedOptions, fromWhere, fetchWhat);
					}
				});
			}

			if (storageCache && id && !fromWhere) {
				this.saveToLocalStorage(formatId(id), processedData);
			}

			if (tempId) {
				this.replaceOptimisticDataWithReal(tempId, result, data, mergedOptions);
			}

			if (mergedOptions.onSuccess) {
				try {
					mergedOptions.onSuccess(processedData, data.body);
				} catch (error) {
					console.error('[GlobalHttpManager] Error in onSuccess callback:', error);
				}
			}

			this.debugHistory.addResponse(result, undefined, false, requestId);

			return true;
		} catch (error) {
			console.error('[GlobalHttpManager] Request error:', error);

			this.pendingRequests.delete(requestId);

			if (fromWhere === 'fromScroll') {
				this.scrollFetchRequests.delete(requestId);
			}

			// Remove optimistic data
			if (tempId) {
				this.removeOptimisticData(tempId, error, data, mergedOptions);
			}

			// Update error state
			runInAction(() => {
				if (data) {
					data.error = error as Error;
					if (fromWhere == null && fetchWhat == null) {
						data.status = "rejected";
						data.isPending = false;
						data.isRejected = true;
						data.isFulfilled = false;
					} else {
						if (fetchWhat === 'bot') {
							data.botStatus = 'rejected';
							data.isBotPending = false;
							data.isBotRejected = true;
							data.botError = error as Error;
						}
						if (fetchWhat === 'top') {
							data.topStatus = 'rejected';
							data.isTopPending = false;
							data.isTopRejected = true;
							data.topError = error as Error;
						}
					}
				}
			});

			// Call onError callback
			if (mergedOptions.onError) {
				try {
					mergedOptions.onError(error, data.body);
				} catch (callbackError) {
					console.error('[GlobalHttpManager] Error in onError callback:', callbackError);
				}
			}

			this.debugHistory.addResponse(null, error, false, requestId);

			return false;
		}
	}

	/**
	 * Updates instance data after successful request
	 */
	private updateInstanceData(
		instance: Partial<MobxSaiFetchInstance<any>>,
		result: any,
		options: MobxSaiFetchOptions,
		fromWhere: 'fromScroll' | null,
		fetchWhat: 'top' | 'bot' | null
	) {
		const { fetchAddTo, dataScope } = options;

		// Update status
		if (fromWhere == null && fetchWhat == null) {
			instance.status = "fulfilled";
			instance.isPending = false;
			instance.isFulfilled = true;
			instance.isRejected = false;

			// Check isHaveMore
			if (dataScope?.isHaveMoreResKey && typeof result === 'object' && result !== null) {
				const isHaveMore = result[dataScope.isHaveMoreResKey];
				if (instance.isHaveMoreBot && typeof isHaveMore === 'boolean') {
					instance.isHaveMoreBot.setIsHaveMoreBot(isHaveMore);
				}
			}
		} else {
			if (fetchWhat === 'bot') {
				instance.botStatus = 'fulfilled';
				instance.isBotPending = false;
				instance.isBotFulfilled = true;

				if (dataScope?.isHaveMoreResKey && typeof result === 'object' && result !== null) {
					const isHaveMore = result[dataScope.isHaveMoreResKey];
					if (instance.isHaveMoreBot && typeof isHaveMore === 'boolean') {
						instance.isHaveMoreBot.setIsHaveMoreBot(isHaveMore);
					}
				}
			}
			if (fetchWhat === 'top') {
				instance.topStatus = 'fulfilled';
				instance.isTopPending = false;
				instance.isTopFulfilled = true;

				if (dataScope?.isHaveMoreResKey && typeof result === 'object' && result !== null) {
					const isHaveMore = result[dataScope.isHaveMoreResKey];
					if (instance.isHaveMoreTop && typeof isHaveMore === 'boolean') {
						instance.isHaveMoreTop.setIsHaveMoreTop(isHaveMore);
					}
				}
			}
		}

		// Update data with array handling
		if (fetchAddTo?.path && typeof instance.data === "object" && instance.data !== null) {
			const pathValue = this.getPathValue(instance.data, fetchAddTo.path);
			const resultPath = this.getPathValue(result, fetchAddTo.path);

			if (Array.isArray(pathValue) && Array.isArray(resultPath)) {
				switch (fetchAddTo.addTo) {
					case "start":
						this.setPathValue(instance.data, fetchAddTo.path, [...resultPath, ...pathValue]);
						break;
					case "end":
						this.setPathValue(instance.data, fetchAddTo.path, [...pathValue, ...resultPath]);
						break;
					case "reset":
					default:
						instance.data = result;
				}
			} else {
				instance.data = result;
			}
		} else {
			instance.data = result;
		}
	}

	private getPathValue(obj: any, path: string): any {
		return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
	}

	private setPathValue(obj: any, path: string, value: any) {
		const keys = path.split(".");
		let temp = obj;
		for (let i = 0; i < keys.length - 1; i++) {
			if (!temp[keys[i]]) temp[keys[i]] = {};
			temp = temp[keys[i]];
		}
		temp[keys[keys.length - 1]] = value;
	}
}

export const globalHttpManager = new GlobalHttpManager();

