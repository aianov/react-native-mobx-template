import { VirtualList } from '@core/config/types';
import { AsyncDataRender } from '@core/ui';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { MutableRefObject, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, FlatList, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

const GRID_POST_WIDTH = Dimensions.get('window').width / 3 - 10;

interface GridPostsProps<T extends VirtualList<any>> {
	max?: number;
	data: VirtualList<T[]> | null | undefined;
	status?: "pending" | "fulfilled" | "rejected";
	onRefresh?: () => void;
	handlePostPress: (entity: T) => void;
	handleScroll?: () => void;
	flatListRef?: MutableRefObject<null>;
	tag?: string;
	noDataTKey?: string;
	currentElement?: any[];
	postContainerStyle?: StyleProp<ViewStyle>;
	pageContainerStyle?: StyleProp<ViewStyle>;
	mainContainerStyle?: StyleProp<ViewStyle>;
	needPending?: boolean;
	fetchIfHaveData?: boolean;
	isPreview?: boolean;
}

export const GridContentUi = observer(<T extends VirtualList<any>>({
	max,
	data,
	status,
	onRefresh,
	handlePostPress,
	handleScroll,
	flatListRef,
	noDataTKey = 'no_posts',
	currentElement,
	postContainerStyle = {},
	pageContainerStyle = {},
	mainContainerStyle = {},
	needPending = true,
	fetchIfHaveData = true,
	isPreview = false
}: GridPostsProps<T>) => {

	const { currentTheme } = themeStore;
	const { t } = useTranslation();
	const titlePx = 3.5;

	const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<T>);

	const flatListData = useMemo(() => {
		if (max && currentElement) {
			return [...currentElement, ...(data?.list?.slice(0, max - 1) || [])] as T[];
		}
		return (data?.list || []) as T[];
	}, [max, currentElement, data?.list]);

	const keyExtractor = useCallback((item: T) => `post-${""}`, []);

	const renderItem = useCallback(({ item }: { item: T; }) => {
		return (
			<TouchableOpacity
				style={[
					styles.postContainer,
					{
						width: GRID_POST_WIDTH,
						height: 150,
						borderColor: currentTheme.bg_200,
						borderWidth: 0.5,
						overflow: 'hidden',
						position: "relative"
					},
					postContainerStyle
				]}
				onPress={() => !max && handlePostPress(item)}
				activeOpacity={0.6}
			>
				{/* {item?.images?.[0] ? (
					<Animated.View style={styles.imageWrapper}>
						<CleverImage
							source={item.images?.[0] + ''}
							imageStyles={styles.image}
							withoutWrapper={true}
							sharedTransitionTag={item?.id?.toString() + '1'}
						/>
					</Animated.View>
				) : (
					<View
						style={[
							styles.textContainer,
							{ backgroundColor: currentTheme.btn_bg_300 }
						]}
					>
						<MainText
							px={isPreview ? titlePx : calculatePadding(item?.title)}
							tac='center'
						>
							{item?.title}
						</MainText>
					</View>
				)} */}
			</TouchableOpacity>
		);
	}, [currentTheme, max, handlePostPress, postContainerStyle, isPreview, titlePx]);

	return (
		<View style={[styles.mainContainer, mainContainerStyle]}>
			<AsyncDataRender
				status={status}
				data={data?.list}
				noDataText={t(noDataTKey)}
				noDataHeightPercent={5}
				refreshControllCallback={onRefresh}
				renderContent={() => {
					return (
						<View style={[styles.listContainer, pageContainerStyle]}>
							<AnimatedFlatList
								key="grid-flatlist"
								keyExtractor={keyExtractor}
								ref={flatListRef}
								data={flatListData as any}
								renderItem={renderItem}
								numColumns={3}
								onScroll={handleScroll}
								bounces={false}
								scrollEventThrottle={16}
								refreshing={status === "pending"}
								style={styles.flatList}
								contentContainerStyle={styles.contentContainer}
								removeClippedSubviews={true}
								maintainVisibleContentPosition={{
									minIndexForVisible: 0,
									autoscrollToTopThreshold: 0
								}}
							/>
						</View>
					);
				}}
				messageHeightPercent={20}
			/>
		</View>
	);
});
const styles = StyleSheet.create({
	mainContainer: { flex: 1, },
	listContainer: { flex: 1, },
	flatList: { flex: 1, },
	contentContainer: { paddingBottom: 80, },
	textContainer: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		padding: 10,
		alignItems: "center",
	},
	postContainer: {
		position: 'relative',
	},
	imageWrapper: {
		width: "100%",
		height: "100%",
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	image: {
		width: "100%",
		height: "100%",
		objectFit: "cover"
	},
});