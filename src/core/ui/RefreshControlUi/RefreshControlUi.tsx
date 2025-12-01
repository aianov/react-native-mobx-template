import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';

interface RefreshControlUiProps extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
	callback: () => void;
	color?: string;
}

export const RefreshControlUi = observer(({
	color = themeStore.currentTheme.primary_100,
	callback,
	...props
}: RefreshControlUiProps) => {
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			callback();
		} finally {
			setRefreshing(false);
		}
	};

	return (
		<RefreshControl
			refreshing={refreshing}
			onRefresh={onRefresh}
			colors={[color]} // для Android
			tintColor={color} // для iOS
			{...props}
		/>
	);
})

