import { ImageSourcePropType } from 'react-native';
import { setDefaultNotificationImage } from './NotifierContext';
import { NotificationConfig } from './types';

class NotifierClass {
	private showNotificationFn: ((config: NotificationConfig) => void) | null = null;
	private hideNotificationFn: ((id?: string) => void) | null = null;

	setShowNotification(fn: (config: NotificationConfig) => void) {
		this.showNotificationFn = fn;
	}

	setHideNotification(fn: (id?: string) => void) {
		this.hideNotificationFn = fn;
	}

	setDefaultImage(image: ImageSourcePropType) {
		setDefaultNotificationImage(image);
	}

	showNotification(config: NotificationConfig) {
		if (this.showNotificationFn) {
			this.showNotificationFn(config);
		} else {
			console.warn('Notifier: showNotification called before NotifierProvider mounted');
		}
	}

	hideNotification(id?: string) {
		if (this.hideNotificationFn) {
			this.hideNotificationFn(id);
		} else {
			console.warn('Notifier: hideNotification called before NotifierProvider mounted');
		}
	}

	/**
	 * Hides all notifications
	 */
	hideAllNotifications() {
		if (this.hideNotificationFn) {
			// can add special logic to hide all notifications
			this.hideNotificationFn();
		}
	}
}

export const Notifier = new NotifierClass();
