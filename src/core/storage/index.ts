import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'eventemitter3';
import * as FileSystem from 'expo-file-system';

const storageEvents = new EventEmitter();
// @ts-ignore
const IMAGE_CACHE_DIR = FileSystem.cacheDirectory + 'images/';

const isURL = (str: string): boolean => {
	try {
		new URL(str);
		return true;
	} catch {
		return false;
	}
};

const isImageURL = (url: string): boolean => {
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
	return imageExtensions.some(ext => url.toLowerCase().endsWith(ext)) || url.includes('/image/') || url.includes('/images/');
};

const hashString = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(36);
};

export interface CacheOptions {
	expiresIn?: number;
}

class LocalStorage {
	CHUNK_SIZE = 100;

	async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
		if (value === undefined) {
			console.warn(`Undefined passed to localStorage.set(${key}, ...) stopping function.\nIf you want to remove something use remove`);
			return;
		}

		try {
			if (typeof value === 'string' && isURL(value) && isImageURL(value)) {
				this.cacheImage(value, key, options).catch(err =>
					console.error('Error caching image:', err)
				);
				return;
			}

			const jsonValue = JSON.stringify(value);

			if (options?.expiresIn) {
				const expiresAt = Date.now() + options.expiresIn * 60 * 1000; // Convert minutes to milliseconds
				await AsyncStorage.setItem(`${key}_expires`, expiresAt.toString());
			}

			await AsyncStorage.setItem(key, jsonValue);
			storageEvents.emit('change', key, value);
		} catch (error) {
			console.error('Error saving data:', error);
		}
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			const expiresAt = await AsyncStorage.getItem(`${key}_expires`);
			if (expiresAt && parseInt(expiresAt) < Date.now()) {
				await this.remove(key);
				await AsyncStorage.removeItem(`${key}_expires`);
				return null;
			}

			const cachedImagePath = await AsyncStorage.getItem(`${key}_image_path`);
			if (cachedImagePath) {
				const fileInfo = await FileSystem.getInfoAsync(cachedImagePath);
				if (fileInfo.exists) {
					return cachedImagePath as unknown as T;
				} else {
					await this.remove(key);
					await AsyncStorage.removeItem(`${key}_image_path`);
					return null;
				}
			}

			const value = await AsyncStorage.getItem(key);

			if (!value) {
				console.warn(`Key "${key}" not found in storage, returning null`);
				return null;
			}

			return JSON.parse(value) as T;
		} catch (error) {
			console.error('Error getting data:', error);
			return null;
		}
	}

	async remove(key: string): Promise<void> {
		await AsyncStorage.removeItem(key);
	}

	async clear(): Promise<void> {
		await AsyncStorage.clear();
	}

	async has(key: string): Promise<boolean> {
		const value = await AsyncStorage.getItem(key);
		return value !== null;
	}

	async getAllKeys(): Promise<string[]> {
		try {
			const keys = await AsyncStorage.getAllKeys();
			return Array.from(keys);
		} catch (error) {
			console.error('Error getting all keys:', error);
			return [];
		}
	}

	subscribe(key: string, callback: (value: any) => void): () => void {
		const handler = (changedKey: string, value: any) => {
			if (key === changedKey) {
				callback(value);
			}
		};

		storageEvents.on('change', handler);

		return () => {
			storageEvents.off('change', handler);
		};
	}

	async cacheImage(url: string, key: string, options?: CacheOptions): Promise<string> {
		if (!url) return '';

		const filename = hashString(url) + '.jpg';
		const localPath = IMAGE_CACHE_DIR + filename;

		try {
			await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
		} catch (_) {
		}

		try {
			const fileInfo = await FileSystem.getInfoAsync(localPath);

			if (!fileInfo.exists) {
				const download = await FileSystem.downloadAsync(url, localPath);
				await AsyncStorage.setItem(`${key}_image_path`, download.uri);

				if (options?.expiresIn) {
					const expiresAt = Date.now() + options.expiresIn * 60 * 1000;
					await AsyncStorage.setItem(`${key}_expires`, expiresAt.toString());
				}

				return download.uri;
			}

			await AsyncStorage.setItem(`${key}_image_path`, localPath);
			return localPath;
		} catch (e) {
			console.warn('Image download failed:', e);
			return url;
		}
	}

	async getImage(url: string, options?: CacheOptions): Promise<string> {
		if (!url) return '';

		const key = `img_${hashString(url)}`;
		const cachedPath = await AsyncStorage.getItem(`${key}_image_path`);

		if (cachedPath) {
			const expiresAt = await AsyncStorage.getItem(`${key}_expires`);
			const isExpired = expiresAt && parseInt(expiresAt) < Date.now();

			if (isExpired) {
				await AsyncStorage.removeItem(`${key}_image_path`);
				await AsyncStorage.removeItem(`${key}_expires`);
			} else {
				const fileInfo = await FileSystem.getInfoAsync(cachedPath);
				if (fileInfo.exists) {
					return cachedPath;
				}
			}
		}

		return this.cacheImage(url, key, options);
	}

	async preloadImages(urls: string[], options?: CacheOptions): Promise<void> {
		await Promise.all(urls.map(url => this.getImage(url, options)));
	}

	clearAllImages(): Promise<void> {
		return FileSystem.deleteAsync(IMAGE_CACHE_DIR, { idempotent: true });
	}

	async getExpiredCacheKeys(): Promise<string[]> {
		const allKeys = await this.getAllKeys();
		const expiredKeys: string[] = [];

		for (const key of allKeys) {
			if (key.endsWith('_expires')) {
				const expiresAt = await AsyncStorage.getItem(key);
				if (expiresAt && parseInt(expiresAt) < Date.now()) {
					expiredKeys.push(key.replace('_expires', ''));
				}
			}
		}

		return expiredKeys;
	}

	async cleanExpiredCache(): Promise<void> {
		const expiredKeys = await this.getExpiredCacheKeys();
		for (const key of expiredKeys) {
			await this.remove(key);
			await AsyncStorage.removeItem(`${key}_expires`);
			await AsyncStorage.removeItem(`${key}_image_path`);
		}
	}
}

export const localStorage = new LocalStorage();

export const initLocalStorage = async () => {
	await localStorage.cleanExpiredCache();
};

export * from './AppStorage';
export * from './CacheManager';

