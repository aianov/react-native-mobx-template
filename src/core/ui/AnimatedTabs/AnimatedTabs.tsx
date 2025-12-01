import { getIconColor as getIconColorDefault } from '@core/lib/theme';
import { BlurUi, MainText } from '@core/ui';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	DimensionValue,
	Animated as ReactNativeAnimated,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
	ViewStyle,
	useWindowDimensions
} from 'react-native';
import Animated, {
	runOnJS,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated';

const ActiveTabContext = React.createContext<number>(0);

export const useIsTabActive = (tabIndex: number) => {
	const activeTab = React.useContext(ActiveTabContext);
	return activeTab === tabIndex;
};

export interface TabConfig {
	backgroundColor?: string;
	text?: string;
	icon?: React.ComponentType<{ size?: number; color?: string; }>;
	content: React.ComponentType<any>;
}

interface AnimatedTabsProps {
	tabs: TabConfig[];
	activeTab?: number;
	setActiveTab?: (index: number) => void;
	scrollPosition?: number;
	setScrollPosition?: (position: number) => void;
	getIconColor?: (tabIndex: number, scrollPosition: number, width: number) => string;
	containerStyle?: ViewStyle;
	tabsContainerStyle?: ViewStyle;
	tabStyle?: ViewStyle;
	bouncing?: boolean;
	activeTabStyle?: ViewStyle;
	indicatorStyle?: ViewStyle;
	contentContainerStyle?: ViewStyle;
	contentHeight?: DimensionValue;
	iconSize?: number;
	tabMaxHeight?: number;
	blurView?: boolean;
	intensity?: number;
	noBorderRadius?: boolean;
	onSwap?: (index: number) => void;
	simple?: boolean;
	isTabBlurView?: boolean;
	tabBlurIntensity?: number;
}

export const AnimatedTabs = observer(({
	tabs,
	getIconColor = getIconColorDefault,
	containerStyle,
	tabsContainerStyle,
	tabStyle = { paddingVertical: 12 },
	activeTabStyle,
	noBorderRadius = false,
	indicatorStyle,
	blurView = false,
	contentContainerStyle,
	contentHeight,
	intensity = 30,
	iconSize = 20,
	tabMaxHeight,
	onSwap,
	bouncing = true,
	simple = false,
	isTabBlurView = false,
	tabBlurIntensity = 30
}: AnimatedTabsProps) => {
	const { currentTheme, getBlurViewBgColor } = themeStore;
	const tabCount = tabs.length;

	const [activeTab, setActiveTab] = useState(0);
	const [scrollPosition, setScrollPosition] = useState(0);
	const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0]));

	const [cachedTabs, setCachedTabs] = useState<Set<number>>(() => {
		const initial = new Set<number>([0]);
		if (tabCount > 1) initial.add(1);
		return initial;
	});
	const cacheTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

	const { width } = useWindowDimensions();
	const [scrollViewWidth] = useState(width);
	const scrollViewRef = useRef<any>(null);
	const tabsScrollViewRef = useRef<ScrollView>(null);
	const tabRefs = useRef<(View | null)[]>(new Array(tabCount).fill(null));
	const tabLayouts = useRef<{ x: number; width: number; textX: number; textWidth: number; }[]>(
		new Array(tabCount).fill(null).map(() => ({ x: 0, width: 0, textX: 0, textWidth: 0 }))
	);
	const initialScrollDone = useRef(false);
	const scrollPositions = useRef<number[]>(new Array(tabCount).fill(0));
	const scrollX = useSharedValue(scrollPosition);
	const indicatorWidth = useSharedValue(0);
	const indicatorPosition = useSharedValue(0);

	const updateIndicator = useCallback((index: number) => {
		if (index < 0 || index >= tabCount) return;

		const layout = tabLayouts.current[index];
		if (!layout || !layout.textWidth) return;

		indicatorWidth.value = withTiming(layout.textWidth, { duration: 300 });
		indicatorPosition.value = withTiming(layout.x + layout.textX, { duration: 300 });
	}, [tabCount]);

	const scrollToActiveTab = useCallback((index: number) => {
		if (!tabsScrollViewRef.current || !tabRefs.current[index]) return;

		setTimeout(() => {
			const layout = tabLayouts.current[index];
			if (!layout || !layout.width) return;

			const targetX = layout.x - (width / 2) + (layout.width / 2);
			tabsScrollViewRef.current?.scrollTo({
				x: Math.max(0, targetX),
				animated: true
			});
		}, 50);
	}, [width]);

	useEffect(() => {
		if (!simple) {
			updateIndicator(activeTab);
			scrollToActiveTab(activeTab);
		}
	}, [activeTab, updateIndicator, scrollToActiveTab, simple]);

	useEffect(() => {
		if (!simple && !initialScrollDone.current && scrollViewRef.current) {
			const timer = setTimeout(() => {
				scrollViewRef.current?.scrollTo({ x: activeTab * width, animated: false });
				initialScrollDone.current = true;

				requestAnimationFrame(() => {
					updateIndicator(activeTab);
				});
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [activeTab, updateIndicator, width, simple]);

	const updateCache = useCallback((tabsToCache: Set<number>) => {
		if (!simple) return;

		setCachedTabs(prev => {
			tabsToCache.forEach(index => {
				const timer = cacheTimers.current.get(index);
				if (timer) {
					clearTimeout(timer);
					cacheTimers.current.delete(index);
				}
			});

			prev.forEach(index => {
				if (!tabsToCache.has(index) && !cacheTimers.current.has(index)) {
					const timer = setTimeout(() => {
						setCachedTabs(current => {
							const newCache = new Set(current);
							newCache.delete(index);
							return newCache;
						});
						cacheTimers.current.delete(index);
					}, 300);

					cacheTimers.current.set(index, timer);
				}
			});

			return new Set([...prev, ...tabsToCache]);
		});
	}, [simple]);

	useEffect(() => {
		if (!simple && initialScrollDone.current && scrollViewRef.current && scrollPositions.current[activeTab] > 0) {
			const savedScrollPosition = scrollPositions.current[activeTab];
			const tabPosition = Math.round(savedScrollPosition / scrollViewWidth) * scrollViewWidth;

			const finalPosition = Math.abs(savedScrollPosition - tabPosition) < 10 ? tabPosition : savedScrollPosition;

			scrollViewRef.current?.scrollTo({ x: finalPosition, animated: false });
		}
	}, [activeTab, scrollViewWidth, simple]);

	useEffect(() => {
		if (simple) {
			const newRendered = new Set<number>();

			newRendered.add(activeTab);

			if (activeTab < tabCount - 1) {
				newRendered.add(activeTab + 1);
			}

			if (activeTab > 0) {
				newRendered.add(activeTab - 1);
			}

			updateCache(newRendered);
		}
	}, [activeTab, simple, tabCount, updateCache]);

	useEffect(() => {
		return () => {
			cacheTimers.current.forEach(timer => clearTimeout(timer));
			cacheTimers.current.clear();
		};
	}, []);

	const addVisitedTab = useCallback((index: number) => {
		setVisitedTabs(prev => new Set(prev).add(index));
	}, []);

	const handleTabPress = (index: number) => {
		if (simple) {
			const newRendered = new Set<number>();
			newRendered.add(index);

			if (index < tabCount - 1) {
				newRendered.add(index + 1);
			}
			if (index > 0) {
				newRendered.add(index - 1);
			}

			updateCache(newRendered);

			setActiveTab(index);

			const isJump = Math.abs(index - activeTab) > 1;
			scrollViewRef.current?.scrollTo({
				x: index * width,
				animated: !isJump
			});

			onSwap && onSwap(index);
			return;
		}

		if (scrollViewRef.current) {
			scrollPositions.current[activeTab] = scrollX.value;
		}

		setActiveTab(index);
		addVisitedTab(index);

		const savedPosition = scrollPositions.current[index];
		if (savedPosition > 0) {
			scrollViewRef.current?.scrollTo({ x: savedPosition, animated: true });
		} else {
			scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
		}

		onSwap && onSwap(index);
	};

	const lastScrollX = useRef(0);

	const handleScroll = useAnimatedScrollHandler({
		onScroll: (event) => {
			const offsetX = event.contentOffset.x;
			scrollX.value = offsetX;
			runOnJS(setScrollPosition)(offsetX);

			if (simple) {
				const currentTabOffset = activeTab * width;
				const delta = offsetX - currentTabOffset;

				if (Math.abs(delta) > width * 0.2) {
					const direction = delta > 0 ? 1 : -1;
					const nextTab = activeTab + direction;
				}
			}

			lastScrollX.current = offsetX;
		},
		onMomentumEnd: (event) => {
			const offsetX = event.contentOffset.x;
			const newIndex = Math.round(offsetX / width);

			if (!simple) {
				scrollPositions.current[activeTab] = offsetX;
			}

			if (newIndex !== activeTab) {
				runOnJS(setActiveTab)(newIndex);
				if (!simple) {
					runOnJS(addVisitedTab)(newIndex);
				}
				if (onSwap) {
					runOnJS(onSwap)(newIndex);
				}
			}
		}
	});

	const indicatorAnimatedStyle = useAnimatedStyle(() => {
		if (simple) {
			const tabWidth = scrollViewWidth / tabCount;
			const progress = scrollX.value / scrollViewWidth;

			return {
				width: tabWidth,
				transform: [{ translateX: progress * tabWidth }]
			};
		}

		const finalWidth = indicatorWidth.value > 0 ? indicatorWidth.value : (scrollViewWidth / tabCount);

		return {
			width: finalWidth,
			transform: [{ translateX: indicatorPosition.value }]
		};
	}, [simple]);

	const Component = blurView ? BlurUi : View;
	const AnimatedBlurView = ReactNativeAnimated.createAnimatedComponent(BlurUi);
	const TabComponent = isTabBlurView ? AnimatedBlurView : Animated.View;

	return (
		<Component
			style={[
				{
					backgroundColor: blurView ? getBlurViewBgColor() : "transparent",
					borderTopLeftRadius: noBorderRadius ? 0 : 10,
					borderTopRightRadius: noBorderRadius ? 0 : 10,
				},
				styles.container,
				containerStyle
			]}
			intensity={intensity}
		>
			<TabComponent
				intensity={tabBlurIntensity}
				style={[
					styles.tabsContainer,
					{
						backgroundColor: blurView ? getBlurViewBgColor() : currentTheme.bg_200,
						borderBottomColor: currentTheme.border_100,
					},
					tabsContainerStyle
				]}
			>
				<ScrollView
					ref={tabsScrollViewRef}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ minWidth: '100%' }}
				>
					<View
						style={{
							position: 'relative',
							width: '100%'
						}}
					>
						<View style={{
							flexDirection: 'row',
							width: '100%',
							justifyContent: 'space-evenly'
						}}>
							{tabs.map((tab, tabIndex) => {
								let iconColor = getIconColor(tabIndex, scrollPosition, width);

								return (
									<TouchableOpacity
										key={tabIndex}
										ref={(ref) => {
											tabRefs.current[tabIndex] = ref;
										}}
										style={[
											styles.tab,
											tabStyle,
											activeTab === tabIndex && [styles.activeTab, activeTabStyle]
										]}
										onPress={() => handleTabPress(tabIndex)}
										onLayout={(event) => {
											const { x, width: tabWidth } = event.nativeEvent.layout;
											tabLayouts.current[tabIndex] = {
												...tabLayouts.current[tabIndex],
												x,
												width: tabWidth
											};
										}}
									>
										{tab.icon && iconColor && (() => {
											const IconComponent = tab.icon;
											return <IconComponent size={iconSize} color={iconColor} />;
										})()}

										{tab.text && (
											<MainText
												numberOfLines={1}
												color={iconColor || currentTheme.text_100}
												onLayout={e => {
													if (!simple) {
														const { x, width: textWidth } = e.nativeEvent.layout;
														tabLayouts.current[tabIndex] = {
															...tabLayouts.current[tabIndex],
															textX: x,
															textWidth
														};
														if (tabIndex === activeTab) {
															updateIndicator(tabIndex);
														}
													}
												}}
											>
												{tab.text}
											</MainText>
										)}
									</TouchableOpacity>
								);
							})}
						</View>

						<Animated.View
							style={[
								styles.indicator,
								{ backgroundColor: currentTheme.primary_100 },
								indicatorStyle,
								indicatorAnimatedStyle,
							]}
						/>
					</View>
				</ScrollView>
			</TabComponent>

			<Animated.ScrollView
				ref={scrollViewRef}
				horizontal
				pagingEnabled
				bounces={bouncing}
				showsHorizontalScrollIndicator={false}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				style={[styles.pagesContainer, contentContainerStyle]}
			>
				{tabs.map(({ content: Content, backgroundColor }, index) => {
					const shouldRender = simple ? cachedTabs.has(index) : visitedTabs.has(index);

					return (
						<View
							style={[
								styles.page,
								{
									width,
									backgroundColor: backgroundColor || currentTheme.bg_200
								},
								tabMaxHeight ? { maxHeight: tabMaxHeight } : {}
							]}
							key={index}
						>
							<ActiveTabContext.Provider value={activeTab}>
								{shouldRender ? <Content /> : null}
							</ActiveTabContext.Provider>
						</View>
					);
				})}
			</Animated.ScrollView>
		</Component>
	);
});

const styles = StyleSheet.create({
	container: {
		overflow: 'hidden',
		flex: 1,
	},
	tabsContainer: {
		flexDirection: 'row',
		position: 'relative',
		borderBottomWidth: 0.3,
		height: 45,
		maxHeight: 45,
	},
	indicator: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		height: 4,
		borderTopRightRadius: 2,
		borderTopLeftRadius: 2,
	},
	tab: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 10,
		alignItems: 'center',
		paddingHorizontal: 16,
		minWidth: 80,
	},
	activeTab: {
	},
	pagesContainer: {
		flex: 1
	},
	page: {
		flex: 1,
	}
}); 