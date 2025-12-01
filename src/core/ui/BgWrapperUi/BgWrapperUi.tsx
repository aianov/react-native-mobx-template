import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface BgWrapperUiProps {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	source?: string;
	requiredBg?: boolean;
	withOverlay?: boolean;
	bgColor?: string | number;
	useBg?: boolean;
}

export const BgWrapperUi = observer(({
	children,
	source = '',
	withOverlay = true,
	style,
	bgColor,
	requiredBg = true,
	useBg = false
}: BgWrapperUiProps) => {
	const { currentTheme } = themeStore;

	// if (!requiredBg) {
	if (!useBg) {
		return (
			<View
				style={[
					styles.container,
					{ backgroundColor: (bgColor as string) || currentTheme.bg_100 },
					style,
				]}
			>
				{children}
			</View>
		);
	}

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: (bgColor as string) || currentTheme.bg_200 }
			]}
		>
			<ImageBackground
				// @ts-ignore
				source={source}
				style={[styles.container, style]}
				resizeMode="cover"
			>
				{withOverlay ? (
					<View style={styles.overlay}>
						{children}
					</View>
				) : (
					<>{children}</>
				)}
			</ImageBackground>
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
});