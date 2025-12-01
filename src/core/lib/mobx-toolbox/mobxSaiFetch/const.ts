import { MobxSaiFetchOptions } from './types';

export const defaultFetchOptions: MobxSaiFetchOptions = {
	fetchIfPending: false,
	fetchIfHaveData: true,
	fetchIfHaveLocalStorage: true,
	takeCachePriority: 'localCache',
	storageCache: false,
	isSetData: true,
	needPending: true,
	maxCacheData: 100,
	maxLocalStorageCache: 100,
	shadowFirstRequest: false,
	cacheSystem: {
		limit: null,
		setCache: () => { }
	},
	dataScope: {
		startFrom: 'top',
		topPercentage: null,
		botPercentage: null,
		relativeParamsKey: null,
		relativeIdSelectStrategy: 'default',
		upStrategy: 'default',
		upOrDownParamsKey: null,
		isHaveMoreResKey: null,
		howMuchGettedToTop: 0,
		setParams: null,
		class: null,
		scopeLimit: null
	},
	fetchAddTo: {
		path: '',
		addTo: 'reset',
		isSetReversedArr: false,
		isSetPrevArr: false,
		setArrCallback: null
	}
};

