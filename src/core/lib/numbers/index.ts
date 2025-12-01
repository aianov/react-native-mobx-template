import i18n from 'i18next';
import { Dispatch, SetStateAction } from 'react';

/**
 * Formats number to short form (1K, 1M, etc.) with localization
 * @param value - Number to format
 * @param digits - Decimal places (default 1)
 * @returns Formatted number as string
 */
export const formatNumber = (value: number, digits: number = 1): string => {
	if (value < 1000) {
		return value.toString();
	}

	const currentLocale = i18n.language;

	const suffixes: Record<string, string[]> = {
		'ru': ['', 'K', 'M', 'B', 'T'],
		'en': ['', 'K', 'M', 'B', 'T'],
		// TODO: Add other languages as needed
	};

	const localeSuffixes = suffixes[currentLocale] || suffixes['ru'];

	const order = Math.floor(Math.log10(value) / 3);

	if (order >= localeSuffixes.length) {
		return value.toExponential(digits);
	}

	const divider = Math.pow(10, order * 3);
	const scaled = value / divider;

	let formatted: string;

	if (Number.isInteger(scaled)) {
		formatted = scaled.toString();
	} else {
		formatted = scaled.toFixed(digits);
		formatted = formatted.replace(/\.?0+$/, '');
	}

	return `${formatted}${localeSuffixes[order]}`;
};

/**
 * Formats number with thousands separators according to locale
 * @param value - Number to format
 * @returns Formatted number with separators
 */
export const formatNumberWithSeparators = (value: number): string => {
	try {
		return new Intl.NumberFormat(i18n.language).format(value);
	} catch (error) {
		return value.toString();
	}
};

export const getMaxLengthColor = (n: number, maxLength: number) => { // 22, 32
	if (n >= Math.round(maxLength - 10)) return "red";
	if (n >= Math.round(maxLength / 2)) return "orange";
	return "white";
};

export const increaseInterval = (interval: number, setFunction: Dispatch<SetStateAction<number>>, maxValue: number) => {
	const ourInterval = setInterval(() => {
		setFunction(prev => {
			if (prev < maxValue) return prev + 10;
			clearInterval(ourInterval);
			return prev;
		});
	}, interval);
};

export const generateNumericId = () => {
	return new Date().getTime().toString() + Math.random().toString(36).substring(2, 15);
};