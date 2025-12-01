import { appStorage } from '@storage/AppStorage';
import * as FileSystem from 'expo-file-system';
import { makeAutoObservable, runInAction } from 'mobx';
import { mobxState } from 'mobx-toolbox';
import { memoryServiceStore } from '../memory-services/memory-services';
import { AutoDeleteSettings, MemoryUsageStats, SelectedCachedDataT, WhichCacheItemT } from './types';

class MemoryStore {
	constructor() {
		makeAutoObservable(this, {}, { deep: false });
		this.loadAutoDeleteSettings();
	}

	selectedCachedData = mobxState<SelectedCachedDataT | null>(null)("selectedCachedData");
	selectedCachedDataItems = mobxState<any[]>([])("selectedCachedDataItems");

	memoryUsage: MemoryUsageStats = {
		total: 0,
		images: 0,
		photos: 0,
		videos: 0,
		stories: 0,
		audio: 0,
		files: 0,
		other: 0,
		isLoading: false
	};

	autoDeleteSettings: AutoDeleteSettings = {
		personalChats: 'never',
		groups: '1_month'
	};

	whichCacheItem = mobxState<WhichCacheItemT | null>(null)("whichCacheItem");

	loadAutoDeleteSettings = async () => {
		try {
			const settings = await appStorage.getData<AutoDeleteSettings>('auto_delete_settings');
			if (settings) {
				runInAction(() => {
					this.autoDeleteSettings = settings;
				});
			}
		} catch (error) {
			console.error('Error loading auto delete settings:', error);
		}
	};

	saveAutoDeleteSettings = async () => {
		try {
			await appStorage.setData('auto_delete_settings', this.autoDeleteSettings);
		} catch (error) {
			console.error('Error saving auto delete settings:', error);
		}
	};

	setPersonalChatsAutoDelete = (value: string) => {
		this.autoDeleteSettings.personalChats = value;
		this.saveAutoDeleteSettings();
	};

	setGroupsAutoDelete = (value: string) => {
		this.autoDeleteSettings.groups = value;
		this.saveAutoDeleteSettings();
	};

	calculateMemoryUsage = async () => {
		const { getOtherCacheItems } = memoryServiceStore;

		this.memoryUsage.isLoading = true;

		try {
			const [imagesInfo, photosInfo, videosInfo, storiesInfo, audioInfo, filesInfo] = await Promise.all([
				FileSystem.getInfoAsync(FileSystem.cacheDirectory + 'images/', { size: true }),
				FileSystem.getInfoAsync(FileSystem.cacheDirectory + 'photos/', { size: true }),
				FileSystem.getInfoAsync(FileSystem.cacheDirectory + 'videos/', { size: true }),
				FileSystem.getInfoAsync(FileSystem.cacheDirectory + 'stories/', { size: true }),
				FileSystem.getInfoAsync(FileSystem.cacheDirectory + 'audio/', { size: true }),
				FileSystem.getInfoAsync(FileSystem.cacheDirectory + 'files/', { size: true })
			]);

			const { totalSize: otherSize } = await getOtherCacheItems(false);

			runInAction(() => {
				this.memoryUsage = {
					images: imagesInfo.exists ? imagesInfo.size : 0,
					videos: videosInfo.exists ? videosInfo.size : 0,
					photos: photosInfo.exists ? photosInfo.size : 0,
					stories: storiesInfo.exists ? storiesInfo.size : 0,
					audio: audioInfo.exists ? audioInfo.size : 0,
					files: filesInfo.exists ? filesInfo.size : 0,
					other: otherSize,
					total:
						(imagesInfo.exists ? imagesInfo.size : 0) +
						(videosInfo.exists ? videosInfo.size : 0) +
						(photosInfo.exists ? photosInfo.size : 0) +
						(audioInfo.exists ? audioInfo.size : 0) +
						(filesInfo.exists ? filesInfo.size : 0) +
						otherSize,
					isLoading: false
				};
			});
		} catch (error) {
			console.error('Error calculating memory usage:', error);
			runInAction(() => {
				this.memoryUsage.isLoading = false;
			});
		}
	};

	getCachedMediaItems = () => {
		const {
			imagesCacheItems: { imagesCacheItems },
			otherCacheItems: { otherCacheItems }
		} = memoryServiceStore;
		const { whichCacheItem: { whichCacheItem } } = memoryStore;

		const cacheDatas = {
			"CachedOther": { items: otherCacheItems?.items || [] },
			"CachedImages": { items: imagesCacheItems?.items || [] },
			"CachedPhotos": { items: otherCacheItems?.items || [] },
			"CachedVideos": { items: otherCacheItems?.items || [] },
			"CachedFiles": { items: otherCacheItems?.items || [] },
			"CachedStories": { items: otherCacheItems?.items || [] },
			"CachedAudio": { items: otherCacheItems?.items || [] },
		};

		return cacheDatas[whichCacheItem as keyof typeof cacheDatas];
	};

	getWhichCacheItem = () => {
		const { whichCacheItem: { whichCacheItem } } = memoryStore;
		return whichCacheItem;
	};

}

export const memoryStore = new MemoryStore(); 