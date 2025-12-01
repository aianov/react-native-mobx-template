import { AVPlaybackSource } from 'expo-av';
import { ReactNode } from 'react';

export interface NotificationConfig {
	id?: string;
	title?: string;
	description?: string;
	duration?: number;
	onPress?: () => void;
	onLongPress?: () => void;
	onHidden?: () => void;
	hideOnPress?: boolean;
	sound?: AVPlaybackSource;
	longPressDuration?: number;
	longPressScale?: number;
	tapScale?: number;
	Component?: React.ComponentType<any>;
	componentProps?: any;
}

export interface NotificationWithId extends NotificationConfig {
	id: string;
}

export interface NotifierContextType {
	showNotification: (config: NotificationConfig) => void;
	hideNotification: (id?: string) => void;
}

export interface NotifierProviderProps {
	children: ReactNode;
}

export interface NotificationItemProps {
	notification: NotificationWithId;
	onHide: () => void;
	index: number;
	totalCount: number;
}