import { defaultFetchOptions } from './const';
import { globalHttpManager } from './global-http-manager';
import { defaultHttpInstance, HttpInstance, HttpRequestConfig } from './http-instance';
import { MobxSaiFetch } from './mobx-sai-fetch';
import { CacheEntry, MobxSaiFetchInstance, MobxSaiFetchOptions } from './types';

// Local formatId to avoid circular dependency with text/index.tsx
function formatId(id: string | string[] | number): string {
	if (typeof id === 'string') return id;
	if (typeof id === 'number') return String(id);
	if (Array.isArray(id)) return id.join('_');
	return String(id);
}

// Global HTTP instance for all requests
let globalInstance: HttpInstance = defaultHttpInstance;

/**
 * Sets global HTTP instance for all mobxSaiFetch requests
 * 
 * @param instance - HTTP instance created via createMobxSaiHttpInstance
 * 
 * @example
 * const api = createMobxSaiHttpInstance({
 *   baseURL: 'https://api.example.com',
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 * setGlobalHttpInstance(api);
 */
export function setGlobalHttpInstance(instance: HttpInstance): void {
	globalInstance = instance;
}

/**
 * Gets current global HTTP instance
 */
export function getGlobalHttpInstance(): HttpInstance {
	return globalInstance;
}

/**
 * Get HTTP SAI instance by ID
 * 
 * @param id - ID instance
 * @returns MobxSaiFetchInstance or null if not found
 */
export function getSaiInstanceById<T = any>(id: string): MobxSaiFetchInstance<T> | null {
	const cachedEntry = globalHttpManager.requestCache.get(id);

	if (cachedEntry && cachedEntry.data) {
		return cachedEntry.data as MobxSaiFetchInstance<T>;
	}

	return null;
}

/**
 * Update local cache (in-memory cache) data
 * 
 * @param cacheId - Cache ID
 * @param updater - Callback that receives current cache and returns updated cache
 * @returns Promise<boolean> - Returns true if update was successful
 */
export async function saiLocalCacheUpdater<T = any>(
	cacheId: string,
	updater: (currentCache: T | null) => T | null
): Promise<boolean> {
	try {
		const formattedId = formatId(cacheId);
		const cachedEntry = globalHttpManager.requestCache.get(formattedId);

		if (!cachedEntry || !cachedEntry.data) {
			console.warn(`[saiLocalCacheUpdater] ⚠️ No cache found for ${cacheId}`);
			globalHttpManager.cacheUpdateHistory.addUpdate(
				'saiLocalCacheUpdater',
				cacheId,
				{ details: 'Cache not found' },
				false,
				'Cache not found'
			);
			return false;
		}

		const currentData = cachedEntry.data.data as T;
		const updatedData = updater(currentData);

		if (updatedData === undefined || updatedData === null) {
			console.warn(`[saiLocalCacheUpdater] ⚠️ Updater returned ${updatedData} for ${cacheId}`);
			globalHttpManager.cacheUpdateHistory.addUpdate(
				'saiLocalCacheUpdater',
				cacheId,
				{ details: `Updater returned ${updatedData}` },
				false
			);
			return false;
		}

		const changes: any = {};

		if (Array.isArray(updatedData) && Array.isArray(currentData)) {
			const lengthDiff = updatedData.length - currentData.length;
			changes.totalCount = updatedData.length;
			changes.previousCount = currentData.length;
			if (lengthDiff > 0) {
				changes.arrayAdded = lengthDiff;
			} else if (lengthDiff < 0) {
				changes.arrayRemoved = Math.abs(lengthDiff);
			} else {
				changes.arrayModified = true;
			}
		} else if (typeof updatedData === 'object' && typeof currentData === 'object') {
			const newKeys = Object.keys(updatedData);
			const oldKeys = Object.keys(currentData || {});
			const changedKeys = newKeys.filter(key =>
				JSON.stringify((updatedData as any)[key]) !== JSON.stringify((currentData as any)?.[key])
			);
			const addedKeys = newKeys.filter(key => !oldKeys.includes(key));
			const removedKeys = oldKeys.filter(key => !newKeys.includes(key));

			if (changedKeys.length > 0) changes.keysChanged = changedKeys;
			if (addedKeys.length > 0) changes.keysAdded = addedKeys;
			if (removedKeys.length > 0) changes.keysRemoved = removedKeys;
		}

		cachedEntry.data.data = updatedData;
		console.log(`[saiLocalCacheUpdater] ✅ Updated local cache for ${cacheId}`, changes);

		globalHttpManager.cacheUpdateHistory.addUpdate(
			'saiLocalCacheUpdater',
			cacheId,
			changes,
			true
		);
		return true;
	} catch (error) {
		console.error(`[saiLocalCacheUpdater] ❌ Error updating cache for ${cacheId}:`, error);
		globalHttpManager.cacheUpdateHistory.addUpdate(
			'saiLocalCacheUpdater',
			cacheId,
			{ details: String(error) },
			false,
			String(error)
		);
		return false;
	}
}

/**
 * Update localStorage cache data
 * 
 * @param cacheId - Cache ID
 * @param updater - Callback that receives current cache and returns updated cache
 * @returns Promise<boolean> - Returns true if update was successful
 */
export async function saiLocalStorageUpdater<T = any>(
	cacheId: string,
	updater: (currentCache: T | null) => T | null
): Promise<boolean> {
	try {
		const formattedId = formatId(cacheId);
		const currentData = await globalHttpManager.getFromLocalStorage(formattedId) as T;
		const updatedData = updater(currentData);

		if (updatedData === undefined || updatedData === null) {
			console.warn(`[saiLocalStorageUpdater] ⚠️ Updater returned ${updatedData} for ${cacheId}`);
			globalHttpManager.cacheUpdateHistory.addUpdate(
				'saiLocalStorageUpdater',
				cacheId,
				{ details: `Updater returned ${updatedData}` },
				false
			);
			return false;
		}

		const changes: any = {};

		if (Array.isArray(updatedData) && Array.isArray(currentData)) {
			const lengthDiff = updatedData.length - currentData.length;
			changes.totalCount = updatedData.length;
			changes.previousCount = currentData.length;
			if (lengthDiff > 0) {
				changes.arrayAdded = lengthDiff;
			} else if (lengthDiff < 0) {
				changes.arrayRemoved = Math.abs(lengthDiff);
			} else {
				changes.arrayModified = true;
			}
		} else if (typeof updatedData === 'object' && typeof currentData === 'object') {
			const newKeys = Object.keys(updatedData);
			const oldKeys = Object.keys(currentData || {});
			const changedKeys = newKeys.filter(key =>
				JSON.stringify((updatedData as any)[key]) !== JSON.stringify((currentData as any)?.[key])
			);
			const addedKeys = newKeys.filter(key => !oldKeys.includes(key));
			const removedKeys = oldKeys.filter(key => !newKeys.includes(key));

			if (changedKeys.length > 0) changes.keysChanged = changedKeys;
			if (addedKeys.length > 0) changes.keysAdded = addedKeys;
			if (removedKeys.length > 0) changes.keysRemoved = removedKeys;
		}

		await globalHttpManager['saveToLocalStorage'](formattedId, updatedData);
		console.log(`[saiLocalStorageUpdater] ✅ Updated localStorage cache for ${cacheId}`, changes);

		globalHttpManager.cacheUpdateHistory.addUpdate(
			'saiLocalStorageUpdater',
			cacheId,
			changes,
			true
		);
		return true;
	} catch (error) {
		console.error(`[saiLocalStorageUpdater] ❌ Error updating localStorage cache for ${cacheId}:`, error);
		globalHttpManager.cacheUpdateHistory.addUpdate(
			'saiLocalStorageUpdater',
			cacheId,
			{ details: String(error) },
			false,
			String(error)
		);
		return false;
	}
}

/**
 * Update both local and localStorage cache data simultaneously
 * 
 * @param cacheId - Cache ID
 * @param updater - Callback that receives current cache and returns updated cache
 * @returns Promise<{ localCache: boolean; localStorage: boolean }> - Returns status of both updates
 */
export async function saiCacheUpdater<T = any>(
	cacheId: string,
	updater: (currentCache: T | null) => T | null
): Promise<{ localCache: boolean; localStorage: boolean; }> {
	const results = {
		localCache: false,
		localStorage: false
	};

	try {
		results.localCache = await saiLocalCacheUpdater(cacheId, updater);

		results.localStorage = await saiLocalStorageUpdater(cacheId, updater);

		console.log(`[saiCacheUpdater] Updated caches for ${cacheId}:`, results);

		globalHttpManager.cacheUpdateHistory.addUpdate(
			'saiCacheUpdater',
			cacheId,
			{ details: `LocalCache: ${results.localCache}, localStorage: ${results.localStorage}` },
			results.localCache || results.localStorage
		);
		return results;
	} catch (error) {
		console.error(`[saiCacheUpdater] Error updating caches for ${cacheId}:`, error);
		globalHttpManager.cacheUpdateHistory.addUpdate(
			'saiCacheUpdater',
			cacheId,
			{ details: String(error) },
			false,
			String(error)
		);
		return results;
	}
}

// ========================== EXPORT FUNCTION ==============================

/**
 * Makes HTTP request with full control and many conveniences
 * 
 * Telegram: https://t.me/nics51
 *
 * @param url - Request URL (can be relative if baseURL is specified)
 * @param body - Request body (for POST, PUT, PATCH)
 * @param options - mobxSaiFetch and HTTP request options
 * 
 * @example Simple GET request
 * this.profile = mobxSaiFetch(
 *   '/user/profile',
 *   null,
 *   {
 *     id: 'getUserProfile',
 *     storageCache: true
 *   }
 * );
 * 
 * @example POST request with body
 * this.createPost = mobxSaiFetch(
 *   '/posts',
 *   { title: 'New Post', content: 'Content' },
 *   {
 *     id: 'createPost',
 *     method: 'POST',
 *     onSuccess: (data) => console.log('Created:', data)
 *   }
 * );
 * 
 * @example With optimistic updates
 * this.sendMessage = mobxSaiFetch(
 *   '/messages',
 *   { content: 'Hello!' },
 *   {
 *     id: 'sendMessage',
 *     method: 'POST',
 *     pathToArray: 'messages',
 *     optimisticUpdate: {
 *       enabled: true,
 *       createTempData: (body) => ({
 *         id: `temp_${Date.now()}`,
 *         content: body.content,
 *         isTemp: true
 *       }),
 *       targetCacheId: 'getMessages'
 *     }
 *   }
 * );
 * 
 * @example With infinite scroll
 * this.posts = mobxSaiFetch(
 *   '/posts',
 *   { page: 1, limit: 20 },
 *   {
 *     id: 'getPosts',
 *     pathToArray: 'posts',
 *     dataScope: {
 *       class: 'posts-scroll',
 *       startFrom: 'top',
 *       botPercentage: 80,
 *       relativeParamsKey: 'cursor',
 *       isHaveMoreResKey: 'hasMore'
 *     },
 *     fetchAddTo: {
 *       path: 'posts',
 *       addTo: 'end'
 *     }
 *   }
 * );
 */
export function mobxSaiFetch<T>(
	url: string,
	body?: any,
	options: Partial<MobxSaiFetchOptions> = {}
): MobxSaiFetchInstance<T> {
	const { id, fetchIfPending = false, fetchIfHaveData = true, method = 'GET' } = options;

	console.log(`[mobxSaiFetch] Called with url: ${url}, method: ${method}, id: ${id}`);

	// Create promise function that uses HTTP instance
	const promiseFunction = async (): Promise<T> => {
		const httpConfig: HttpRequestConfig = {
			url,
			method: method as any,
			data: body,
			headers: options.headers,
			timeout: options.timeout,
			params: method === 'GET' ? body : undefined
		};

		const response = await globalInstance.request<T>(httpConfig);
		return response.data;
	};

	if (id) {
		const cachedEntry = globalHttpManager.requestCache.get(formatId(id));

		console.log(`[mobxSaiFetch] 🔍 Looking for cache entry for ${formatId(id)}:`, {
			found: !!cachedEntry,
			hasData: !!cachedEntry?.data,
			fromLocalStorage: cachedEntry?.fromLocalStorage
		});

		if (cachedEntry && cachedEntry.data) {
			const instance = cachedEntry.data as MobxSaiFetchInstance<T>;
			const { isPending, data } = instance;

			instance.options = {
				...instance.options,
				...defaultFetchOptions,
				...options,
				url,
				method,
				cacheSystem: {
					...instance.options!.cacheSystem,
					...defaultFetchOptions.cacheSystem,
					...options.cacheSystem
				},
				dataScope: {
					...instance.options!.dataScope,
					...defaultFetchOptions.dataScope,
					...options.dataScope
				},
				fetchAddTo: {
					...instance.options!.fetchAddTo,
					...defaultFetchOptions.fetchAddTo,
					...options.fetchAddTo
				}
			};

			const hasTruePendingRequest = Array.from(globalHttpManager.requestToIdMap.entries())
				.some(([reqId, cacheId]) => cacheId === formatId(id) && globalHttpManager.pendingRequests.has(reqId));

			if (!fetchIfPending && isPending && hasTruePendingRequest) {
				console.warn(`[mobxSaiFetch] Request ${id} is actually pending and fetchIfPending is false.`);
				return instance;
			}

			if (isPending && !hasTruePendingRequest) {
				console.log(`[mobxSaiFetch] Clearing stale pending state for ${id}`);
				instance.status = "fulfilled";
				instance.isPending = false;
				instance.isFulfilled = true;
				instance.isRejected = false;
			}

			if (!data && cachedEntry.data?.data) {
				instance.data = cachedEntry.data.data as T;
				console.log(`[mobxSaiFetch] ✅ Loaded cached data into instance.data for ${id}`);
			}

			if (!fetchIfHaveData && data) {
				const cachedTakePath = instance.options?.takePath;
				const newTakePath = options.takePath;

				if (cachedTakePath !== newTakePath) {
					console.log(`[mobxSaiFetch] takePath changed from "${cachedTakePath}" to "${newTakePath}", need to re-fetch`);
				} else {
					const isFromLocalStorage = cachedEntry.fromLocalStorage || false;
					console.warn(`[mobxSaiFetch] Data already exists for ${id} and fetchIfHaveData is false. Using cached data (fromLocalStorage: ${isFromLocalStorage}).`);
					globalHttpManager.debugHistory.addCachedRequest(
						url,
						method,
						body,
						formatId(id),
						data,
						isFromLocalStorage,
						options.fetchIfHaveData,
						options.needPending,
						options.takePath
					);

					if (options.onCacheUsed) {
						try {
							const cachePriority = isFromLocalStorage ? 'localStorage' : 'localCache';
							options.onCacheUsed(data as T, body, cachePriority);
						} catch (callbackError) {
							console.error('[mobxSaiFetch] Error in onCacheUsed callback:', callbackError);
						}
					}

					return instance;
				}
			}

			const shadowFirstRequest = options.shadowFirstRequest !== undefined ? options.shadowFirstRequest : false;
			const isFirstRequest = globalHttpManager.isFirstRequestInSession;
			const cacheId = formatId(id);

			const shadowRequestAlreadySent = globalHttpManager.shadowRequestSent?.has(cacheId) || false;

			if (fetchIfHaveData && data && shadowFirstRequest && shadowRequestAlreadySent && !isFirstRequest) {
				const cachedTakePath = instance.options?.takePath;
				const newTakePath = options.takePath;

				if (cachedTakePath !== newTakePath) {
					console.log(`[mobxSaiFetch] takePath changed, need to re-fetch`);
				} else {
					const isFromLocalStorage = cachedEntry.fromLocalStorage || false;
					console.log(`[mobxSaiFetch] Using cached data without request (shadowFirstRequest mode)`);
					globalHttpManager.debugHistory.addCachedRequest(
						url,
						method,
						body,
						cacheId,
						data,
						isFromLocalStorage,
						options.fetchIfHaveData,
						options.needPending,
						options.takePath
					);

					if (options.onCacheUsed) {
						try {
							const cachePriority = isFromLocalStorage ? 'localStorage' : 'localCache';
							options.onCacheUsed(data as T, body, cachePriority);
						} catch (callbackError) {
							console.error('[mobxSaiFetch] Error in onCacheUsed callback:', callbackError);
						}
					}

					return instance;
				}
			}

			console.log(`[mobxSaiFetch] Sending new request for existing instance ${id}`);
			instance.body = body;
			instance.fetch!(promiseFunction);
			return instance;
		} else {
			const takeCachePriority = options.takeCachePriority || defaultFetchOptions.takeCachePriority || 'localCache';
			const storageCache = options.storageCache !== undefined ? options.storageCache : defaultFetchOptions.storageCache;

			if (storageCache && takeCachePriority === 'localStorage') {
				globalHttpManager.getFromLocalStorage(formatId(id)).then((localStorageData) => {
					if (localStorageData) {
						const instance = getSaiInstanceById<T>(formatId(id));
						if (instance && !instance.data) {
							instance.data = localStorageData as T;
							instance.status = "fulfilled";
							instance.isPending = false;
							instance.isFulfilled = true;
							instance.isRejected = false;
							console.log(`[mobxSaiFetch] ✅ Loaded data from localStorage for ${id}`);
						}
					}
				}).catch(() => {
					console.error(`[mobxSaiFetch] Error loading data from localStorage for ${id}`);
				});
			}

			console.log(`[mobxSaiFetch] No cached entry found for ${id}, creating new instance`);
		}
	}

	const instance = (new MobxSaiFetch<T>({ ...options, url, method })) as MobxSaiFetchInstance<T>;
	instance.body = body;
	console.log(`[mobxSaiFetch] Created new instance for ${id || 'no-id'}`);

	if (id) {
		const cacheEntry: CacheEntry = {
			timestamp: Date.now(),
			data: instance,
			options: { ...defaultFetchOptions, ...options, url, method }
		};
		globalHttpManager.requestCache.set(formatId(id), cacheEntry);
		console.log(`[mobxSaiFetch] Cached new instance with id: ${id}`);
	}

	instance.fetch!(promiseFunction);

	return instance;
}

/**
 * Checks for cache presence in specified locations
 */
export async function hasSaiCache(
	cacheTypes: ("data" | "localCache" | "localStorage")[] | "all",
	cacheIdOrInstance: string | string[] | number | MobxSaiFetchInstance<any>
): Promise<boolean> {
	if (Array.isArray(cacheTypes) && cacheTypes.length == 0) return false;

	const typesToCheck: ("data" | "localCache" | "localStorage")[] =
		cacheTypes === "all"
			? ["data", "localCache", "localStorage"]
			: cacheTypes;

	let cacheId: string | null = null;
	let instance: MobxSaiFetchInstance<any> | null = null;

	const isInstance = cacheIdOrInstance &&
		typeof cacheIdOrInstance === 'object' &&
		'data' in cacheIdOrInstance &&
		!(Array.isArray(cacheIdOrInstance) || typeof cacheIdOrInstance === 'string' || typeof cacheIdOrInstance === 'number');

	if (isInstance) {
		instance = cacheIdOrInstance as MobxSaiFetchInstance<any>;
		for (const [id, entry] of globalHttpManager.requestCache.entries()) {
			if (entry.data === instance) {
				cacheId = id;
				break;
			}
		}

		if (!cacheId && (instance as any).options?.id) {
			cacheId = formatId((instance as any).options.id);
		}
	} else {
		cacheId = formatId(cacheIdOrInstance as string | string[] | number);
		instance = getSaiInstanceById(cacheId);
	}

	if (!cacheId && !instance) {
		return false;
	}

	for (const cacheType of typesToCheck) {
		let hasCacheInType = false;

		switch (cacheType) {
			case "data":
				if (instance && instance.data !== null && instance.data !== undefined) {
					hasCacheInType = true;
				}
				break;

			case "localCache":
				if (cacheId) {
					const cachedEntry = globalHttpManager.requestCache.get(cacheId);
					if (cachedEntry && cachedEntry.data) {
						hasCacheInType = true;
					}
				}
				break;

			case "localStorage":
				if (cacheId) {
					const memoryCache = globalHttpManager.localStorageCache.get(cacheId);
					if (memoryCache && memoryCache.data !== null && memoryCache.data !== undefined) {
						hasCacheInType = true;
					} else {
						try {
							const localStorageData = await globalHttpManager.getFromLocalStorage(cacheId);
							if (localStorageData !== null && localStorageData !== undefined) {
								hasCacheInType = true;
							}
						} catch (error) {
							console.warn(`[hasSaiCache] Error checking localStorage cache for ${cacheId}:`, error);
						}
					}
				}
				break;
		}

		if (hasCacheInType) {
			return true;
		}
	}

	return false;
}

/**
 * Unregisters a shadow request
 */
export function unregisterShadowRequest(cacheId: string | string[] | number): void {
	return globalHttpManager.unregisterShadowRequest(cacheId);
}

/**
 * Gets list of all registered shadow requests
 */
export function getRegisteredShadowRequests(): string[] {
	return globalHttpManager.getRegisteredShadowRequests();
}

// ========================== HTTP MANAGER INITIALIZATION ==============================

export function initializeHttpManager(options: {
	baseURL?: string;
	maxCacheSize?: number;
	maxLocalStorageCacheSize?: number;
}) {
	globalHttpManager.initialize(options);
	return globalHttpManager;
}

// Re-exports
export { GlobalHttpManager, globalHttpManager } from './global-http-manager';
export { createMobxSaiHttpInstance, defaultHttpInstance, HttpInstance, HttpRequestConfig } from './http-instance';
export type { HttpError, HttpResponse } from './http-instance';
export { MobxSaiFetch } from './mobx-sai-fetch';
export * from './types';

