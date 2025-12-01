import { logger } from '@lib/helpers';
import { formatId } from '@lib/text';
import { makeAutoObservable, runInAction } from 'mobx';
import { mobxState } from '../mobxState';
import { MobxUpdater, NestedKeyOf, UpdateCache, UpdaterT } from '../useMobxUpdate';
import { defaultFetchOptions } from './const';
import { globalHttpManager } from './global-http-manager';
import { ExtractArrayElement, MobxSaiFetchOptions } from './types';

export class MobxSaiFetch<T> {
	constructor(options?: Partial<MobxSaiFetchOptions>) {
		this.options = {
			...this.options,
			...defaultFetchOptions,
			...options,
			cacheSystem: {
				...this.options.cacheSystem,
				...defaultFetchOptions.cacheSystem,
				...options?.cacheSystem
			},
			dataScope: {
				...this.options.dataScope,
				...defaultFetchOptions.dataScope,
				...options?.dataScope
			},
			fetchAddTo: {
				...this.options.fetchAddTo,
				...defaultFetchOptions.fetchAddTo,
				...options?.fetchAddTo
			}
		};
		makeAutoObservable(this, {}, { autoBind: true });
		this.setupScrollTracking();

		if (!this.options.needPending) {
			this.status = "fulfilled";
		}

		this.isHaveMoreTop.setIsHaveMoreTop(this.options.dataScope?.startFrom !== 'top');
		this.isHaveMoreBot.setIsHaveMoreBot(this.options.dataScope?.startFrom !== 'bot');
	}

	isPending = false;
	isFulfilled = false;
	isRejected = false;

	isScopePending = false;
	isScopeFulfilled = false;
	isScopeRejected = false;

	status: "pending" | "fulfilled" | "rejected" = "pending";
	scopeStatus: "pending" | "fulfilled" | "rejected" | "" = "";
	data: T | null = null;
	error: Error | null = null;
	body: any = null;

	addedToEndCount = 0;
	addedToStartCount = 0;
	fetchedCount = 0;

	scrollProgress = 0;
	gettedToTop = mobxState(0)('gettedToTop');
	botStatus: "pending" | "fulfilled" | "rejected" | "" = "";
	topStatus: "pending" | "fulfilled" | "rejected" | "" = "";
	scrollCachedData = mobxState<any[]>([])('scrollCachedData');

	isBotPending = false;
	isBotRejected = false;
	isBotFulfilled = false;

	isTopPending = false;
	isTopRejected = false;
	isTopFulfilled = false;

	topError: Error | null = null;
	botError: Error | null = null;

	isHaveMoreBot = mobxState(false)('isHaveMoreBot');
	isHaveMoreTop = mobxState(false)('isHaveMoreTop');

	// Debounce and cooldown for scroll fetches
	private scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null;
	private lastScrollFetchTime = 0;
	private readonly SCROLL_FETCH_COOLDOWN = 500; // 500ms cooldown after each fetch

	private oldOptions: MobxSaiFetchOptions | null = null;
	promiseOrFunction: Promise<T> | (() => Promise<T>) | null = null;

	options: MobxSaiFetchOptions = defaultFetchOptions;

	setupScrollTracking() {
		if (!this.options.dataScope?.class && !this.options.dataScope?.scrollRef) return;

		if (this.options.dataScope?.class && typeof document !== 'undefined') {
			const element = document.querySelector(`.${this.options.dataScope.class}`);
			if (!element) {
				console.warn("Scroll tracking element not found.");
				return;
			}

			const updateScrollProgress = () => {
				const { scrollTop, scrollHeight, clientHeight } = element;
				this.handleScrollUpdate(scrollTop, scrollHeight, clientHeight);
			};

			element.addEventListener("scroll", updateScrollProgress);
		}

		// React Native
		else if (this.options.dataScope?.scrollRef) {
			const handleScroll = (event: any) => {
				const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
				const scrollTop = contentOffset.y;
				const scrollHeight = contentSize.height;
				const clientHeight = layoutMeasurement.height;

				this.handleScrollUpdate(scrollTop, scrollHeight, clientHeight);
			};

			this.options.dataScope.onScroll = handleScroll;
		}
	}

	handleScrollUpdate(scrollTop: number, scrollHeight: number, clientHeight: number) {
		if (this.scrollDebounceTimer) {
			clearTimeout(this.scrollDebounceTimer);
		}

		this.scrollProgress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);

		this.scrollDebounceTimer = setTimeout(() => {
			this.performScrollFetch(scrollTop, scrollHeight, clientHeight);
		}, 100); // 100ms debounce for scroll events
	}

	private performScrollFetch(scrollTop: number, scrollHeight: number, clientHeight: number) {
		const now = Date.now();
		if (now - this.lastScrollFetchTime < this.SCROLL_FETCH_COOLDOWN) {
			logger.info("[performScrollFetch]", `Cooldown active, skipping fetch. Time since last: ${now - this.lastScrollFetchTime}ms`);
			return;
		}

		const { topPercentage, botPercentage, startFrom } = this.options.dataScope!;
		const {
			gettedToTop: { gettedToTop, setGettedToTop },
			isHaveMoreBot: { isHaveMoreBot, setIsHaveMoreBot },
			isHaveMoreTop: { isHaveMoreTop, setIsHaveMoreTop },
			isTopPending,
			isBotPending,
		} = this;

		const {
			relativeParamsKey,
			upOrDownParamsKey,
			howMuchGettedToTop
		} = this.options.dataScope || {};

		logger.info("top", JSON.stringify({
			data: {
				topPercentage,
				scrollProgress: 100 - this.scrollProgress,
				isTopPending,
				fetchAddToPath: this.options.fetchAddTo!.path,
				setParams: this.options.dataScope!.setParams,
				isHaveMoreTop,
			},
			checks: {
				1: topPercentage !== null,
				2: (100 - this.scrollProgress) >= topPercentage!,
				3: !isTopPending,
				4: isHaveMoreTop,
			}
		}));

		// === FETCH TOP ===
		if (
			topPercentage !== null &&
			(100 - this.scrollProgress) >= topPercentage! &&
			!isTopPending &&
			isHaveMoreTop
		) {
			if (startFrom == 'top' && gettedToTop >= -(howMuchGettedToTop! - 1)) return;

			logger.info("PerformScrollFetch", `FETCH TOP. gettedToTop: ${gettedToTop} howMuchGettedToTop: ${howMuchGettedToTop}`);

			setGettedToTop(p => {
				let res = p + 1;

				if (!howMuchGettedToTop) {
					logger.info("PerformScrollFetch", `No howMuchGettedToTop provided`);
				}

				if (howMuchGettedToTop && (res >= howMuchGettedToTop)) setIsHaveMoreBot(true);

				return res;
			});
			this.setTopPending();

			// @ts-ignore
			const findedData = this?.data?.[this?.options?.fetchAddTo?.path]?.[0]?.id;

			if (!findedData || findedData == null || findedData == undefined) {
				logger.warning("PerformScrollFetch", `We can't find your relative_id. path: ${this?.options?.fetchAddTo?.path} finded data: ${findedData}`);
				return;
			}

			this.oldOptions = this.options;
			this.options = {
				...this.options,
				isSetData: true,
				fetchAddTo: {
					...this.options.fetchAddTo,
					addTo: 'start'
				}
			};

			this.options.dataScope!.setParams!((prev: any) => {
				const newParams = prev;

				// @ts-ignore
				if (relativeParamsKey) {
					const path = this.options.fetchAddTo!.path;
					const data = this.data as Array<T>;

					if (!path || !data) return;

					const arr = data[path as unknown as keyof typeof data] as Array<T>;

					if (this.options.dataScope?.relativeIdSelectStrategy === 'reversed') {
						arr.reverse();
					}

					// @ts-ignore
					const newRelativeId = arr[0].id;

					newParams[relativeParamsKey] = newRelativeId;
				}

				if (upOrDownParamsKey) newParams[upOrDownParamsKey] = true;
				return newParams;
			});

			if (this.promiseOrFunction) {
				this.lastScrollFetchTime = Date.now();
				this.fetch(this.promiseOrFunction, 'fromScroll', 'top');
			}
		}

		logger.info("bot", JSON.stringify({
			data: {
				botPercentage,
				scrollProgress: 100 - this.scrollProgress,
				isBotPending,
				fetchAddToPath: this.options.fetchAddTo!.path,
				setParams: this.options.dataScope!.setParams,
				isHaveMoreBot,
				howMuchGettedToTop
			},
			checks: {
				1: botPercentage !== null,
				2: (100 - this.scrollProgress) <= botPercentage!,
				3: !isBotPending,
				4: isHaveMoreBot,
				5: this.options.fetchAddTo!.path,
				6: !!this.data?.[this.options.fetchAddTo!.path as unknown as keyof typeof this.data],
				7: !!this.options.dataScope!.setParams,
				8: isHaveMoreBot,
				9: howMuchGettedToTop,
			}
		}));

		// === FETCH BOT ===
		if (
			botPercentage !== null &&
			(100 - this.scrollProgress) <= botPercentage! &&
			!isBotPending &&
			this.data &&
			this.options.fetchAddTo!.path &&
			// @ts-ignore
			this.data[this.options.fetchAddTo!.path!] &&
			this.options.dataScope!.setParams &&
			isHaveMoreBot &&
			howMuchGettedToTop
		) {
			if (startFrom == 'bot' && gettedToTop < howMuchGettedToTop) return;

			// @ts-ignore
			const dataArray = this.data[this.options.fetchAddTo!.path!];

			if (!dataArray || dataArray.length === 0) {
				console.warn(`[BOT FETCH] Empty data array, aborting`);
				return;
			}

			const first3 = dataArray?.slice(0, 3).map((m: any) => m.id?.substring(0, 8)).join(', ');
			const last3 = dataArray?.slice(-3).map((m: any) => m.id?.substring(0, 8)).join(', ');
			logger.info("[handleScrollUpdate]", `📋 BOT FETCH - Array snapshot BEFORE any operations: [${first3}...${last3}], length: ${dataArray?.length}`);

			const relativePost = dataArray[dataArray.length - 1];
			const savedRelativeId = relativePost?.id;

			if (!savedRelativeId) {
				console.warn(`[BOT FETCH] Can't find relative Id in last element`);
				return;
			}

			logger.info("[handleScrollUpdate]", `🔒 SAVED relative_id for BOT: ${savedRelativeId}, array length: ${dataArray?.length}, using LAST element`);

			setGettedToTop(p => {
				let res = p - 1;

				if (!howMuchGettedToTop) {
					logger.info("PerformScrollFetch", `No howMuchGettedToTop provided`);
				}

				if (howMuchGettedToTop && (res < howMuchGettedToTop)) setIsHaveMoreTop(true);

				return res;
			});
			this.setBotPending();

			this.oldOptions = this.options;
			const botAddTo = startFrom === 'bot' ? 'start' : 'end';
			this.options = {
				...this.options,
				isSetData: true,
				fetchAddTo: {
					...this.options.fetchAddTo,
					addTo: botAddTo
				}
			};

			this.options.dataScope!.setParams!((prev: any) => {
				const newParams = prev;

				logger.info("[handleScrollUpdate]", `📤 Using SAVED relative_id for BOT: ${savedRelativeId}`);
				if (relativeParamsKey) newParams[relativeParamsKey] = savedRelativeId;

				if (upOrDownParamsKey) newParams[upOrDownParamsKey] = false;
				return newParams;
			});

			logger.info("[performScrollFetch]", `📤 Calling fetch for BOT`);
			if (this.promiseOrFunction) {
				this.lastScrollFetchTime = Date.now();
				this.fetch(this.promiseOrFunction, 'fromScroll', 'bot');
			}
		}
	}

	setIsPending = () => {
		this.status = "pending";
		this.isPending = true;
		this.isFulfilled = false;
		this.isRejected = false;
	};

	setIsFulfilled = () => {
		this.status = "fulfilled";
		this.isPending = false;
		this.isFulfilled = true;
		this.isRejected = false;
	};

	setIsRejected = () => {
		this.status = "rejected";
		this.isPending = false;
		this.isFulfilled = false;
		this.isRejected = true;
	};

	private setTopPending = () => {
		this.topStatus = 'pending';
		this.isTopPending = true;
		this.isTopRejected = false;
		this.isTopFulfilled = false;
	};

	private setTopRejected = (err: Error) => {
		this.topError = err;
		this.topStatus = 'rejected';
		this.isTopPending = false;
		this.isTopRejected = true;
		this.isTopFulfilled = false;
	};

	private setTopFulfilled = () => {
		this.topStatus = 'fulfilled';
		this.isTopPending = false;
		this.isTopRejected = false;
		this.isTopFulfilled = true;
	};

	private setBotPending = () => {
		this.botStatus = 'pending';
		this.isBotPending = true;
		this.isBotRejected = false;
		this.isBotFulfilled = false;
	};

	private setBotRejected = (err: Error) => {
		this.botError = err;
		this.botStatus = 'rejected';
		this.isBotPending = false;
		this.isBotRejected = true;
		this.isBotFulfilled = false;
	};

	private setBotFulfilled = () => {
		this.botStatus = 'fulfilled';
		this.isBotPending = false;
		this.isBotRejected = false;
		this.isBotFulfilled = true;
	};

	setScopePending = () => {
		this.scopeStatus = "pending";
		this.isScopePending = true;
		this.isScopeFulfilled = false;
		this.isScopeRejected = false;
	};

	setScopeFulfilled = () => {
		this.scopeStatus = "fulfilled";
		this.isScopePending = false;
		this.isScopeFulfilled = true;
		this.isScopeRejected = false;
	};

	setScopeRejected = () => {
		this.scopeStatus = "rejected";
		this.isScopePending = false;
		this.isScopeFulfilled = false;
		this.isScopeRejected = true;
	};

	private setAddedToEndCount = (which: '+' | '-' | number) => {
		this.setFetchedCount('+');
		if (typeof which == 'number') this.addedToEndCount = which;
		if (which == '+') this.addedToEndCount = this.addedToEndCount + 1;
		else this.addedToEndCount = this.addedToEndCount - 1;
	};

	private setAddedToStartCount = (which: '+' | '-' | number) => {
		this.setFetchedCount('+');
		if (typeof which == 'number') this.addedToStartCount = which;
		if (which == '+') this.addedToStartCount = this.addedToStartCount + 1;
		else this.addedToStartCount = this.addedToStartCount - 1;
	};

	private setFetchedCount = (which: '+' | '-' | number) => {
		if (typeof which == 'number') this.fetchedCount = which;
		if (which == '+') this.fetchedCount = this.fetchedCount + 1;
		else this.fetchedCount = this.fetchedCount - 1;
	};

	private getPathValue = (obj: any, path: string): any => {
		return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
	};

	private setPathValue = (obj: any, path: string, value: any) => {
		const keys = path.split(".");
		let temp = obj;
		for (let i = 0; i < keys.length - 1; i++) {
			if (!temp[keys[i]]) temp[keys[i]] = {};
			temp = temp[keys[i]];
		}
		temp[keys[keys.length - 1]] = value;
	};

	/**
	 * Updates data in array or specific array element
	 *
	 * @param id - Element ID in array to update. If null - updates entire array
	 * @param key - Path to field for update or path to array (if id === null)
	 * @param updater - Update function or new value
	 * @param idKey - Key for finding element by ID (default 'id')
	 * @param cacheId - Request cache ID for synchronization (required parameter)
	 * @param updateCache - Cache update type: 'localStorage', 'localCache' or 'both'
	 */
	saiUpdater = <K extends NestedKeyOf<ExtractArrayElement<T> & { id: string | number; }>>(
		id: string | string[] | number | null,
		key: K | null,
		updater: UpdaterT<ExtractArrayElement<T> & { id: string | number; }, K> | ((prev: any[]) => any[]),
		idKey: string = 'id',
		cacheId?: string | string[] | number | null,
		updateCache?: UpdateCache
	): void => {
		if (!updater) {
			console.warn('[saiUpdater] updater is not defined');
			return;
		}

		if (!cacheId) {
			console.warn('[saiUpdater] cacheId is not defined');
			return;
		}

		if (!this.data) {
			console.warn('[saiUpdater] No data available');
			return;
		}

		const pathToArray = this.options?.pathToArray || key;

		if (!pathToArray) {
			console.warn('[saiUpdater] pathToArray is not defined in options');
			return;
		}

		let arrayData;
		try {
			arrayData = this.getPathValue(this.data, pathToArray);
		} catch (error) {
			console.warn('[saiUpdater] Error getting path value', error);
			return;
		}

		if (!Array.isArray(arrayData)) {
			console.warn('[saiUpdater] Data at pathToArray is not an array');
			return;
		}

		const targetCacheId = formatId(cacheId);

		if (id === null || key === null) {
			if (typeof updater !== 'function') {
				console.warn('[saiUpdater] updater must be a function when id === null or key === null');
				return;
			}

			const updaterFn = updater as (prev: any[]) => any[];

			const newArray = updaterFn(arrayData);

			if (!Array.isArray(newArray)) {
				console.warn('[saiUpdater] updater function must return an array');
				return;
			}

			runInAction(() => {
				arrayData.length = 0;
				arrayData.push(...newArray);
			});

			this.applyScopeLimit(arrayData);
			this.syncCacheAfterUpdate(targetCacheId, updateCache);

			return;
		}

		const mobxUpdater = new MobxUpdater();

		mobxUpdater.updateState(
			arrayData,
			formatId(id),
			key,
			updater as any,
			idKey,
			formatId(cacheId),
			updateCache
		);

		this.applyScopeLimit(arrayData);
		this.syncCacheAfterUpdate(targetCacheId, updateCache);
	};

	/**
	 * Applies scope limit to array data
	 */
	private applyScopeLimit(arrayData: any[]): void {
		const scopeLimit = this.options.dataScope?.scopeLimit;

		if (!scopeLimit || scopeLimit <= 0) {
			return;
		}

		if (arrayData.length <= scopeLimit) {
			return;
		}

		const excessCount = arrayData.length - scopeLimit;
		const startFrom = this.options.dataScope?.startFrom;

		runInAction(() => {
			if (startFrom === 'top') {
				arrayData.splice(arrayData.length - excessCount, excessCount);
				console.log(`[saiUpdater] 🔄 Applied scopeLimit (${scopeLimit}): removed ${excessCount} items from END (startFrom: top)`);
			} else {
				arrayData.splice(0, excessCount);
				console.log(`[saiUpdater] 🔄 Applied scopeLimit (${scopeLimit}): removed ${excessCount} items from START (startFrom: bot)`);
			}
		});
	}

	/**
	 * Syncs the current data state to cache
	 */
	private syncCacheAfterUpdate(targetCacheId?: string, updateCache?: UpdateCache): void {
		if (!targetCacheId || !updateCache) {
			return;
		}

		const dataToSync = JSON.parse(JSON.stringify(this.data));

		if (updateCache === 'localCache' || updateCache === 'both') {
			this.syncToLocalCache(targetCacheId, dataToSync);
		}

		if (updateCache === 'localStorage' || updateCache === 'both') {
			this.syncToLocalStorage(targetCacheId, dataToSync);
		}
	}

	/**
	 * Syncs data to local cache (in-memory)
	 */
	private syncToLocalCache(cacheId: string, data: T): void {
		try {
			const formattedId = formatId(cacheId);
			const cachedEntry = globalHttpManager.requestCache.get(formattedId);

			if (cachedEntry && cachedEntry.data) {
				runInAction(() => {
					cachedEntry.data.data = data;
				});
				console.log(`[saiUpdater] ✅ Synced to localCache: ${cacheId}`);
			} else {
				console.warn(`[saiUpdater] ⚠️ LocalCache entry not found for: ${cacheId}`);
			}
		} catch (error) {
			console.error(`[saiUpdater] ❌ Error syncing to localCache for ${cacheId}:`, error);
		}
	}

	/**
	 * Syncs data to localStorage
	 */
	private async syncToLocalStorage(cacheId: string, data: T): Promise<void> {
		try {
			const formattedId = formatId(cacheId);
			await globalHttpManager['saveToLocalStorage'](formattedId, data);
			console.log(`[saiUpdater] ✅ Synced to localStorage: ${cacheId}`);
		} catch (error) {
			console.error(`[saiUpdater] ❌ Error syncing to localStorage for ${cacheId}:`, error);
		}
	}

	value = () => this.data;
	errorMessage = () => this.error?.message || null;

	fetch = (promiseOrFunction: Promise<T> | (() => Promise<T>), fromWhere: 'fromScroll' | null = null, fetchWhat: 'top' | 'bot' | null = null): this => {
		logger.info(`[MobxSaiFetch.fetch]`, JSON.stringify({
			fromWhere,
			fetchWhat,
			isPending: this.isPending,
			isBotPending: this.isBotPending,
			isTopPending: this.isTopPending,
			hasData: !!this.data
		}));

		const {
			gettedToTop: { gettedToTop },
			isHaveMoreBot: { setIsHaveMoreBot, isHaveMoreBot },
			isHaveMoreTop: { setIsHaveMoreTop, isHaveMoreTop }
		} = this;
		const {
			fetchIfPending,
			fetchIfHaveData,
			needPending
		} = this.options;

		if (!fetchIfPending && this.isPending) {
			logger.info("HTTP request", "already pending and fetchIfPending is false - SKIPPING");
			return this;
		}

		if (!fetchIfHaveData && this.data && !fromWhere) {
			logger.info("Data already exists", "and fetchIfHaveData is false - SKIPPING");
			return this;
		}

		if (fetchWhat === 'bot' && !isHaveMoreBot) {
			logger.info("Skipping BOT fetch", "because isHaveMoreBot is false");
			return this;
		}

		if (fetchWhat === 'top' && !isHaveMoreTop) {
			logger.info("Skipping TOP fetch", "because isHaveMoreTop is false");
			return this;
		}

		if (fromWhere == null && fetchWhat == null) {
			if (needPending) {
				this.setIsPending();
			}
			this.error = null;
		} else {
			this.setScopePending();
		}

		this.promiseOrFunction = promiseOrFunction;

		logger.info(`[MobxSaiFetch.fetch]`, `✅ Calling sendRequest for ${fetchWhat || 'initial'} fetch`);

		const modifiedOptions = fromWhere === 'fromScroll'
			? { ...this.options, fetchIfHaveData: true, needPending: false }
			: this.options;

		logger.info(`[MobxSaiFetch.fetch] Options check:`, JSON.stringify({
			fetchAddToPath: modifiedOptions.fetchAddTo?.path,
			fetchAddToAddTo: modifiedOptions.fetchAddTo?.addTo,
			isSetData: modifiedOptions.isSetData,
			fetchIfHaveData: modifiedOptions.fetchIfHaveData,
			fetchWhat
		}));

		globalHttpManager.sendRequest(promiseOrFunction, this as any, modifiedOptions, fromWhere, fetchWhat);

		return this;
	};

	setScrollRef(scrollRef: any) {
		if (this.options.dataScope) {
			this.options.dataScope.scrollRef = scrollRef;

			const handleScroll = (event: any) => {
				const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
				const scrollTop = contentOffset.y;
				const scrollHeight = contentSize.height;
				const clientHeight = layoutMeasurement.height;

				this.handleScrollUpdate(scrollTop, scrollHeight, clientHeight);
			};

			this.options.dataScope.onScroll = handleScroll;
		}

		return this;
	}

	reset = (): this => {
		this.isPending = false;
		this.isFulfilled = false;
		this.isRejected = false;
		this.status = "pending";
		this.data = null;
		this.error = null;

		this.addedToEndCount = 0;
		this.addedToStartCount = 0;
		this.fetchedCount = 0;

		this.scrollProgress = 0;
		this.gettedToTop.setGettedToTop(0);
		this.scrollCachedData.setScrollCachedData([]);

		this.botStatus = "";
		this.topStatus = "";

		this.isBotPending = false;
		this.isBotRejected = false;
		this.isBotFulfilled = false;

		this.isTopPending = false;
		this.isTopRejected = false;
		this.isTopFulfilled = false;

		this.topError = null;
		this.botError = null;

		this.isHaveMoreBot.setIsHaveMoreBot(true);
		this.isHaveMoreTop.setIsHaveMoreTop(true);

		this.oldOptions = null;

		return this;
	};
}

