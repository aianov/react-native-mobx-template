import { Box, CleverImage, MainText } from '@core/ui';
import { themeStore } from '@theme/stores';
import { haptics } from '@utils/haptics';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { defaultNotifierImage } from './NotifierContext';
import { MAX_VISIBLE_NOTIFICATIONS, NOTIFIER_SPRING_CONFIG, STACK_OFFSET, STACK_SCALE_FACTOR } from './constants';
import { NotificationItemProps } from './types';

const NotificationItemComponent = observer(({ notification, onHide, index, totalCount }: NotificationItemProps) => {
	const { currentTheme } = themeStore;

	const insets = useSafeAreaInsets();
	const translateY = useSharedValue(-200);
	const gestureTranslateY = useSharedValue(0);
	const startY = useSharedValue(0);
	const scale = useSharedValue(1);
	const animatedIndex = useSharedValue(index);

	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		animatedIndex.value = withSpring(index, NOTIFIER_SPRING_CONFIG);
	}, [index]);

	useEffect(() => {
		translateY.value = withSpring(0, NOTIFIER_SPRING_CONFIG);

		if (index === 0) {
			const duration = notification.duration ?? 5000;
			if (duration > 0) {
				timeoutRef.current = setTimeout(() => {
					hideWithAnimation();
				}, duration);
			}
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (longPressTimeoutRef.current) {
				clearTimeout(longPressTimeoutRef.current);
			}
		};
	}, [index]);

	const hideWithAnimation = useCallback(() => {
		translateY.value = withTiming(-200, { duration: 250 }, (finished) => {
			if (finished) {
				runOnJS(onHide)();
			}
		});
	}, [onHide]);

	const handlePress = useCallback(() => {
		if (notification.onPress) {
			notification.onPress();
		}
		if (notification.hideOnPress !== false) {
			hideWithAnimation();
		}
	}, [notification.onPress, notification.hideOnPress, hideWithAnimation]);

	const handleLongPress = useCallback(() => {
		if (notification.onLongPress) {
			haptics.light();
			notification.onLongPress();
		}
	}, [notification.onLongPress]);

	const panGesture = Gesture.Pan()
		.enabled(index === 0)
		.onStart(() => {
			startY.value = gestureTranslateY.value;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		})
		.onUpdate((event) => {
			if (event.translationY < 0) {
				gestureTranslateY.value = startY.value + event.translationY;
			}
		})
		.onEnd((event) => {
			const shouldDismiss = event.translationY < -50 || event.velocityY < -500;

			if (shouldDismiss) {
				runOnJS(onHide)();
				gestureTranslateY.value = withTiming(-200, { duration: 250 });
			} else {
				gestureTranslateY.value = withSpring(0, NOTIFIER_SPRING_CONFIG);
				const duration = notification.duration ?? 5000;
				if (duration > 0) {
					timeoutRef.current = setTimeout(() => {
						hideWithAnimation();
					}, duration);
				}
			}
		});

	const longPressGesture = Gesture.LongPress()
		.minDuration(notification.longPressDuration ?? 500)
		.onBegin(() => {
			'worklet';
			if (notification.onLongPress) {
				const targetScale = notification.longPressScale ?? 0.92;
				scale.value = withTiming(targetScale, { duration: notification.longPressDuration ?? 500 });
			}
		})
		.onStart(() => {
			'worklet';
			if (notification.onLongPress) {
				scale.value = withSpring(1, NOTIFIER_SPRING_CONFIG);
				runOnJS(handleLongPress)();
			}
		})
		.onFinalize(() => {
			'worklet';
			scale.value = withSpring(1, NOTIFIER_SPRING_CONFIG);
		});

	const tapGesture = Gesture.Tap()
		.maxDuration(notification.onLongPress ? (notification.longPressDuration ?? 500) - 50 : 250)
		.onStart(() => {
			'worklet';
			const targetScale = notification.tapScale ?? 0.98;
			scale.value = withTiming(targetScale, { duration: 100 });
		})
		.onEnd(() => {
			'worklet';
			scale.value = withSpring(1, { ...NOTIFIER_SPRING_CONFIG, damping: 15 });
			runOnJS(handlePress)();
		})
		.onFinalize(() => {
			'worklet';
			scale.value = withSpring(1, NOTIFIER_SPRING_CONFIG);
		});

	const composed = notification.onLongPress
		? Gesture.Exclusive(panGesture, Gesture.Simultaneous(longPressGesture, tapGesture))
		: Gesture.Race(panGesture, tapGesture);

	const animatedStyle = useAnimatedStyle(() => {
		const totalTranslateY = translateY.value + gestureTranslateY.value;

		const stackOffset = animatedIndex.value * STACK_OFFSET;
		const stackScale = Math.pow(STACK_SCALE_FACTOR, Math.min(animatedIndex.value, MAX_VISIBLE_NOTIFICATIONS - 1));

		const opacity = animatedIndex.value < MAX_VISIBLE_NOTIFICATIONS ? 1 : 0;

		return {
			transform: [
				{ translateY: totalTranslateY + stackOffset },
				{ scale: scale.value * stackScale },
			],
			opacity,
			zIndex: 99999 - index,
		};
	});

	return (
		<GestureDetector gesture={composed}>
			<Animated.View
				style={[
					s.notificationContainer,
					{
						paddingTop: insets.top + 8,
					},
					animatedStyle,
				]}
			>
				{notification.Component ? (
					<notification.Component
						{...notification.componentProps}
						title={notification.title}
						description={notification.description}
					/>
				) : (
					<Box
						style={[
							s.defaultNotification,
							{
								backgroundColor: currentTheme.bg_300 as string,
								shadowColor: currentTheme.border_100,
							}
						]}
					>
						<View style={s.notificationContent}>
							{(notification.componentProps?.imageSource || defaultNotifierImage) && (
								<CleverImage
									source={notification.componentProps?.imageSource || defaultNotifierImage}
									style={s.notificationImage}
								/>
							)}
							<View style={s.notificationTextContainer}>
								{notification.title && (
									<MainText
										fontWeight='600'
										px={15}
										numberOfLines={1}
									>
										{notification.title}
									</MainText>
								)}
								{notification.description && (
									<MainText
										px={13}
										numberOfLines={2}
									>
										{notification.description}
									</MainText>
								)}
							</View>
						</View>
					</Box>
				)}
			</Animated.View>
		</GestureDetector>
	);
});

const s = StyleSheet.create({
	defaultNotification: {
		borderRadius: 10,
		padding: 12,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
		width: '100%' as const,
	},
	notificationImage: {
		width: 45,
		height: 45,
		borderRadius: 1000000,
	},
	notificationContainer: {
		position: 'absolute',
		width: '100%',
	},
	notificationContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	notificationTextContainer: {
		flex: 1,
	}
});

export const NotificationItem = React.memo(NotificationItemComponent, (prevProps, nextProps) => {
	return (
		prevProps.notification.id === nextProps.notification.id &&
		prevProps.index === nextProps.index &&
		prevProps.totalCount === nextProps.totalCount
	);
});