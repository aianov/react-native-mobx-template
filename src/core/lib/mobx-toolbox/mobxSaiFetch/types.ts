import { MobxStateWithGetterAndSetter, NestedKeyOf, UpdaterT } from 'mobx-toolbox';
import { UpdateCache } from '../useMobxUpdate';

// ============= BASE TYPES =============

/**
 * Strategy for selecting relative_id for scrolling
 */
export type RelativeIdSelectStrategy = 'default' | 'reversed';

/**
 * Scroll direction strategy (up/down)
 */
export type UpStrategy = 'default' | 'reversed';

/**
 * Cache priority when loading data
 */
export type CachePriority = 'localStorage' | 'localCache';

// ============= CACHE SYSTEM OPTIONS =============

export interface MobxSaiFetchCacheSystemOptions {
	limit?: number | null;
	setCache?: null | ((newValue: any[] | ((prev: any[]) => any[])) => void);
}

// ============= FETCH ADD TO OPTIONS =============

export interface MobxSaiFetchFetchAddToOptions {
	path?: string | null;
	addTo?: "start" | "end" | "reset";
	isSetReversedArr?: boolean | null;
	isSetPrevArr?: boolean | null;
	setArrCallback?: null | ((newValue: any[] | ((prev: any[]) => any[])) => void);
}

// ============= DATA SCOPE OPTIONS =============

export interface MobxSaiFetchDataScopeOptions {
	class: string | null;
	scopeLimit: number | null;
	startFrom: 'bot' | 'top';
	scrollRef?: any;
	onScroll?: (event: any) => void;
	topPercentage: number | null;
	botPercentage: number | null;
	relativeParamsKey: string | null;
	relativeIdSelectStrategy?: RelativeIdSelectStrategy;
	upStrategy?: UpStrategy;
	upOrDownParamsKey: string | null;
	isHaveMoreResKey: string | null;
	howMuchGettedToTop: number;
	setParams: null | ((newValue: any[] | ((prev: any[]) => any[])) => void) | any;
}

// ============= OPTIMISTIC UPDATES =============

export interface OptimisticUpdateOptions<T = any> {
	enabled: boolean;
	updateCache?: UpdateCache;
	createTempData: (body: any, context?: any) => T;
	tempIdKey?: string;
	tempFlag?: string;
	addStrategy?: 'start' | 'end';
	insertAfterLastTemp?: boolean;
	onSuccess?: (tempData: T, realData: any) => void;
	onError?: (tempData: T, error: any) => boolean;
	extractRealData?: (response: any) => any;
	matchTempWithReal?: (tempData: T, realData: any) => boolean;
	targetCacheId?: string;
}

// ============= QUEUE STRATEGY =============

export interface QueueStrategyOptions {
	enabled: boolean;
	sequential?: boolean;
	delay?: number;
	retry?: {
		maxAttempts: number;
		backoff?: 'linear' | 'exponential';
		baseDelay?: number;
		retryOn?: (error: any) => boolean;
	};
}

// ============= MAIN OPTIONS =============

export interface MobxSaiFetchOptions<T = any> {
	id?: string | string[];
	pathToArray?: string;
	setData?: (data: T) => void;
	isSetData?: boolean;
	cacheSystem?: Partial<MobxSaiFetchCacheSystemOptions>;
	dataScope?: Partial<MobxSaiFetchDataScopeOptions>;
	fetchAddTo?: Partial<MobxSaiFetchFetchAddToOptions>;
	fetchIfHaveData?: boolean;
	fetchIfPending?: boolean;
	fetchIfHaveLocalStorage?: boolean;
	takeCachePriority?: CachePriority;
	shadowFirstRequest?: boolean;
	storageCache?: boolean;
	needPending?: boolean;
	maxLocalStorageCache?: number;
	maxCacheData?: number;
	takePath?: string;
	page?: MobxStateWithGetterAndSetter<number, string> | null;
	pageSetterName?: string | null;
	fetchType?: "default" | "pagination";
	optimisticUpdate?: OptimisticUpdateOptions;
	queueStrategy?: QueueStrategyOptions;
	onSuccess?: (data: T, fetchParams?: any) => void;
	onError?: (error: any, fetchParams?: any) => void;
	onCacheUsed?: (data: T, fetchParams?: any, takeCachePriority?: CachePriority) => void;

	// HTTP-specific options
	url?: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	headers?: Record<string, string>;
	timeout?: number;
	credentials?: RequestCredentials;
	mode?: RequestMode;
	cache?: RequestCache;
	redirect?: RequestRedirect;
	referrer?: string;
	referrerPolicy?: ReferrerPolicy;
	integrity?: string;
	keepalive?: boolean;
	signal?: AbortSignal;
	baseURL?: string;
}

// ============= INSTANCE TYPE =============

export type ExtractArrayElement<T> = T extends (infer U)[] ? U : T;

export type EnsureIdentifiable<T> = ExtractArrayElement<T> extends { id: string | number; }
	? ExtractArrayElement<T>
	: ExtractArrayElement<T> & { id: string | number; };

export type MobxSaiFetchInstance<T> = Partial<{
	status: "pending" | "fulfilled" | "rejected";
	scopeStatus: "pending" | "fulfilled" | "rejected";
	data: T | null;
	error: Error | null;
	body: any;

	isPending: boolean;
	isFulfilled: boolean;
	isRejected: boolean;

	isScopePending: boolean;
	isScopeFulfilled: boolean;
	isScopeRejected: boolean;

	setIsPending: () => void;
	setIsFulfilled: () => void;
	setIsRejected: () => void;

	setScopePending: () => void;
	setScopeFulfilled: () => void;
	setScopeRejected: () => void;

	options: MobxSaiFetchOptions;

	addedToEndCount: number;
	addedToStartCount: number;
	fetchedCount: number;

	scrollProgress: number;
	gettedToTop: MobxStateWithGetterAndSetter<'gettedToTop', number>;
	botStatus: "pending" | "fulfilled" | "rejected" | "";
	topStatus: "pending" | "fulfilled" | "rejected" | "";
	scrollCachedData: MobxStateWithGetterAndSetter<'scrollCachedData', any[]>;

	isBotPending: boolean;
	isBotRejected: boolean;
	isBotFulfilled: boolean;

	isTopPending: boolean;
	isTopRejected: boolean;
	isTopFulfilled: boolean;

	topError: Error | null;
	botError: Error | null;

	isHaveMoreBot: MobxStateWithGetterAndSetter<'isHaveMoreBot', boolean>;
	isHaveMoreTop: MobxStateWithGetterAndSetter<'isHaveMoreTop', boolean>;

	saiUpdater: <K extends NestedKeyOf<EnsureIdentifiable<T>>>(
		id: string | string[] | number | null,
		key: K | null,
		updater: UpdaterT<EnsureIdentifiable<T>, K> | ((prev: any[]) => any[]),
		idKey?: string,
		cacheId?: string | string[] | number | null,
		updateCache?: UpdateCache
	) => void;

	value: () => T | null;
	errorMessage: () => string | null;
	fetch: (
		promiseOrFunction: Promise<T> | (() => Promise<T>),
		fromWhere?: "fromScroll" | null,
		fetchWhat?: "top" | "bot" | null
	) => MobxSaiFetchInstance<T>;
	setScrollRef: (scrollRef: any) => MobxSaiFetchInstance<T>;
	reset: () => MobxSaiFetchInstance<T>;
}>;

// ============= CACHE ENTRY =============

export interface CacheEntry {
	timestamp: number;
	data: MobxSaiFetchInstance<any>;
	options: MobxSaiFetchOptions;
	fromLocalStorage?: boolean;
}

// ============= DEBUG HISTORY =============

export interface RequestHistoryItem {
	id: string;
	timestamp: number;
	type: 'request' | 'response';
	url?: string;
	method?: string;
	data?: any;
	error?: any;
	cached?: boolean;
	cacheKey?: string;
	requestId?: string;
}

export interface RequestResponsePair {
	id: string;
	request: RequestHistoryItem;
	response?: RequestHistoryItem;
	methodUrl: string;
	timestamp: number;
	cached?: boolean;
	localCached?: boolean;
	forceFetch?: boolean;
	noPending?: boolean;
	takePath?: string;
	repeatCount: number;
	lastRepeatTimestamp: number;
}

// ============= CACHE UPDATE HISTORY =============

export interface CacheUpdateHistoryItem {
	id: string;
	timestamp: number;
	updateType: 'saiUpdater' | 'saiLocalCacheUpdater' | 'saiLocalStorageUpdater' | 'saiCacheUpdater';
	cacheId: string;
	changes: any;
	success: boolean;
	error?: string;
}
