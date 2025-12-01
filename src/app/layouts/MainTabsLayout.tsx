import { MainBottomNavigation } from '@core/widgets/navigations';
import { observer } from 'mobx-react-lite';
import { JSX } from 'react';
import { View } from 'react-native';

interface MainTabsLayoutProps {
	children: JSX.Element;
}

export const MainTabsLayout = observer(({ children }: MainTabsLayoutProps) => {
	return (
		<View style={{ flex: 1 }}>
			<View style={{ flex: 1 }}>
				{children}
			</View>
			<MainBottomNavigation />
		</View>
	);
});
