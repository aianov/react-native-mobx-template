import { ReactNode } from 'react';

export type NotifyType = "success" | "error" | "warning" | "info" | "system";

export interface NotifyData {
	title?: string;
	message: string;
	icon?: ReactNode;
	duration?: number;
	callback?: () => void;
	onPress?: () => void;
	onHidden?: () => void;
	hideOnPress?: boolean;
	logo?: string;
	image?: string;
}

export type LoggerTypes = "error" | "warning" | "info" | "system" | "success" | "debug" | "component" | "page" | "ui";

export interface MobxSaiSuccessResponse {
	fetchParams?: any;
}

export interface VirtualList<T> extends MobxSaiSuccessResponse {
	list: T;
	items: T;
	total?: number;
	limit: number;
	relativeId: number | string | null;
	isHaveMoreBotOrTop?: boolean;
}