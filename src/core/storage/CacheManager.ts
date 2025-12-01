import { makeAutoObservable } from "mobx";
import { CacheOptions, localStorage } from "./index";

export class CacheManager {
	constructor() { makeAutoObservable(this); }

	defaultCacheTime: number = 60 * 24; // 1 day in minutes
	imageCacheTime: number = 60 * 24 * 7; // 1 week in minutes

	setDefaultCacheTime(minutes: number) {
		this.defaultCacheTime = minutes;
	}

	setImageCacheTime(minutes: number) {
		this.imageCacheTime = minutes;
	}

	async cacheImage(url: string, options?: CacheOptions): Promise<string> {
		const cacheOptions = {
			expiresIn: options?.expiresIn || this.imageCacheTime
		};
		return localStorage.getImage(url, cacheOptions);
	}

	async preloadImages(urls: string[], options?: CacheOptions): Promise<void> {
		const cacheOptions = {
			expiresIn: options?.expiresIn || this.imageCacheTime
		};
		return localStorage.preloadImages(urls, cacheOptions);
	}

	async clearCache(): Promise<void> {
		await localStorage.clearAllImages();
		localStorage.clear();
	}

	async clearExpiredCache(): Promise<void> {
		await localStorage.cleanExpiredCache();
	}

	async getCacheSize(): Promise<number> {
		try {
			const keys = await localStorage.getAllKeys();
			return keys.length;
		} catch (error) {
			console.error('Error getting cache size:', error);
			return 0;
		}
	}

	set<T>(key: string, value: T, options?: CacheOptions): void {
		const cacheOptions = {
			expiresIn: options?.expiresIn || this.defaultCacheTime
		};
		localStorage.set(key, value, cacheOptions);
	}

	async get<T>(key: string): Promise<T | null> {
		return localStorage.get<T>(key);
	}

	remove(key: string): void {
		localStorage.remove(key);
	}
}

export const cacheManager = new CacheManager();