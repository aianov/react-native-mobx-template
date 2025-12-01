import { NotifyData, NotifyType } from '@core/config/types';
import { logger } from '@lib/helpers';
import { Notifier } from '@lib/notifier';
import { themeStore } from '@theme/stores';
import i18next from 'i18next';
import { ImageSourcePropType } from 'react-native';
import appImg from "../../../assets/icon.png";
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';

const spawnNotify = (type: NotifyType, notifyData: NotifyData) => {
	const titleByType = {
		success: i18next.t("notify_success_title"),
		error: i18next.t("notify_error_title"),
		warning: i18next.t("notify_warning_title"),
		info: i18next.t("notify_info_title"),
		system: "Riseonly"
	};

	const imageByType = {
		success: appImg,
		error: appImg,
		warning: appImg,
		info: appImg,
		system: appImg
	};

	Notifier.showNotification({
		title: notifyData?.title || titleByType[type],
		description: notifyData?.message || `[DEV]: You doesnt provide message\ntype: ${type}\ntitle: ${notifyData?.title}`,
		duration: notifyData?.duration || 5000,
		onHidden: notifyData?.onHidden,
		onPress: notifyData?.onPress,
		hideOnPress: notifyData?.hideOnPress,
		componentProps: {
			imageSource: imageByType[type] as ImageSourcePropType,
			containerStyle: {
				backgroundColor: themeStore.currentTheme.bg_300,
				borderWidth: 0.3,
				borderColor: themeStore.currentTheme.border_200,
			},
			titleStyle: {
				color: themeStore.currentTheme.text_100
			},
			descriptionStyle: {
				color: themeStore.currentTheme.text_100
			}
		},
	});
};

export const todoNotify = () => {
	spawnNotify("system", {
		message: i18next.t("not_ready_functional")
	});
};

export const showNotify = (type: NotifyType, data: NotifyData) => {
	spawnNotify(type, data);
};

export const registerForPushNotificationsAsync = async () => {
	let token;

	logger.info('App NOTIFICATIONS', 'Register for push notifications is not implemented yet');

	return token;
};