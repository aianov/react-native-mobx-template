import { BgWrapperUi, MainText, PageHeaderUi, SimpleButtonUi } from '@core/ui';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { Fragment, JSX, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SCREEN_PADDING_HORIZONTAL = 12.5;

interface MainWrapperProps {
	tKey?: string;
	children?: JSX.Element;
	PageHeaderUiStyle?: StyleProp<ViewStyle>;
	wrapperStyle?: StyleProp<ViewStyle>;
	cancelText?: boolean;
	readyText?: boolean;
	requiredBg?: boolean;
	transparentSafeArea?: boolean;
	needScrollView?: boolean;
	needHeader?: boolean;
	withoutBackBtn?: boolean;
	wrapperNoPadding?: boolean;
	title?: string;
	bgColor?: string | number;
	height?: number;
	bgWrapperStyle?: StyleProp<ViewStyle>;
	onBackPress?: () => void;
	onSuccessPress?: () => void;
	onlyLayout?: boolean;
	marginBottom?: number;
}

export const MainWrapper = observer(({
	tKey = "use_tkey_prop",
	children,
	PageHeaderUiStyle = {},
	wrapperStyle = {},
	cancelText = false,
	wrapperNoPadding = false,
	title,
	readyText = false,
	withoutBackBtn = false,
	transparentSafeArea = false,
	needScrollView = true,
	needHeader = true,
	height = 40,
	onBackPress,
	requiredBg = true,
	bgColor,
	bgWrapperStyle,
	onSuccessPress,
	onlyLayout = false,
	marginBottom = 20
}: MainWrapperProps) => {
	const {
		safeAreaWithContentHeight: { safeAreaWithContentHeight },
		currentTheme
	} = themeStore;

	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	const s = useMemo(
		() => createStyles(currentTheme.bg_200, transparentSafeArea, wrapperNoPadding),
		[currentTheme.bg_200, transparentSafeArea, wrapperNoPadding]
	);

	const ScrollOrEmpty = needScrollView ? ScrollView : Fragment;

	if (transparentSafeArea) return (
		<BgWrapperUi
			requiredBg={requiredBg}
			bgColor={bgColor}
		>
			{needHeader && (
				<PageHeaderUi
					text={title || t(tKey)}
					style={[
						{
							backgroundColor: transparentSafeArea ? "transparent" : currentTheme.bg_200,
						},
						PageHeaderUiStyle
					]}
					cancelText={cancelText ? t('cancel') : ""}
					withoutBackBtn={withoutBackBtn}
					height={height}
					onlyLayout={onlyLayout}
					leftJsx={cancelText && (
						<SimpleButtonUi onPress={onBackPress}>
							<MainText
								fontWeight='bold'
								color={currentTheme.primary_100}
							>
								{t('cancel')}
							</MainText>
						</SimpleButtonUi>
					)}
					rightJsx={readyText && (
						<SimpleButtonUi onPress={onSuccessPress}>
							<MainText
								fontWeight='bold'
								color={currentTheme.primary_100}
							>
								{t('ready')}
							</MainText>
						</SimpleButtonUi>
					)}
				/>
			)}

			<ScrollOrEmpty>
				<View
					style={[
						s.wrapper,
						{
							// marginTop: needHeader ? (safeAreaWithContentHeight + height) : 0,
							// marginBottom: insets.bottom + 20
						},
						wrapperStyle
					]}
				>
					{children ? children : (
						<MainText primary px={30}>
							Empty Children
						</MainText>
					)}
				</View>
			</ScrollOrEmpty>
		</BgWrapperUi>
	);

	return (
		<BgWrapperUi
			requiredBg={requiredBg}
			bgColor={bgColor}
			style={bgWrapperStyle}
		>
			{needHeader && (
				<PageHeaderUi
					text={title || t(tKey)}
					withoutBackBtn={withoutBackBtn}
					style={[
						{
							backgroundColor: transparentSafeArea ? "transparent" : currentTheme.bg_200
						},
						PageHeaderUiStyle
					]}
					onlyLayout={onlyLayout}
					height={height}
					cancelText={cancelText ? t('cancel') : ""}
					leftJsx={cancelText && (
						<SimpleButtonUi onPress={onBackPress}>
							<MainText
								fontWeight='bold'
								color={currentTheme.primary_100}
							>
								{t('cancel')}
							</MainText>
						</SimpleButtonUi>
					)}
					rightJsx={readyText && (
						<SimpleButtonUi onPress={onSuccessPress}>
							<MainText
								fontWeight='bold'
								color={currentTheme.primary_100}
							>
								{t('ready')}
							</MainText>
						</SimpleButtonUi>
					)}
				/>
			)}

			<ScrollOrEmpty>
				<View
					style={[
						s.wrapper,
						{
							marginTop: onlyLayout ? safeAreaWithContentHeight : 0,
							marginBottom: insets.bottom + marginBottom
						},
						wrapperStyle
					]}
				>
					{children ? children : (
						<MainText primary px={30}>
							Empty Children
						</MainText>
					)}
				</View>
			</ScrollOrEmpty>
		</BgWrapperUi>
	);
});

const createStyles = (
	bgColor: string,
	transparentSafeArea: boolean,
	wrapperNoPadding: boolean
) => StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: transparentSafeArea ? "transparent" : bgColor,
	},
	container: {
		flex: 1,
	},
	wrapper: {
		flex: 1,
		paddingVertical: wrapperNoPadding ? 0 : 10,
		paddingHorizontal: wrapperNoPadding ? 0 : SCREEN_PADDING_HORIZONTAL,
		flexDirection: 'column',
		gap: 15,
		height: "100%"
	},
});