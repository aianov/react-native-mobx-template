import { appStorage } from '@storage/index';
import * as FileSystem from 'expo-file-system';
import { makeAutoObservable } from 'mobx';
import { mobxState } from 'mobx-toolbox';
import { memoryStore } from '../memory-interactions/memory-store';

const hashString = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(36);
};

export const EXCLUDED_KEYS = [
	'auth_cookie_backup',
	'auth_domain_backup',
	'device_id',
	"tokens"
];
class MemoryServiceStore {
	constructor() {
		makeAutoObservable(this);
	}

	getCachedChats = async () => {
		const chats = await appStorage.getData('cached_chats');
		return chats;
	};

	// OTHER CACHE ITEMS

	otherCacheItems = mobxState<any>(null)("otherCacheItems");
	otherCacheItemsLoading = false;

	getOtherCacheItems = async (withLoading = true) => {
		if (withLoading) this.otherCacheItemsLoading = true;
		try {
			const keys = await appStorage.getAllKeys();
			const items = [];
			let totalSize = 0;

			for (const key of keys) {
				if (EXCLUDED_KEYS.includes(key)) continue;

				const value = await appStorage.getData(key);
				if (value) {
					const size = JSON.stringify(value).length;
					items.push({
						key,
						value,
						size
					});
					totalSize += size;
				}
			}

			this.otherCacheItems.setOtherCacheItems({ items, totalSize });

			return { items, totalSize };
		} catch (error) {
			console.error('Error getting other cache items:', error);
			this.otherCacheItems.setOtherCacheItems({ items: [], totalSize: 0 });
			return { items: [], totalSize: 0 };
		} finally {
			if (withLoading) this.otherCacheItemsLoading = false;
		}
	};

	deleteOtherCacheItem = async (key: string) => {
		const { calculateMemoryUsage } = memoryStore;

		try {
			if (EXCLUDED_KEYS.includes(key)) {
				console.warn(`Attempted to delete excluded key: ${key}`);
				return false;
			}

			await appStorage.removeData(key);
			await calculateMemoryUsage();

			this.otherCacheItems.setOtherCacheItems((prev: any) => ({
				...prev,
				items: prev.items.filter((item: any) => item.key !== key)
			}));

			return true;
		} catch (error) {
			console.error(`Error deleting cache item ${key}:`, error);
			return false;
		}
	};

	// IMAGES CACHE ITEMS

	imagesCacheItems = mobxState<any>({ items: [] })("imagesCacheItems");
	imagesCacheItemsLoading = false;

	getImagesCacheItems = async (withLoading = true) => {
		if (withLoading) this.imagesCacheItemsLoading = true;
		try {
			const allKeys = await appStorage.getAllKeys();
			const imageKeys = allKeys.filter(key =>
				(key.startsWith('image_') || key.startsWith('media_image_')) &&
				key.endsWith('_path')
			);

			const items = [];

			for (const key of imageKeys) {
				try {
					const imagePath = await appStorage.getData<string>(key);

					if (imagePath) {
						const fileInfo = await FileSystem.getInfoAsync(imagePath);

						if (fileInfo.exists) {
							const uri = imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`;
							items.push({
								key: key.replace(/_path$/, ''),
								uri
							});
						} else {
							await appStorage.removeData(key);
						}
					}
				} catch (err) {
					console.log('Error processing key', key, ':', err);
				}
			}

			this.imagesCacheItems.setImagesCacheItems({ items });
			return { items };
		} catch (error) {
			console.error('Error getting images cache items:', error);
			this.imagesCacheItems.setImagesCacheItems({ items: [] });
			return { items: [] };
		} finally {
			if (withLoading) this.imagesCacheItemsLoading = false;
		}
	};

	deleteImagesCacheItem = async (key: string) => {
		const { calculateMemoryUsage } = memoryStore;

		try {
			const imagePath = await appStorage.getMedia(key);
			if (imagePath) {
				await FileSystem.deleteAsync(imagePath, { idempotent: true });
				await appStorage.removeData(key);
			}
			await calculateMemoryUsage();

			this.imagesCacheItems.setImagesCacheItems((prev: any) => ({
				...prev,
				items: prev.items.filter((item: any) => item.key !== key)
			}));

			return true;
		} catch (error) {
			console.error(`Error deleting cache item ${key}:`, error);
			return false;
		}
	};

	// CLEAR FUNCTIONS

	clearAllCache = async () => {
		const { calculateMemoryUsage } = memoryStore;

		try {
			const savedValues: Record<string, any> = {};
			for (const key of EXCLUDED_KEYS) {
				const value = await appStorage.getData(key);
				if (value) {
					savedValues[key] = value;
				}
			}

			await appStorage.clearAll();

			for (const [key, value] of Object.entries(savedValues)) {
				await appStorage.setData(key, value);
			}

			await calculateMemoryUsage();
			return true;
		} catch (error) {
			console.error('Error clearing cache:', error);
			return false;
		}
	};

	clearImagesCache = async () => {
		const { calculateMemoryUsage } = memoryStore;

		try {
			await FileSystem.deleteAsync(FileSystem.cacheDirectory + 'images/', { idempotent: true });
			await calculateMemoryUsage();
			return true;
		} catch (error) {
			console.error('Error clearing images cache:', error);
			return false;
		}
	};

	clearVideosCache = async () => {
		const { calculateMemoryUsage } = memoryStore;

		try {
			await FileSystem.deleteAsync(FileSystem.cacheDirectory + 'videos/', { idempotent: true });
			await calculateMemoryUsage();
			return true;
		} catch (error) {
			console.error('Error clearing videos cache:', error);
			return false;
		}
	};

	clearAudioCache = async () => {
		const { calculateMemoryUsage } = memoryStore;

		try {
			await FileSystem.deleteAsync(FileSystem.cacheDirectory + 'audio/', { idempotent: true });
			await calculateMemoryUsage();
			return true;
		} catch (error) {
			console.error('Error clearing audio cache:', error);
			return false;
		}
	};

	clearFilesCache = async () => {
		const { calculateMemoryUsage } = memoryStore;

		try {
			await FileSystem.deleteAsync(FileSystem.cacheDirectory + 'files/', { idempotent: true });
			await calculateMemoryUsage();
			return true;
		} catch (error) {
			console.error('Error clearing files cache:', error);
			return false;
		}
	};
}

export const memoryServiceStore = new MemoryServiceStore();