export interface MemoryUsageStats {
	total: number; // Общий размер кэша в байтах
	images: number; // Размер изображений в байтах
	photos: number; // Размер фотографий в байтах
	files: number; // Размер других файлов в байтах
	videos: number; // Размер видео в байтах
	stories: number; // Размер историй в байтах
	audio: number; // Размер аудио в байтах
	other: number; // Размер прочих данных в байтах
	isLoading: boolean;
}

export interface AutoDeleteSettings {
	personalChats: string; // "never" | "1_week" | "1_month" | "3_months"
	groups: string; // "never" | "1_week" | "1_month" | "3_months"
}

export type SelectedCachedDataT = "personal_chats" | "groups" | "profiles";

export type WhichCacheItemT = "CachedOther" | "CachedImages" | "CachedPhotos" | "CachedVideos" | "CachedFiles" | "CachedStories" | "CachedAudio";