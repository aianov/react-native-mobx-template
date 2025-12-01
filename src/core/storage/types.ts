// Common types for storage
export interface CacheOptions {
	expiresIn?: number;
}

export const isURL = (str: string): boolean => {
	try {
		new URL(str);
		return true;
	} catch {
		return false;
	}
};

// Utility function to check if a URL is an image
export const isImageURL = (url: string): boolean => {
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
	return imageExtensions.some(ext => url.toLowerCase().endsWith(ext)) || url.includes('/image/') || url.includes('/images/');
};

// Utility function to hash a string (for file names)
export const hashString = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(36);
};