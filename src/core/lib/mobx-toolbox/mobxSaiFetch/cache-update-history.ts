import { makeAutoObservable } from 'mobx';
import { CacheUpdateHistoryItem } from './types';

export class CacheUpdateHistory {
	public updates: CacheUpdateHistoryItem[] = [];

	constructor() {
		makeAutoObservable(this);
	}

	addUpdate(
		updateType: 'saiUpdater' | 'saiLocalCacheUpdater' | 'saiLocalStorageUpdater' | 'saiCacheUpdater',
		cacheId: string,
		changes: CacheUpdateHistoryItem['changes'],
		success: boolean,
		error?: string
	) {
		const update: CacheUpdateHistoryItem = {
			id: `update_${Date.now()}_${Math.random()}`,
			timestamp: Date.now(),
			updateType,
			cacheId,
			changes,
			success,
			error
		};

		this.updates.unshift(update);
		this.limitSize();
	}

	private limitSize() {
		if (this.updates.length > 100) {
			this.updates = this.updates.slice(0, 100);
		}
	}

	clear() {
		this.updates = [];
	}
}

