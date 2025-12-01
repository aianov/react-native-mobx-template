import { themeStore } from '@theme/stores';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

export interface BottomSheetScreen {
	name: string;
	component: React.ComponentType<any>;
	title?: string;
	heightPercent?: number;
}

interface BottomSheetNavigationContextType {
	navigate: (screenName: string) => void;
	goBack: () => void;
	currentScreen: string;
	canGoBack: boolean;
	stackDepth: number;
}

const BottomSheetNavigationContext = createContext<BottomSheetNavigationContextType | null>(null);

export const useBottomSheetNavigation = () => {
	const context = useContext(BottomSheetNavigationContext);
	if (!context) {
		throw new Error('useBottomSheetNavigation must be used within BottomSheetNavigator');
	}
	return context;
};

interface BottomSheetNavigatorProps {
	screens: BottomSheetScreen[];
	initialScreen: string;
	onScreenChange?: (screen: BottomSheetScreen) => void;
	onShowBackButton?: (show: boolean) => void;
	onGoBackRef?: (fn: () => void) => void;
	onHeightChange?: (height: number) => void;
	onSnapToHeightInstant?: (height: number) => void;
	bottomSheetBgColor?: string;
	onTitleSwipeProgress?: (currentTitle: string | undefined, targetTitle: string | undefined, progress: number) => void;
	onBackButtonOpacity?: (opacity: number) => void;
}

interface StackScreenProps {
	screenName: string;
	screens: BottomSheetScreen[];
	isTopScreen: boolean;
	onSwipeBack: () => void;
	onAnimateInComplete: () => void;
	bottomSheetBgColor?: string;
	shouldAnimateIn: boolean;
	onAnimateOut: () => void;
	animateOutTrigger: number;
	screenHeight?: number;
	currentScreenHeight?: number;
	targetScreenHeight?: number;
	onSwipeProgress?: (progress: number) => void;
	onSwipeCancel?: () => void;
}

const StackScreen: React.FC<StackScreenProps> = ({
	screenName,
	screens,
	isTopScreen,
	onSwipeBack,
	onAnimateInComplete,
	bottomSheetBgColor,
	shouldAnimateIn,
	onAnimateOut,
	animateOutTrigger,
	screenHeight,
	currentScreenHeight,
	targetScreenHeight,
	onSwipeProgress,
	onSwipeCancel,
}) => {
	const { currentTheme } = themeStore;

	const translateX = useSharedValue(shouldAnimateIn ? SCREEN_WIDTH : 0);
	const isLocalAnimating = useSharedValue(false);

	const screenConfig = screens.find(s => s.name === screenName);
	const ScreenComponent = screenConfig?.component;

	const onSwipeProgressRef = useRef(onSwipeProgress);
	const onSwipeCancelRef = useRef(onSwipeCancel);
	onSwipeProgressRef.current = onSwipeProgress;
	onSwipeCancelRef.current = onSwipeCancel;

	// Анимация входа при монтировании
	useEffect(() => {
		if (shouldAnimateIn) {
			isLocalAnimating.value = true;
			translateX.value = withTiming(0, {
				duration: 300,
				easing: Easing.out(Easing.cubic)
			}, (finished) => {
				if (finished) {
					isLocalAnimating.value = false;
					runOnJS(onAnimateInComplete)();
				}
			});
		}
	}, []);

	useEffect(() => {
		if (animateOutTrigger > 0 && isTopScreen) {
			isLocalAnimating.value = true;
			translateX.value = withTiming(SCREEN_WIDTH, {
				duration: 250,
				easing: Easing.in(Easing.cubic)
			}, (finished) => {
				if (finished) {
					isLocalAnimating.value = false;
					runOnJS(onAnimateOut)();
				}
			});
		}
	}, [animateOutTrigger]);

	// Функция для вызова прогресса свайпа из JS thread
	const callSwipeProgress = useCallback((progress: number) => {
		onSwipeProgressRef.current?.(progress);
	}, []);

	const callSwipeCancel = useCallback(() => {
		onSwipeCancelRef.current?.();
	}, []);

	const panGesture = Gesture.Pan()
		.activeOffsetX([15, 15])
		.failOffsetY([-15, 15])
		.enabled(isTopScreen)
		.onUpdate((e) => {
			'worklet';
			if (isLocalAnimating.value) return;
			if (e.translationX > 0) {
				translateX.value = e.translationX;
				const progress = Math.min(e.translationX / SCREEN_WIDTH, 1);
				runOnJS(callSwipeProgress)(progress);
			}
		})
		.onEnd((e) => {
			'worklet';
			if (isLocalAnimating.value) return;

			if (e.translationX > SWIPE_THRESHOLD || e.velocityX > 500) {
				isLocalAnimating.value = true;
				runOnJS(callSwipeProgress)(1);
				translateX.value = withTiming(SCREEN_WIDTH, {
					duration: 200,
					easing: Easing.out(Easing.cubic)
				}, (finished) => {
					if (finished) {
						isLocalAnimating.value = false;
						runOnJS(onSwipeBack)();
					}
				});
			} else {
				runOnJS(callSwipeCancel)();
				translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
			}
		});

	const screenStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	if (!ScreenComponent) return null;

	return (
		<GestureDetector gesture={panGesture}>
			<Animated.View
				style={[
					styles.innerContainer,
					{ backgroundColor: bottomSheetBgColor || currentTheme.bg_200 },
					screenHeight ? { height: screenHeight, bottom: undefined } : {},
					screenStyle
				]}
			>
				<ScreenComponent />
			</Animated.View>
		</GestureDetector>
	);
};

interface StackItem {
	screenName: string;
	id: number;
	shouldAnimateIn: boolean;
}

export const BottomSheetNavigator: React.FC<BottomSheetNavigatorProps> = ({
	screens,
	initialScreen,
	onScreenChange,
	onShowBackButton,
	onGoBackRef,
	onHeightChange,
	onSnapToHeightInstant,
	bottomSheetBgColor,
	onTitleSwipeProgress,
	onBackButtonOpacity,
}) => {
	const { currentTheme } = themeStore;
	const { height: windowHeight } = useWindowDimensions();

	const [navigationStack, setNavigationStack] = useState<StackItem[]>([
		{ screenName: initialScreen, id: 0, shouldAnimateIn: false }
	]);
	const nextIdRef = useRef(1);
	const menuHeightRef = useRef(0);
	const screenHeightsRef = useRef<Map<string, number>>(new Map());
	const [isAnimating, setIsAnimating] = useState(false);

	const [animateOutTrigger, setAnimateOutTrigger] = useState(0);

	const animatedMinHeight = useSharedValue(0);
	const hasAnimatedHeight = useSharedValue(false);

	const onScreenChangeRef = useRef(onScreenChange);
	const onShowBackButtonRef = useRef(onShowBackButton);
	const onHeightChangeRef = useRef(onHeightChange);
	const onSnapToHeightInstantRef = useRef(onSnapToHeightInstant);
	const onTitleSwipeProgressRef = useRef(onTitleSwipeProgress);
	const onBackButtonOpacityRef = useRef(onBackButtonOpacity);

	useEffect(() => {
		onScreenChangeRef.current = onScreenChange;
		onShowBackButtonRef.current = onShowBackButton;
		onHeightChangeRef.current = onHeightChange;
		onSnapToHeightInstantRef.current = onSnapToHeightInstant;
		onTitleSwipeProgressRef.current = onTitleSwipeProgress;
		onBackButtonOpacityRef.current = onBackButtonOpacity;
	});

	const currentScreen = navigationStack[navigationStack.length - 1].screenName;
	const canGoBack = navigationStack.length > 1;
	const stackDepth = navigationStack.length;

	const percentToPixels = useCallback((percent: number) => {
		return Math.round((percent / 100) * windowHeight);
	}, [windowHeight]);

	const getScreenConfig = useCallback((name: string) => {
		return screens.find(s => s.name === name);
	}, [screens]);

	const getHeightForScreen = useCallback((screenName: string) => {
		const config = getScreenConfig(screenName);
		if (config?.heightPercent) {
			return percentToPixels(config.heightPercent);
		}
		if (screenName === initialScreen) {
			return menuHeightRef.current;
		}
		return screenHeightsRef.current.get(screenName) || menuHeightRef.current;
	}, [getScreenConfig, percentToPixels, initialScreen]);

	const handleAnimateInComplete = useCallback(() => {
		setIsAnimating(false);
	}, []);

	const finishAnimateOut = useCallback(() => {
		setNavigationStack(prev => {
			if (prev.length <= 1) return prev;
			return prev.slice(0, -1);
		});
		setIsAnimating(false);
	}, []);

	useEffect(() => {
		const newTopScreen = navigationStack[navigationStack.length - 1].screenName;
		const newTopConfig = getScreenConfig(newTopScreen);
		if (newTopConfig) {
			onScreenChangeRef.current?.(newTopConfig);
		}
		onShowBackButtonRef.current?.(navigationStack.length > 1);
	}, [navigationStack, getScreenConfig]);

	const navigate = useCallback((screenName: string) => {
		if (isAnimating || screenName === currentScreen) return;
		setIsAnimating(true);

		const screen = getScreenConfig(screenName);
		if (screen?.heightPercent) {
			const targetHeight = percentToPixels(screen.heightPercent);
			hasAnimatedHeight.value = true;
			animatedMinHeight.value = withTiming(targetHeight, {
				duration: 300,
				easing: Easing.out(Easing.cubic)
			});
			onHeightChangeRef.current?.(targetHeight);
		}

		const newId = nextIdRef.current++;
		setNavigationStack(prev => [...prev, { screenName, id: newId, shouldAnimateIn: true }]);
	}, [isAnimating, currentScreen, getScreenConfig, percentToPixels, animatedMinHeight, hasAnimatedHeight]);

	const goBack = useCallback(() => {
		console.log('[BottomSheetNav] goBack called:', { isAnimating, stackLength: navigationStack.length });
		if (isAnimating || navigationStack.length <= 1) return;
		setIsAnimating(true);

		const targetScreenName = navigationStack[navigationStack.length - 2].screenName;
		const currentScreenName = navigationStack[navigationStack.length - 1].screenName;
		const targetHeight = getHeightForScreen(targetScreenName);
		const currentHeight = getHeightForScreen(currentScreenName);
		const targetConfig = getScreenConfig(targetScreenName);
		const currentConfig = getScreenConfig(currentScreenName);

		console.log('[BottomSheetNav] goBack:', { targetScreenName, targetHeight, currentHeight });

		const willBeAtInitial = navigationStack.length === 2;

		if (targetHeight > 0 && currentHeight > 0) {
			const duration = 250;
			const startTime = Date.now();

			const animateAll = () => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const easedProgress = 1 - Math.pow(1 - progress, 3);

				const interpolatedHeight = currentHeight + (targetHeight - currentHeight) * easedProgress;
				onHeightChangeRef.current?.(interpolatedHeight);

				onTitleSwipeProgressRef.current?.(
					currentConfig?.title,
					targetConfig?.title,
					easedProgress
				);

				if (willBeAtInitial) {
					onBackButtonOpacityRef.current?.(1 - easedProgress);
				}

				if (progress < 1) {
					requestAnimationFrame(animateAll);
				} else {
					onSnapToHeightInstantRef.current?.(targetHeight);
					onTitleSwipeProgressRef.current?.(undefined, targetConfig?.title, 1);
				}
			};

			requestAnimationFrame(animateAll);

			if (targetConfig?.heightPercent) {
				animatedMinHeight.value = withTiming(targetHeight, {
					duration: 250,
					easing: Easing.out(Easing.cubic)
				});
			} else {
				hasAnimatedHeight.value = false;
				animatedMinHeight.value = withTiming(0, { duration: 250 });
			}
		}

		setAnimateOutTrigger(prev => prev + 1);
	}, [isAnimating, navigationStack, getHeightForScreen, getScreenConfig, animatedMinHeight, hasAnimatedHeight]);

	const handleSwipeProgress = useCallback((progress: number) => {
		if (navigationStack.length <= 1) return;

		const currentScreenName = navigationStack[navigationStack.length - 1].screenName;
		const targetScreenName = navigationStack[navigationStack.length - 2].screenName;

		const currentHeight = getHeightForScreen(currentScreenName);
		const targetHeight = getHeightForScreen(targetScreenName);

		const currentConfig = getScreenConfig(currentScreenName);
		const targetConfig = getScreenConfig(targetScreenName);

		if (currentHeight > 0 && targetHeight > 0) {
			const interpolatedHeight = currentHeight + (targetHeight - currentHeight) * progress;

			onHeightChangeRef.current?.(interpolatedHeight);

			animatedMinHeight.value = interpolatedHeight;
		}

		onTitleSwipeProgressRef.current?.(
			currentConfig?.title,
			targetConfig?.title,
			progress
		);

		const willBeAtInitial = navigationStack.length === 2;
		if (willBeAtInitial) {
			onBackButtonOpacityRef.current?.(1 - progress);
		}
	}, [navigationStack, getHeightForScreen, getScreenConfig, animatedMinHeight]);

	const handleSwipeCancel = useCallback(() => {
		if (navigationStack.length <= 1) return;

		const currentScreenName = navigationStack[navigationStack.length - 1].screenName;
		const currentHeight = getHeightForScreen(currentScreenName);
		const currentConfig = getScreenConfig(currentScreenName);
		const willBeAtInitial = navigationStack.length === 2;

		const duration = 200;
		const startTime = Date.now();

		const startHeight = animatedMinHeight.value || currentHeight;

		const animateBack = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = 1 - Math.pow(1 - progress, 3);

			if (currentHeight > 0) {
				const interpolatedHeight = startHeight + (currentHeight - startHeight) * easedProgress;
				onHeightChangeRef.current?.(interpolatedHeight);
			}

			onTitleSwipeProgressRef.current?.(
				currentConfig?.title,
				undefined,
				1 - easedProgress
			);

			if (willBeAtInitial) {
				onBackButtonOpacityRef.current?.(easedProgress + (1 - easedProgress) * easedProgress);
			}

			if (progress < 1) {
				requestAnimationFrame(animateBack);
			} else {
				onHeightChangeRef.current?.(currentHeight);
				onTitleSwipeProgressRef.current?.(currentConfig?.title, undefined, 0);
				if (willBeAtInitial) {
					onBackButtonOpacityRef.current?.(1);
				}
			}
		};

		requestAnimationFrame(animateBack);

		if (currentHeight > 0) {
			animatedMinHeight.value = withTiming(currentHeight, {
				duration: 200,
				easing: Easing.out(Easing.cubic)
			});
		}
	}, [navigationStack, getHeightForScreen, getScreenConfig, animatedMinHeight]);

	const handleSwipeBack = useCallback(() => {
		const targetScreenName = navigationStack[navigationStack.length - 2].screenName;
		const targetHeight = getHeightForScreen(targetScreenName);
		const targetConfig = getScreenConfig(targetScreenName);

		if (targetHeight > 0) {
			onSnapToHeightInstantRef.current?.(targetHeight);
			onHeightChangeRef.current?.(targetHeight);

			if (targetConfig?.heightPercent) {
				animatedMinHeight.value = targetHeight;
			} else {
				hasAnimatedHeight.value = false;
				animatedMinHeight.value = 0;
			}
		}

		onTitleSwipeProgressRef.current?.(undefined, targetConfig?.title, 1);

		finishAnimateOut();
	}, [navigationStack, getHeightForScreen, getScreenConfig, finishAnimateOut, animatedMinHeight, hasAnimatedHeight]);

	useEffect(() => {
		onGoBackRef?.(goBack);
	}, [goBack, onGoBackRef]);

	const handleMenuLayout = (e: LayoutChangeEvent) => {
		const height = e.nativeEvent.layout.height;
		if (height > 0 && height !== menuHeightRef.current) {
			menuHeightRef.current = height;
			if (navigationStack.length === 1) {
				onHeightChangeRef.current?.(height);
			}
		}
	};

	const InitialScreenComponent = getScreenConfig(initialScreen)?.component;

	const stackScreens = navigationStack.slice(1);

	const wrapperAnimatedStyle = useAnimatedStyle(() => {
		if (!hasAnimatedHeight.value || animatedMinHeight.value === 0) {
			return {};
		}
		return {
			minHeight: animatedMinHeight.value,
		};
	});

	return (
		<BottomSheetNavigationContext.Provider value={{ navigate, goBack, currentScreen, canGoBack, stackDepth }}>
			<Animated.View
				style={[
					styles.wrapper,
					stackScreens.length > 0 ? wrapperAnimatedStyle : {}
				]}
			>
				{/* Initial screen (menu) */}
				<View
					style={[styles.menuContainer, { backgroundColor: bottomSheetBgColor || currentTheme.bg_200 }]}
					onLayout={handleMenuLayout}
				>
					{InitialScreenComponent && <InitialScreenComponent />}
				</View>

				{stackScreens.map((item, index) => {
					const screenConfig = getScreenConfig(item.screenName);
					const screenHeight = screenConfig?.heightPercent
						? percentToPixels(screenConfig.heightPercent)
						: undefined;

					const currentScreenHeight = screenHeight || menuHeightRef.current;
					const prevStackItem = index > 0 ? stackScreens[index - 1] : null;
					const targetScreenName = prevStackItem?.screenName || initialScreen;
					const targetScreenHeight = getHeightForScreen(targetScreenName);

					return (
						<StackScreen
							key={item.id}
							screenName={item.screenName}
							screens={screens}
							isTopScreen={index === stackScreens.length - 1}
							onSwipeBack={handleSwipeBack}
							onAnimateInComplete={handleAnimateInComplete}
							bottomSheetBgColor={bottomSheetBgColor}
							shouldAnimateIn={item.shouldAnimateIn}
							onAnimateOut={finishAnimateOut}
							animateOutTrigger={index === stackScreens.length - 1 ? animateOutTrigger : 0}
							screenHeight={screenHeight}
							currentScreenHeight={currentScreenHeight}
							targetScreenHeight={targetScreenHeight}
							onSwipeProgress={handleSwipeProgress}
							onSwipeCancel={handleSwipeCancel}
						/>
					);
				})}
			</Animated.View>
		</BottomSheetNavigationContext.Provider>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		overflow: 'hidden',
		flex: 1,
	},
	menuContainer: {
		flex: 1,
	},
	innerContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
});
