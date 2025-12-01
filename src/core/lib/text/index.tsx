import { MainText } from '@core/ui';

const formatText = (text: string, px: number = 13) => {
	return (
		<MainText px={px}>
			{text}
		</MainText>
	);
};

export { formatText };

/**
 * Formats bytes to human readable format (KB, MB, GB)
 * @param bytes - size in bytes
 * @param decimals - decimal places
 * @returns formatted string
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
	if (bytes === 0) return '0 B';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats number with thousands separators
 * @param num - number to format
 * @returns formatted string
 */
export function formatNumber(num: number): string {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Formats percentage
 * @param value - value (0-100)
 * @param decimals - decimal places
 * @returns formatted string with percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
	const toFixedValue = value.toFixed(decimals);
	if (isNaN(Number(toFixedValue))) return '0%';
	return toFixedValue + '%';
}

/**
 * Formats complex objects to multiline JSON for logging
 * @param data - any data to format
 * @returns string with indentation
 */
export function formatDiffData(data: any, maxArrayItems: number = 20): string {
	try {
		if (Array.isArray(data) && data.length > maxArrayItems) {
			const truncated = data.slice(0, maxArrayItems);
			const remaining = data.length - maxArrayItems;
			return JSON.stringify({
				__truncated: true,
				__total_items: data.length,
				__showing_first: maxArrayItems,
				__remaining: remaining,
				items: truncated
			}, null, 2);
		}

		if (data && typeof data === 'object' && !Array.isArray(data)) {
			const processed: any = {};
			for (const key in data) {
				if (Array.isArray(data[key]) && data[key].length > maxArrayItems) {
					const truncated = data[key].slice(0, maxArrayItems);
					const remaining = data[key].length - maxArrayItems;
					processed[key] = {
						__truncated: true,
						__total_items: data[key].length,
						__showing_first: maxArrayItems,
						__remaining: remaining,
						items: truncated
					};
				} else {
					processed[key] = data[key];
				}
			}
			return JSON.stringify(processed, null, 2);
		}

		return JSON.stringify(data, null, 2);
	} catch (e) {
		return String(data);
	}
}

/**
 * Calculates padding for posts grid
 * @param text - post title
 * @returns padding value (number)
 */
export function calculatePadding(text: string | undefined): number {
	if (!text) return 30;

	const length = text.length;

	if (length <= 10) return 30;
	if (length >= 50) return 10;

	return Math.round(30 - (length - 10) * (20 / 40));
};

/**
 * Removes all leading and trailing whitespace characters (spaces, tabs, line breaks) from a string.
 * @param input the original text, e.g. "   Hello world   "
 * @returns "Hello world"
 */

export function deleteSpacesFromStartAndEnd(input: string): string {
	return input.replace(/^\s+|\s+$/g, '');
}

export function formatId(dataArray: string[] | string | number): string {
	if (typeof dataArray === 'string' || typeof dataArray === 'number') return dataArray.toString();
	if (!dataArray) return '';
	if (dataArray.length === 0) return dataArray[0];
	return dataArray.map((item) => item).join('-');
}

export function formatPhoneNumber(phoneNumber: string): string {
	return phoneNumber.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3 $4 $5');
}