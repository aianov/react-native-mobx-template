import { format, isSameYear, isToday, isYesterday, Locale, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { de, enUS, es, fr, it, ja, ko, ru, zhCN } from 'date-fns/locale';
import i18n from 'i18n';

const locales: Record<string, Locale> = {
	ru,
	en: enUS,
	de,
	fr,
	es,
	it,
	ja,
	ko,
	'zh-CN': zhCN,
	// TODO: Add other languages
};

const relativeDateTexts: Record<string, { today: string; yesterday: string; }> = {
	ru: { today: 'Today', yesterday: 'Yesterday' },
	en: { today: 'Today', yesterday: 'Yesterday' },
	de: { today: 'Heute', yesterday: 'Gestern' },
	fr: { today: 'Aujourd\'hui', yesterday: 'Hier' },
	es: { today: 'Hoy', yesterday: 'Ayer' },
	it: { today: 'Oggi', yesterday: 'Ieri' },
	ja: { today: '今日', yesterday: '昨日' },
	ko: { today: '오늘', yesterday: '어제' },
	'zh-CN': { today: '今天', yesterday: '昨天' },
	// TODO: Add other languages
};

/**
 * Formats date considering current language and context
 * @param dateString - date string in ISO format or Date object
 * @param options - additional formatting options
 * @returns formatted date string
 */
export const formatSmartDate = (
	dateString: string | Date,
	options: {
		showTime?: boolean;
		showYear?: boolean;
		timeFormat?: string;
		dateFormat?: string;
		yearFormat?: string;
		useRelativeTime?: boolean;
		timeZone?: string;
	} = {}
): string => {
	const currentLanguage = i18n.language || 'ru';
	const locale = locales[currentLanguage] || locales.en;
	const relativeTexts = relativeDateTexts[currentLanguage] || relativeDateTexts.en;

	const {
		showTime = true,
		showYear = false,
		timeFormat = 'HH:mm',
		dateFormat = 'd MMMM',
		yearFormat = 'd MMMM yyyy',
		useRelativeTime = true,
		timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Moscow'
	} = options;

	const rawDate = typeof dateString === 'string' ? parseISO(dateString) : dateString;

	if (!rawDate) return 'Raw Date Error';
	if (isNaN(rawDate.getTime())) {
		console.error('Invalid date:', rawDate);
		return '';
	}

	const date = toZonedTime(rawDate, timeZone);

	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	const timeString = showTime ? format(date, timeFormat, { locale }) : '';

	if (useRelativeTime) {
		if (diffInSeconds < 3600) {
			return formatRelativeTime(date);
		}
		if (isToday(date)) {
			return showTime ? `${relativeTexts.today} ${timeString}` : relativeTexts.today;
		}
		if (isYesterday(date)) {
			return showTime ? `${relativeTexts.yesterday} ${timeString}` : relativeTexts.yesterday;
		}
	}

	const shouldShowYear = showYear || !isSameYear(date, new Date());
	const formattedDate = format(
		date,
		shouldShowYear ? yearFormat : dateFormat,
		{ locale }
	);

	return showTime ? `${formattedDate} ${timeString}` : formattedDate;
};

/**
 * Formats only time considering user's current timezone
 * @param dateString - date string in ISO format or Date object
 * @param timeFormat - time format, default 'HH:mm'
 * @param timeZone - timezone, default 'Europe/Moscow'
 * @returns formatted time string
 */
export const formatTimeDate = (
	dateString: string | Date,
	timeFormat: string = 'HH:mm',
	timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Moscow'
): string => {
	const rawDate = typeof dateString === 'string' ? new Date(dateString) : dateString;

	if (isNaN(rawDate.getTime())) {
		console.error('Invalid date:', rawDate);
		return '';
	}

	const date = toZonedTime(rawDate, timeZone);

	return format(date, timeFormat);
};

/**
 * Returns short relative date (e.g., "5 min ago", "2 h ago")
 * @param dateString - date string in ISO format or Date object
 * @returns formatted string with relative date
 */
export const formatRelativeTime = (dateString: string | Date): string => {
	const currentLanguage = i18n.language || 'ru';
	const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;

	if (!date) return '';

	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	const shortUnits: Record<string, Record<string, string>> = {
		ru: {
			second: 'sec ago',
			minute: 'min ago',
			hour: 'h ago',
			day: 'd ago',
		},
		en: {
			second: 'sec ago',
			minute: 'min ago',
			hour: 'h ago',
			day: 'd ago',
		},
		de: {
			second: 'Sek.',
			minute: 'Min.',
			hour: 'Std.',
			day: 'T.',
		},
		// TODO: Add other languages
	};

	const units = shortUnits[currentLanguage] || shortUnits.en;

	// (less than 5 seconds)
	if (diffInSeconds < 5) {
		return 'just now';
	}
	// (up to 60 seconds)
	else if (diffInSeconds < 60) {
		return `${diffInSeconds} ${units.second}`;
	}
	// (up to 60 minutes)
	else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} ${units.minute}`;
	}
	// (up to 24 hours)
	else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} ${units.hour}`;
	}
	// (older events)
	else {
		return formatSmartDate(date, { useRelativeTime: false });
	}
};
