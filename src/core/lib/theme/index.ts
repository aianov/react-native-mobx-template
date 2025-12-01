import { themeStore } from '@theme/stores';
import { PixelRatio } from 'react-native';

export const pxToDp = (px: number) => {
	const scale = PixelRatio.get();
	return px / scale;
};

export const borderNative = (border: BorderT) => {
	if (!border) return;
	return (border + '')?.split(" ")?.splice(2)?.join(" ") || "";
};

export const heightNative = (height: HeightT) => {
	return Number((height + '')?.replace("px", ""));
};

export const pxNative = (px: PxT) => {
	return Number((px + '')?.replace("px", ""));
};

export const rgbToRgbaString = (r: number, g: number, b: number, a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;

export const changeRgbA = (rgba: any, a: string | number) => {
	const arr = rgba.split(', ');
	arr[arr.length - 1] = a + ')';
	return arr.join(', ');
};

/**
 * Converts rgb string to rgba string with specified opacity.
 * @param rgb - string like "rgb(r, g, b)"
 * @param a - opacity value, e.g., "0.5"
 * @returns string like "rgba(r, g, b, a)"
 */
export const changeRgb = (rgb: string, a: number): string => {
	const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

	if (!match) {
		throw new Error("Invalid RGB format. Use 'rgb(r, g, b)'.");
	}

	const r = match[1];
	const g = match[2];
	const b = match[3];

	return `rgba(${r}, ${g}, ${b}, ${a})`;
};


/**
 * Creates beautiful gradient from source RGB/RGBA color.
 * Gradient goes from source color to darker (decreasing brightness).
 * Example: rgba(255, 65, 65, 1) → rgba(255, 40, 40, 1) → rgba(255, 0, 0, 1)
 */
export const gradientFromColor = (colorStr: string): string => {
	const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

	if (!match) {
		throw new Error("Invalid color format. Use 'rgb(r, g, b)' or 'rgba(r, g, b, a)'.");
	}

	const r = parseInt(match[1], 10);
	const g = parseInt(match[2], 10);
	const b = parseInt(match[3], 10);
	const a = match[4] ? parseFloat(match[4]) : 1;

	const maxComponent = Math.max(r, g, b);

	const start = `rgba(${r}, ${g}, ${b}, ${a})`;

	const midR = r === maxComponent ? r : Math.round(r * 0.615); // 65 * 0.615 ≈ 40
	const midG = g === maxComponent ? g : Math.round(g * 0.615);
	const midB = b === maxComponent ? b : Math.round(b * 0.615);
	const middle = `rgba(${midR}, ${midG}, ${midB}, ${a})`;

	const endR = r === maxComponent ? r : 0;
	const endG = g === maxComponent ? g : 0;
	const endB = b === maxComponent ? b : 0;
	const end = `rgba(${endR}, ${endG}, ${endB}, ${a})`;

	const gradient = `linear-gradient(to right, ${start} 0%, ${middle} 50%, ${end} 100%)`;

	return gradient;
};

export const darkenRGBA = (rgba: string | number | undefined, factor: number): string => {
	if (typeof rgba === "number" || !rgba) return "";

	const match = rgba.match(/^rgba?\((\d+), (\d+), (\d+),? ([\d.]+)?\)$/);

	if (!match) {
		throw new Error("Invalid RGBA format. Please use rgba(r, g, b, a).");
	}

	let [, rStr, gStr, bStr, aStr] = match;

	let r = parseInt(rStr, 10);
	let g = parseInt(gStr, 10);
	let b = parseInt(bStr, 10);
	let a = aStr ? parseFloat(aStr) : 1;

	const darken = (colorValue: number, factor: number): number => Math.max(0, colorValue - (colorValue * factor));

	const newR = darken(r, factor);
	const newG = darken(g, factor);
	const newB = darken(b, factor);

	return `rgba(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)}, ${a})`;
};

export function parseLinearGradient(gradient?: string, alpha: string = '1'): string[] {
	if (!gradient) return [];
	const regex = /(rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d*\.?\d+)?\))/g;

	const matches = [...gradient.matchAll(regex)].map((match) => {
		const [, , r, g, b] = match;
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	});

	return matches;
}

// types

type PxT = string | number | string & {} | undefined;
type BorderT = string | number | string & {} | undefined;
type HeightT = string | number | string & {} | undefined;

export const interpolateColor = (color1: string, color2: string, factor: number) => {
	const parseRgba = (rgbaColor: string) => {
		const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
		if (match) {
			return {
				r: parseInt(match[1]),
				g: parseInt(match[2]),
				b: parseInt(match[3]),
				a: match[4] ? parseFloat(match[4]) : 1
			};
		}
		return null;
	};

	const parseHex = (hexColor: string) => {
		const hex = hexColor.replace('#', '');
		return {
			r: parseInt(hex.substring(0, 2), 16),
			g: parseInt(hex.substring(2, 4), 16),
			b: parseInt(hex.substring(4, 6), 16),
			a: 1
		};
	};

	const parseColor = (color: string) => {
		if (color.startsWith('rgba') || color.startsWith('rgb')) {
			return parseRgba(color) || { r: 255, g: 255, b: 255, a: 1 };
		}
		return parseHex(color);
	};

	const c1 = parseColor(color1);
	const c2 = parseColor(color2);

	const r = Math.round(c1.r + factor * (c2.r - c1.r));
	const g = Math.round(c1.g + factor * (c2.g - c1.g));
	const b = Math.round(c1.b + factor * (c2.b - c1.b));
	const a = c1.a + factor * (c2.a - c1.a);

	return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
};

export const getIconColor = (tabIndex: number, scrollPosition: number, width: number) => {
	const mainColor = themeStore.currentTheme.primary_100 as string;
	const secondaryColor = themeStore.currentTheme.secondary_100 as string;

	const virtualCurrentTab = scrollPosition / width;

	const isTransitioningToThisTab =
		(Math.floor(virtualCurrentTab) === tabIndex && virtualCurrentTab < tabIndex + 1) ||
		(Math.ceil(virtualCurrentTab) === tabIndex && virtualCurrentTab > tabIndex - 1);

	if (!isTransitioningToThisTab) {
		return secondaryColor;
	}

	const proximityFactor = 1 - Math.abs(virtualCurrentTab - tabIndex);

	return interpolateColor(secondaryColor, mainColor, proximityFactor);
};