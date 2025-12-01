import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ThemeInitWrapper = observer(({ children }: { children: React.ReactNode; }) => {
	const {
		safeAreaWithContentHeight: { setSafeAreaWithContentHeight },
		currentTheme
	} = themeStore;

	const insets = useSafeAreaInsets();

	useEffect(() => {
		if (insets.top == 0 || !insets.top) return;
		const height = insets.top;
		setSafeAreaWithContentHeight(height);
	}, [insets]);

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: currentTheme.bg_200
			}}
		>
			{children}
		</View>
	);
});