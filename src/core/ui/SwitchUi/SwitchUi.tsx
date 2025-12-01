import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useRef } from 'react';
import {
	Pressable,
	StyleProp,
	StyleSheet,
	ViewStyle
} from 'react-native';
import Animated, {
	Easing,
	interpolate,
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming
} from 'react-native-reanimated';

export interface SwitchUiProps {
	isOpen?: boolean;
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
	duration?: number;
	onBg?: string;
	offBg?: string;
	trackWidth?: number;
	trackHeight?: number;
	trackPadding?: number;
	useSpring?: boolean;
}

export const SwitchUi = observer(({
	isOpen = false,
	onPress = () => { },
	style,
	duration = 250,
	onBg = themeStore.currentTheme.primary_100,
	offBg = themeStore.currentTheme.btn_bg_300,
	trackWidth = 50,
	trackHeight = 30,
	trackPadding = 4,
	useSpring: shouldUseSpring = false,
}: SwitchUiProps) => {
	const isFirstRender = useRef(true);
	const height = useSharedValue(trackHeight - trackPadding * 2);
	const width = useSharedValue(trackWidth - trackPadding * 2);
	const value = useSharedValue(isOpen ? 1 : 0);

	const thumbSize = trackHeight - trackPadding * 2;
	const maxTranslateX = trackWidth - trackPadding * 2 - thumbSize;

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		const targetValue = isOpen ? 1 : 0;

		if (shouldUseSpring) {
			value.value = withSpring(targetValue, {
				damping: 20,
				stiffness: 180,
				mass: 0.8,
				overshootClamping: true,
			});
		} else {
			value.value = withTiming(targetValue, {
				duration,
				easing: Easing.inOut(Easing.ease),
			});
		}
	}, [isOpen, duration, shouldUseSpring]);

	const trackAnimatedStyle = useAnimatedStyle(() => {
		const color = interpolateColor(
			value.value,
			[0, 1],
			[offBg, onBg]
		);

		return {
			backgroundColor: color,
		};
	}, [offBg, onBg]);

	const thumbAnimatedStyle = useAnimatedStyle(() => {
		const moveValue = interpolate(
			value.value,
			[0, 1],
			[0, maxTranslateX]
		);

		return {
			transform: [{ translateX: moveValue }],
		};
	}, [maxTranslateX]);

	const switchStyles = useMemo(() => StyleSheet.create({
		track: {
			alignItems: 'flex-start',
			justifyContent: 'center',
			width: trackWidth,
			height: trackHeight,
			padding: trackPadding,
			borderRadius: trackHeight / 2,
			overflow: 'hidden',
		},
		thumb: {
			width: thumbSize,
			height: thumbSize,
			backgroundColor: 'white',
			borderRadius: thumbSize / 2,
			shadowColor: '#000',
			shadowOffset: {
				width: 0,
				height: 2,
			},
			shadowOpacity: 0.25,
			shadowRadius: 3.84,
			elevation: 5,
		},
	}), [trackWidth, trackHeight, trackPadding, thumbSize]);

	const handleLayout = (e: any) => {
		const layoutHeight = e.nativeEvent.layout.height;
		const layoutWidth = e.nativeEvent.layout.width;

		if (layoutHeight > 0 && layoutWidth > 0) {
			height.value = layoutHeight;
			width.value = layoutWidth;
		}
	};

	return (
		<Pressable onPress={onPress} hitSlop={8}>
			<Animated.View
				onLayout={handleLayout}
				style={[switchStyles.track, style, trackAnimatedStyle]}>
				<Animated.View
					style={[switchStyles.thumb, thumbAnimatedStyle]}
				/>
			</Animated.View>
		</Pressable>
	);
});