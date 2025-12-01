import React, { createContext, useCallback, useState } from 'react';
import { ImageSourcePropType, StyleSheet, View } from 'react-native';
import { NotificationConfig } from '.';
import { NotificationItem } from './NotificationItem';
import { NotificationWithId, NotifierContextType, NotifierProviderProps } from './types';

export let defaultNotifierImage: ImageSourcePropType | null = null;

export const setDefaultNotificationImage = (image: ImageSourcePropType) => {
	defaultNotifierImage = image;
};

export const NotifierContext = createContext<NotifierContextType | undefined>(undefined);

let notificationIdCounter = 0;

export const NotifierProvider: React.FC<NotifierProviderProps> = ({ children }) => {
	const [notifications, setNotifications] = useState<NotificationWithId[]>([]);

	const hideNotification = useCallback((id?: string) => {
		setNotifications(prev => {
			const notificationToHide = id
				? prev.find(n => n.id === id)
				: prev[0];

			if (notificationToHide?.onHidden) {
				notificationToHide.onHidden();
			}

			return id
				? prev.filter(n => n.id !== id)
				: prev.slice(1);
		});
	}, []);

	const showNotification = useCallback((config: NotificationConfig) => {
		const notificationWithId: NotificationWithId = {
			...config,
			id: config.id || `notification-${++notificationIdCounter}-${Date.now()}`,
		};

		setNotifications(prev => [notificationWithId, ...prev]);
	}, []);

	return (
		<NotifierContext.Provider value={{ showNotification, hideNotification }}>
			{children}
			{notifications.length > 0 && (
				<View style={s.container} pointerEvents="box-none">
					{notifications.map((notification, index) => (
						<NotificationItem
							key={notification.id}
							notification={notification}
							onHide={() => hideNotification(notification.id)}
							index={index}
							totalCount={notifications.length}
						/>
					))}
				</View>
			)}
		</NotifierContext.Provider>
	);
};

let s = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 99999,
		paddingHorizontal: 12,
		alignItems: 'center',
	}
});