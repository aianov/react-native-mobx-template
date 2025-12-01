import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DimensionValue, Dimensions, FlatList, GestureResponderEvent, Image, Modal, StyleSheet, TouchableOpacity, UIManager, View, findNodeHandle } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
	Easing,
	Extrapolate,
	interpolate,
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming
} from 'react-native-reanimated';
import { Box } from '../BoxUi/Box';

interface ImageSwiperProps {
	images: string[];
	imageWidth?: DimensionValue;
	onImagePress?: (index: number) => void;
	height?: number;
}

interface ZoomEvent {
	zoomLevel: number;
}

interface TouchPosition {
	x: number;
	y: number;
	timestamp: number;
}

const MAX_CLICK_DURATION = 180;
const MAX_MOVE_DISTANCE = 5;
const CONSECUTIVE_OPEN_THRESHOLD = 2;
const BLOCK_DURATION = 1000;

const AnimatedDot = React.memo(({
	index,
	scrollValue,
	currentIndex,
	currentTheme,
	isFullscreen = false
}: {
	index: number;
	scrollValue: Animated.SharedValue<number>;
	currentIndex: number;
	currentTheme: any;
	isFullscreen?: boolean;
}) => {
	const animatedDotStyle = useAnimatedStyle(() => {
		const scale = interpolate(
			Math.abs(scrollValue.value - index),
			[0, 0.5, 1, 2],
			[1.2, 1.1, 0.9, 0.8],
			Extrapolate.CLAMP
		);

		const opacity = interpolate(
			Math.abs(scrollValue.value - index),
			[0, 3, 4],
			[1, 0.7, 0.5],
			Extrapolate.CLAMP
		);

		return {
			transform: [{ scale }],
			opacity
		};
	});

	const getDotStyle = (distance: number) => {
		if (distance === 0) {
			return { width: 5.5, height: 5.5, borderRadius: 3 };
		} else if (distance === 1) {
			return { width: 6, height: 6, borderRadius: 3 };
		} else if (distance === 2) {
			return { width: 5, height: 5, borderRadius: 3 };
		} else {
			return { width: 4, height: 4, borderRadius: 2 };
		}
	};

	return (
		<Animated.View
			style={[
				{ width: 6, height: 6, borderRadius: 3 },
				{ backgroundColor: currentTheme.secondary_100 },
				getDotStyle(Math.abs(currentIndex - index)),
				index === currentIndex && { backgroundColor: currentTheme.primary_100 },
				animatedDotStyle
			]}
		/>
	);
});

const ImageSwiperComponent = observer(({ images, onImagePress, imageWidth, height = 300 }: ImageSwiperProps) => {
	if (!images?.length) return <></>;

	const { currentTheme } = themeStore;
	const [errorIndexes, setErrorIndexes] = useState<number[]>([]);

	const translateY = useSharedValue(0);
	const scale = useSharedValue(1);
	const bgOpacity = useSharedValue(1);
	const uiOpacity = useSharedValue(1);
	const flatListRef = useRef<FlatList>(null);
	const screenWidth = Dimensions.get('window').width;
	const screenHeight = Dimensions.get('window').height;
	const imagesWidth = imageWidth || screenWidth;
	const scrollOffset = useSharedValue(0);
	const fullscreenScrollOffset = useSharedValue(0);
	const isDragging = useSharedValue(false);
	const indicatorScrollX = useSharedValue(0);
	const fullscreenIndicatorScrollX = useSharedValue(0);
	const [zoomEnabled, setZoomEnabled] = useState<boolean[]>(images.map(() => false));
	const [fullscreenMode, setFullscreenMode] = useState(false);
	const [fullscreenIndex, setFullscreenIndex] = useState(0);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [previousIndex, setPreviousIndex] = useState(0);
	const imageOpacity = useSharedValue(1);
	const isClosing = useSharedValue(false);
	const imagePosition = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
	const openingAnimation = useSharedValue(0);
	const [isScrolling, setIsScrolling] = useState(false);
	const wasScrolling = useRef(false);

	const touchStart = useRef<TouchPosition | null>(null);
	const isTouching = useRef(false);
	const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastTouchEndTime = useRef(0);
	const consecutiveOpenCount = useRef(0);
	const blockOpeningUntil = useRef(0);


	const indicatorContainerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: -fullscreenIndicatorScrollX.value }
			]
		};
	});

	const paginationIndicatorContainerStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: -indicatorScrollX.value }]
		};
	});

	useEffect(() => {
		if (currentIndex !== previousIndex) {
			if (images?.length > 7) {
				if (currentIndex < 3) {
					indicatorScrollX.value = withSpring(0, {
						damping: 15,
						stiffness: 150
					});
				} else if (currentIndex >= images.length - 4) {
					indicatorScrollX.value = withSpring((images.length - 7) * 9, {
						damping: 15,
						stiffness: 150
					});
				} else {
					indicatorScrollX.value = withSpring((currentIndex - 3) * 9, {
						damping: 15,
						stiffness: 150
					});
				}
			}
			setPreviousIndex(currentIndex);
		}
	}, [currentIndex, previousIndex, images.length]);

	useEffect(() => {
		if (images.length > 7) {
			if (fullscreenIndex < 3) {
				fullscreenIndicatorScrollX.value = withSpring(0, {
					damping: 15,
					stiffness: 150
				});
			} else if (fullscreenIndex >= images.length - 4) {
				fullscreenIndicatorScrollX.value = withSpring((images.length - 7) * 9, {
					damping: 15,
					stiffness: 150
				});
			} else {
				fullscreenIndicatorScrollX.value = withSpring((fullscreenIndex - 3) * 9, {
					damping: 15,
					stiffness: 150
				});
			}
		}
	}, [fullscreenIndex, images.length]);

	const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
		if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
			const index = viewableItems[0].index;
			if (typeof index === 'number') {
				setCurrentIndex(index);
			}
		}
	}).current;

	const handleScroll = useCallback((event: any) => {
		const offsetX = event.nativeEvent.contentOffset.x;
		scrollOffset.value = offsetX / screenWidth;
	}, [screenWidth]);

	const handleScrollBeginDrag = useCallback(() => {
		isDragging.value = true;
		setIsScrolling(true);
		wasScrolling.current = true;

		if (touchTimer.current) {
			clearTimeout(touchTimer.current);
			touchTimer.current = null;
		}
		touchStart.current = null;
		isTouching.current = false;
	}, []);

	const handleScrollEndDrag = useCallback(() => {
		isDragging.value = false;
		setIsScrolling(false);

		wasScrolling.current = true;
		setTimeout(() => {
			wasScrolling.current = false;
		}, 500);
	}, []);

	const handleZoomChange = useCallback((index: number, isZoomed: boolean) => {
		const newZoomEnabled = [...zoomEnabled];
		newZoomEnabled[index] = isZoomed;
		setZoomEnabled(newZoomEnabled);
	}, [zoomEnabled]);

	const openFullscreen = useCallback((index: number) => {
		// Сохраняем текущий индекс для возврата
		setFullscreenIndex(index);
		setFullscreenMode(true);
		isClosing.value = false;

		// Сбрасываем значения анимации
		translateY.value = 0;
		imageOpacity.value = 1;

		// Запускаем анимацию открытия
		openingAnimation.value = 0;
		openingAnimation.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease)
		});

		// Сохраняем позицию текущего изображения для анимации возврата
		if (flatListRef.current) {
			const handle = findNodeHandle(flatListRef.current);
			if (handle) {
				UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
					// Вычисляем центр ImageSwiper
					imagePosition.value = {
						x: pageX,
						y: pageY + height / 2, // Центрируем по вертикали
						width,
						height
					};
				});
			}
		}
	}, []);

	const handleTouch = useCallback((index: number, event: GestureResponderEvent, type: 'start' | 'end') => {
		const now = Date.now();

		// Блокировка открытия, если было слишком много последовательных открытий
		if (now < blockOpeningUntil.current) {
			return;
		}

		if (type === 'start') {
			// Запоминаем начальную позицию и время
			touchStart.current = {
				x: event.nativeEvent.pageX,
				y: event.nativeEvent.pageY,
				timestamp: now
			};
			isTouching.current = true;

			// Устанавливаем таймер, чтобы отменить открытие при длительном нажатии
			if (touchTimer.current) {
				clearTimeout(touchTimer.current);
			}
			touchTimer.current = setTimeout(() => {
				// Если пользователь держит палец слишком долго, это не клик
				isTouching.current = false;
				touchStart.current = null;
			}, MAX_CLICK_DURATION);
		} else if (type === 'end') {
			// Если начало касания не зафиксировано или был скролл, игнорируем
			if (!touchStart.current || wasScrolling.current || isScrolling || !isTouching.current) {
				isTouching.current = false;
				touchStart.current = null;
				if (touchTimer.current) {
					clearTimeout(touchTimer.current);
					touchTimer.current = null;
				}
				return;
			}

			// Проверяем время и расстояние
			const touchDuration = now - touchStart.current.timestamp;
			const moveDistance = Math.sqrt(
				Math.pow(event.nativeEvent.pageX - touchStart.current.x, 2) +
				Math.pow(event.nativeEvent.pageY - touchStart.current.y, 2)
			);

			// Очищаем таймер и состояние
			if (touchTimer.current) {
				clearTimeout(touchTimer.current);
				touchTimer.current = null;
			}
			isTouching.current = false;

			// Проверяем скорость последовательных открытий
			const timeSinceLastOpen = now - lastTouchEndTime.current;
			if (timeSinceLastOpen < 300) {
				consecutiveOpenCount.current++;
				if (consecutiveOpenCount.current >= CONSECUTIVE_OPEN_THRESHOLD) {
					// Блокируем открытие на некоторое время при подозрении на множественные открытия
					blockOpeningUntil.current = now + BLOCK_DURATION;
					consecutiveOpenCount.current = 0;
					return;
				}
			} else {
				consecutiveOpenCount.current = 0;
			}

			// Очень строгая проверка на "чистый клик"
			if (touchDuration < MAX_CLICK_DURATION && moveDistance < MAX_MOVE_DISTANCE) {
				openFullscreen(index);
				lastTouchEndTime.current = now;
			}

			touchStart.current = null;
		}
	}, [wasScrolling, isScrolling, openFullscreen]);

	const handleCloseWithAnimation = useCallback(() => {
		isClosing.value = true;

		const targetPosition = imagePosition.value.y - screenHeight / 2 || 0;

		bgOpacity.value = withTiming(0, { duration: 700 });
		uiOpacity.value = withTiming(0, { duration: 200 });

		translateY.value = withTiming(targetPosition, {
			duration: 500,
			easing: Easing.bezier(0.16, 1, 0.3, 1)
		});

		scale.value = withTiming(0.5, {
			duration: 500,
			easing: Easing.bezier(0.34, 1.56, 0.64, 1)
		});

		imageOpacity.value = withTiming(0, {
			duration: 500,
			easing: Easing.in(Easing.ease)
		}, () => {
			runOnJS(setFullscreenMode)(false);
			isClosing.value = false;
			scale.value = 1;
		});
	}, [screenHeight]);

	const handleFullscreenScroll = (event: any) => {
		const offsetX = event.nativeEvent.contentOffset.x;
		fullscreenScrollOffset.value = offsetX / screenWidth;
	};

	const gestureHandler = useAnimatedGestureHandler({
		onStart: (_, ctx: any) => {
			ctx.startY = translateY.value;
		},
		onActive: (event, ctx) => {
			if (event.translationY > 0) {
				translateY.value = ctx.startY + event.translationY;
				const progress = Math.min(translateY.value / 300, 1);
				bgOpacity.value = 1 - progress * 0.7;
				uiOpacity.value = 1 - progress;
			}
		},
		onEnd: (event) => {
			if (translateY.value > 150) {
				isClosing.value = true;

				const targetPosition = imagePosition.value.y - screenHeight / 2 || 0;

				bgOpacity.value = withTiming(0, { duration: 700 });
				uiOpacity.value = withTiming(0, { duration: 200 });

				translateY.value = withTiming(targetPosition, {
					duration: 500,
					easing: Easing.bezier(0.16, 1, 0.3, 1)
				});

				imageOpacity.value = withTiming(0, {
					duration: 500,
					easing: Easing.in(Easing.ease)
				}, () => {
					runOnJS(setFullscreenMode)(false);
					isClosing.value = false;
				});
			} else {
				translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
				bgOpacity.value = withSpring(1, { damping: 15, stiffness: 150 });
				uiOpacity.value = withSpring(1, { damping: 15, stiffness: 150 });
			}
		}
	});

	const animatedBackgroundStyle = useAnimatedStyle(() => {
		return {
			opacity: bgOpacity.value,
			backgroundColor: `rgba(0, 0, 0, ${interpolate(
				openingAnimation.value,
				[0, 1],
				[0, 1]
			)})`
		};
	});

	const animatedFullscreenStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateY: translateY.value },
			],
			opacity: interpolate(
				openingAnimation.value,
				[0, 0.5, 1],
				[0, 0.8, 1]
			)
		};
	});

	const animatedUIStyle = useAnimatedStyle(() => {
		return {
			opacity: uiOpacity.value,
			transform: [
				{
					translateY: interpolate(
						uiOpacity.value,
						[0, 1],
						[10, 0],
						Extrapolate.CLAMP
					)
				}
			]
		};
	});

	const animatedImageStyle = useAnimatedStyle(() => {
		return {
			opacity: imageOpacity.value
		};
	});

	const renderItem = useCallback(({ item, index }: { item: string; index: number; }) => {
		const processedUri = item.replace(/ /g, '+');

		if (errorIndexes.includes(index)) {
			return (
				<View style={[styles.slideContainer, { width: imagesWidth, backgroundColor: currentTheme.bg_200, justifyContent: 'center', alignItems: 'center' }]}>
					<EyesAnimation size={150} text='image_error' style={{ width: "100%", justifyContent: 'center', alignItems: 'center' }} />
				</View>
			);
		}

		return (
			<TouchableOpacity
				activeOpacity={1}
				style={[styles.slideContainer, { width: imagesWidth, backgroundColor: currentTheme.bg_200 }]}
				onPressIn={(e) => handleTouch(index, e, 'start')}
				onPressOut={(e) => handleTouch(index, e, 'end')}
				delayPressIn={0}
				delayPressOut={0}
			>
				<View style={[styles.imageBackground, { height }]}>
					<Image
						source={{ uri: processedUri }}
						style={[styles.backgroundImage, { height }]}
						blurRadius={25}
						onError={() => setErrorIndexes(prev => [...prev, index])}
					/>
				</View>
				<ImageZoom
					uri={processedUri}
					minScale={1}
					maxScale={3}
					onInteractionStart={() => handleZoomChange(index, true)}
					onInteractionEnd={() => handleZoomChange(index, false)}
					style={[
						styles.zoomableView,
						{
							width: imagesWidth,
							height: height
						}
					]}
					onError={() => setErrorIndexes(prev => [...prev, index])}
				/>
			</TouchableOpacity>
		);
	}, [screenWidth, height, handleZoomChange, currentTheme, imagesWidth, handleTouch]);

	const renderFullscreenItem = useCallback(({ item, index }: { item: string; index: number; }) => {
		const processedUri = item.replace(/ /g, '+');

		if (errorIndexes.includes(index)) {
			return (
				<View style={[styles.fullscreenSlide, { width: "100%", justifyContent: 'center', alignItems: 'center' }]}>
					<EyesAnimation style={{ width: "100%", justifyContent: 'center', alignItems: 'center' }} size={150} text='image_error' />
				</View>
			);
		}

		return (
			<View style={[styles.fullscreenSlide, { width: screenWidth }]}>
				<Animated.View style={[animatedImageStyle, { width: '100%', height: '100%' }]}>
					<ImageZoom
						uri={processedUri}
						minScale={0.5}
						maxScale={3}
						style={styles.fullscreenImage}
						onError={() => setErrorIndexes(prev => [...prev, index])}
					/>
				</Animated.View>
			</View>
		);
	}, [screenWidth, animatedImageStyle]);

	const renderPaginationDots = () => {
		if (images.length <= 7) {
			return images.map((_, index) => (
				<AnimatedDot
					key={index}
					index={index}
					scrollValue={scrollOffset}
					currentIndex={currentIndex}
					currentTheme={currentTheme}
				/>
			));
		} else {
			return (
				<View style={styles.paginationContainer}>
					<Animated.View style={[styles.paginationInner, paginationIndicatorContainerStyle]}>
						{images.map((_, index) => (
							<AnimatedDot
								key={index}
								index={index}
								scrollValue={scrollOffset}
								currentIndex={currentIndex}
								currentTheme={currentTheme}
							/>
						))}
					</Animated.View>
				</View>
			);
		}
	};

	const renderFullscreenImage = () => {
		if (!fullscreenMode) return null;

		return (
			<Modal
				visible={fullscreenMode}
				transparent={true}
				animationType="none" // Используем собственную анимацию
				onRequestClose={handleCloseWithAnimation}
				hardwareAccelerated={true}
			>
				<Animated.View style={[styles.fullscreenBackground, animatedBackgroundStyle]}>
					<PanGestureHandler onGestureEvent={gestureHandler}>
						<Animated.View style={[styles.fullscreenContainer, animatedFullscreenStyle]}>
							<FlatList
								data={images}
								renderItem={renderFullscreenItem}
								horizontal
								pagingEnabled
								initialScrollIndex={fullscreenIndex}
								getItemLayout={(_, index) => ({
									length: screenWidth,
									offset: screenWidth * index,
									index,
								})}
								showsHorizontalScrollIndicator={false}
								keyExtractor={(_, index) => `fullscreen-${index}`}
								onViewableItemsChanged={({ viewableItems }) => {
									if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
										const index = viewableItems[0].index;
										if (typeof index === 'number') {
											setFullscreenIndex(index);
										}
									}
								}}
								viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
								onScroll={handleFullscreenScroll}
								scrollEventThrottle={16}
								removeClippedSubviews={true}
								maxToRenderPerBatch={3}
								windowSize={5}
							/>

							<Animated.View style={[styles.closeButtonContainer, animatedUIStyle]}>
								<TouchableOpacity
									style={styles.closeButton}
									onPress={handleCloseWithAnimation}
								>
									<View style={styles.closeButtonInner}>
										<View style={[styles.closeButtonLine, { transform: [{ rotate: '45deg' }] }]} />
										<View style={[styles.closeButtonLine, { transform: [{ rotate: '-45deg' }] }]} />
									</View>
								</TouchableOpacity>
							</Animated.View>

							{images.length > 1 && (
								<Animated.View style={[styles.fullscreenPagination, animatedUIStyle]}>
									{renderFullscreenPaginationDots()}
								</Animated.View>
							)}
						</Animated.View>
					</PanGestureHandler>
				</Animated.View>
			</Modal>
		);
	};

	const renderFullscreenPaginationDots = () => {
		if (images.length <= 7) {
			return images.map((_, index) => (
				<AnimatedDot
					key={`fullscreen-dot-${index}`}
					index={index}
					scrollValue={fullscreenScrollOffset}
					currentIndex={fullscreenIndex}
					currentTheme={currentTheme}
					isFullscreen={true}
				/>
			));
		} else {
			return (
				<View style={styles.paginationContainer}>
					<Animated.View style={[styles.paginationInner, indicatorContainerStyle]}>
						{images.map((_, index) => (
							<AnimatedDot
								key={`fullscreen-dot-${index}`}
								index={index}
								scrollValue={fullscreenScrollOffset}
								currentIndex={fullscreenIndex}
								currentTheme={currentTheme}
								isFullscreen={true}
							/>
						))}
					</Animated.View>
				</View>
			);
		}
	};

	useEffect(() => {
		if (!fullscreenMode) {
			// Сбрасываем значения только если не в процессе закрытия
			if (!isClosing.value) {
				translateY.value = 0;
				bgOpacity.value = 1;
				uiOpacity.value = 1;
				imageOpacity.value = 1;
			}
		}
	}, [fullscreenMode]);

	return (
		<Box
			fD='column'
			gap={10}
		>
			<View style={[styles.container, { height }]}>
				<FlatList
					ref={flatListRef}
					data={images}
					renderItem={renderItem}
					horizontal
					pagingEnabled
					bounces={false}
					showsHorizontalScrollIndicator={false}
					keyExtractor={(_, index) => index.toString()}
					onViewableItemsChanged={onViewableItemsChanged}
					viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
					getItemLayout={(_, index) => ({
						length: screenWidth,
						offset: screenWidth * index,
						index,
					})}
					snapToInterval={screenWidth}
					snapToAlignment="start"
					decelerationRate="fast"
					onScroll={handleScroll}
					onScrollBeginDrag={handleScrollBeginDrag}
					onScrollEndDrag={handleScrollEndDrag}
					scrollEventThrottle={16}
					scrollEnabled={!zoomEnabled[currentIndex]}
				/>
			</View>
			<Box
				style={styles.bottom}
				bgColor={currentTheme.bg_200}
				centered
			>
				{images.length > 1 && (
					<View style={styles.pagination}>
						{renderPaginationDots()}
					</View>
				)}
			</Box>
			{renderFullscreenImage()}
		</Box>
	);
});

export const ImageSwiper = React.memo(ImageSwiperComponent, (prevProps, nextProps) => {
	return (
		prevProps.images.length === nextProps.images.length &&
		prevProps.images.every((img, idx) => img === nextProps.images[idx]) &&
		prevProps.height === nextProps.height &&
		prevProps.imageWidth === nextProps.imageWidth
	);
});

const styles = StyleSheet.create({
	paginationDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	bottom: {
		width: '100%',
	},
	container: {
		position: 'relative',
		width: '100%',
	},
	slideContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	zoomableView: {
		width: '100%',
		height: '100%',
		overflow: 'hidden',
	},
	imageContainer: {
		width: '100%',
		height: '100%',
		overflow: 'hidden',
	},
	imageWrapper: {
		width: '100%',
		height: '100%',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	pagination: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 3,
	},
	paginationContainer: {
		width: 63,
		height: 10,
		overflow: 'hidden',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	paginationInner: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		gap: 3,
		paddingLeft: 3,
	},
	dotCurrent: {
		width: 5.5,
		height: 5.5,
		borderRadius: 3,
	},
	dotNear: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	dotFar: {
		width: 5,
		height: 5,
		borderRadius: 3,
	},
	dotFarthest: {
		width: 4,
		height: 4,
		borderRadius: 2,
	},
	imageBackground: {
		position: 'absolute',
		width: '100%',
		overflow: 'hidden',
	},
	backgroundImage: {
		width: '100%',
		position: 'absolute',
		opacity: 0.5,
	},
	fullscreenBackground: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#000',
	},
	fullscreenContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		height: '100%',
	},
	fullscreenSlide: {
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	fullscreenImage: {
		width: '100%',
		height: '100%',
	},
	closeButtonContainer: {
		position: 'absolute',
		top: 0,
		right: 0,
		zIndex: 10,
	},
	closeButton: {
		position: 'relative',
		top: 40,
		right: 20,
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeButtonInner: {
		width: 24,
		height: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeButtonLine: {
		position: 'absolute',
		width: 20,
		height: 2,
		backgroundColor: '#fff',
	},
	fullscreenPagination: {
		position: 'absolute',
		bottom: 40,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
	},
});