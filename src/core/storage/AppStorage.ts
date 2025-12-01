import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'eventemitter3';
import * as FileSystem from 'expo-file-system';

const storageEvents = new EventEmitter();
const IMAGE_CACHE_DIR = FileSystem.cacheDirectory + 'images/';
const VIDEO_CACHE_DIR = FileSystem.cacheDirectory + 'videos/';
const AUDIO_CACHE_DIR = FileSystem.cacheDirectory + 'audio/';
const FILE_CACHE_DIR = FileSystem.cacheDirectory + 'files/';

const isURL = (str: string): boolean => {
	try {
		new URL(str);
		return true;
	} catch {
		return false;
	}
};

const getFileExtension = (path: string): string => {
	const match = /\.([^.]+)$/.exec(path);
	return match ? match[1].toLowerCase() : '';
};

const getMediaType = (url: string): 'image' | 'video' | 'audio' | 'file' => {
	const ext = getFileExtension(url);

	if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
		return 'image';
	}

	if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
		return 'video';
	}

	if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext)) {
		return 'audio';
	}

	return 'file';
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

export class AppStorage {
	async setData<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
		if (value === undefined) {
			console.warn(`Передано undefined в AppStorage.setData(${key}, ...). Если хотите удалить данные, используйте removeData`);
			return;
		}

		try {
			const jsonValue = JSON.stringify(value);
			await AsyncStorage.setItem(key, jsonValue);

			if (options?.expiresIn) {
				const expiresAt = Date.now() + options.expiresIn * 60 * 1000;
				await AsyncStorage.setItem(`${key}_expires`, expiresAt.toString());
			}

			storageEvents.emit('change', key, value);
		} catch (error) {
			console.error('Ошибка при сохранении данных:', error);
		}
	}

	async getData<T>(key: string): Promise<T | null> {
		try {
			const expiresAt = await AsyncStorage.getItem(`${key}_expires`);
			if (expiresAt && parseInt(expiresAt) < Date.now()) {
				await this.removeData(key);
				await AsyncStorage.removeItem(`${key}_expires`);
				return null;
			}

			const value = await AsyncStorage.getItem(key);
			if (!value) {
				return null;
			}

			if (!isNaN(Number(value))) {
				return Number(value) as unknown as T;
			}

			if (value.trim()[0] !== '{' && value.trim()[0] !== '[') {
				return value as unknown as T;
			}

			try {
				return JSON.parse(value) as T;
			} catch (parseError) {
				console.error('Ошибка при парсинге JSON:', parseError);
				return value as unknown as T;
			}
		} catch (error) {
			console.error('Ошибка при получении данных:', error);
			return null;
		}
	}

	async removeData(key: string): Promise<void> {
		await AsyncStorage.removeItem(key);
		await AsyncStorage.removeItem(`${key}_expires`);
	}

	async saveMedia(url: string, customKey?: string): Promise<string> {
		if (!url) return '';

		const mediaType = getMediaType(url);
		const key = customKey || `${mediaType}_${hashString(url)}`;
		const ext = getFileExtension(url) || 'dat';
		const filename = `${hashString(url)}.${ext}`;

		let cacheDir;
		switch (mediaType) {
			case 'image': cacheDir = IMAGE_CACHE_DIR; break;
			case 'video': cacheDir = VIDEO_CACHE_DIR; break;
			case 'audio': cacheDir = AUDIO_CACHE_DIR; break;
			default: cacheDir = FILE_CACHE_DIR;
		}

		const localPath = cacheDir + filename;

		try {
			await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });

			const fileInfo = await FileSystem.getInfoAsync(localPath);

			if (!fileInfo.exists) {
				if (isURL(url)) {
					const download = await FileSystem.downloadAsync(url, localPath);
					await AsyncStorage.setItem(`${key}_path`, download.uri);
					return download.uri;
				} else {
					console.warn('Cannot save non-URL media');
					return url;
				}
			}

			await AsyncStorage.setItem(`${key}_path`, localPath);
			return localPath;
		} catch (error) {
			console.error(`Error saving ${mediaType}:`, error);
			return url;
		}
	}

	async getMedia(key: string): Promise<string | null> {
		try {
			const path = await AsyncStorage.getItem(`${key}_path`);
			if (!path) return null;

			const fileInfo = await FileSystem.getInfoAsync(path);
			if (fileInfo.exists) {
				return path;
			} else {
				await AsyncStorage.removeItem(`${key}_path`);
				return null;
			}
		} catch (error) {
			console.error('Error getting media:', error);
			return null;
		}
	}

	async removeMedia(key: string): Promise<void> {
		try {
			const path = await AsyncStorage.getItem(`${key}_path`);
			if (path) {
				const fileInfo = await FileSystem.getInfoAsync(path);
				if (fileInfo.exists) {
					await FileSystem.deleteAsync(path, { idempotent: true });
				}
				await AsyncStorage.removeItem(`${key}_path`);
			}
		} catch (error) {
			console.error('Error removing media:', error);
		}
	}

	async batchSaveMedia(urls: string[]): Promise<Record<string, string>> {
		const results: Record<string, string> = {};
		await Promise.all(
			urls.map(async (url) => {
				const mediaType = getMediaType(url);
				const key = `${mediaType}_${hashString(url)}`;
				const path = await this.saveMedia(url, key);
				results[url] = path;
			})
		);
		return results;
	}

	async clearAll(): Promise<void> {
		await AsyncStorage.clear();
		await this.clearAllMedia();
	}

	async clearAllMedia(): Promise<void> {
		try {
			await FileSystem.deleteAsync(IMAGE_CACHE_DIR, { idempotent: true });
			await FileSystem.deleteAsync(VIDEO_CACHE_DIR, { idempotent: true });
			await FileSystem.deleteAsync(AUDIO_CACHE_DIR, { idempotent: true });
			await FileSystem.deleteAsync(FILE_CACHE_DIR, { idempotent: true });
		} catch (error) {
			console.error('Error clearing media cache:', error);
		}
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
}

export const appStorage = new AppStorage();

export const initAppStorage = async () => {
	try {
		await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
		await FileSystem.makeDirectoryAsync(VIDEO_CACHE_DIR, { intermediates: true });
		await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
		await FileSystem.makeDirectoryAsync(FILE_CACHE_DIR, { intermediates: true });
	} catch (error) {
		console.error('Error initializing app storage:', error);
	}
}; 